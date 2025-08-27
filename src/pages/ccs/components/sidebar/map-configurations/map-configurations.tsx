import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BackToMenuButton } from '@/components/custom/back-to-menu-button';
import { useMapCoordinates } from '@/hooks/use-map-coordinates';
import { useMap } from '@/context/map-provider';
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";
import { findLayerByTitle } from '@/lib/map/utils';
import { wellWithTopsWMSTitle } from '@/pages/ccs/data/layers';
import { Badge } from '@/components/ui/badge';

export const findAndApplyWMSFilter = (
    mapInstance: __esri.Map | null | undefined,
    layerTitle: string,
    cqlFilter: string | null
) => {
    if (!mapInstance) return;
    const layer = findLayerByTitle(mapInstance, layerTitle);

    if (layer?.type === 'wms') {
        const wmsLayer = layer as WMSLayer;
        const newCustomParameters = { ...(wmsLayer.customParameters || {}) };
        if (cqlFilter) {
            newCustomParameters.cql_filter = cqlFilter;
        } else {
            delete newCustomParameters.cql_filter;
        }
        if (JSON.stringify(wmsLayer.customParameters) !== JSON.stringify(newCustomParameters)) {
            wmsLayer.customParameters = newCustomParameters;
            wmsLayer.refresh();
        }
    }
};

type YesNoAll = "yes" | "no" | "all";
const wellsHasCoreFilterConfig = {
    label: "Cores/Cuttings Available?",
    options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "all", label: "All" }] as const,
};

const formationNameMappingConfig = {
    label: "Formation Present",
    postgrestUrl: "https://postgrest-seamlessgeolmap-734948684426.us-central1.run.app",
    tableName: "view_wellswithtops_hascore",
    fieldsToSelect: "formation_alias,formation_name",
    displayField: "formation_alias",
    columnNameField: "formation_name",
    acceptProfile: "emp"
};

interface FormationMapping {
    value: string; // GeoServer column name (e.g., 'fm_greenriver')
    label: string; // user-friendly alias (e.g., 'Green River')
}

const fetchFormationData = async (): Promise<FormationMapping[]> => {
    const { postgrestUrl, tableName, fieldsToSelect, displayField, columnNameField, acceptProfile } = formationNameMappingConfig;
    const url = `${postgrestUrl}/${tableName}?select=${fieldsToSelect}`;
    const response = await fetch(url, {
        headers: {
            "Accept-Profile": acceptProfile,
            "Accept": "application/json"
        }
    });
    if (!response.ok) throw new Error(`HTTP error fetching formation mappings! status: ${response.status}`);
    const data: Array<Record<string, any>> = await response.json();
    const uniqueMappings = new Map<string, string>();
    data.forEach(item => {
        const alias = item[displayField];
        const columnName = item[columnNameField];
        if (alias && columnName && !uniqueMappings.has(alias)) {
            uniqueMappings.set(alias, columnName);
        }
    });
    return Array.from(uniqueMappings, ([label, value]) => ({ label, value })).sort((a, b) => a.label.localeCompare(b.label));
};

function MapConfigurations() {
    const { setIsDecimalDegrees } = useMapCoordinates();
    const { view } = useMap();
    const navigate = useNavigate({ from: '/ccs' });
    const search = useSearch({ from: '/ccs/' });

    // Move the formation data query to the parent component level
    // This ensures it loads immediately on page load
    const { data: formationMappings = [], isLoading: isFormationLoading, error: formationError } = useQuery({
        queryKey: ['formationMappings'],
        queryFn: fetchFormationData,
        staleTime: 1000 * 60 * 60,
    });

    // Parse formations as array from URL params
    const selectedFormations = useMemo(() => {
        if (!search.formations) return [];
        if (typeof search.formations === 'string') {
            return search.formations.split(',').filter(Boolean);
        }
        return Array.isArray(search.formations) ? search.formations : [];
    }, [search.formations]);

    // Parse formation operator from URL params (defaults to OR/false)
    const useAndOperator = useMemo(() => {
        return search.formation_operator === 'and';
    }, [search.formation_operator]);

    useEffect(() => {
        const filterFromSearchState = search.filters?.[wellWithTopsWMSTitle] ?? null;
        findAndApplyWMSFilter(view?.map, wellWithTopsWMSTitle, filterFromSearchState);
    }, [view, search.filters]);

    const handleCoordFormatChange = (value: 'dd' | 'dms') => {
        if (setIsDecimalDegrees) setIsDecimalDegrees(value === 'dd');
        navigate({
            search: (prev) => ({ ...prev, coordinate_format: value }),
            replace: true,
        });
    };

    const handleHasCoreChange = (value: YesNoAll) => {
        navigate({
            search: (prev) => ({ ...prev, core: value === "all" ? undefined : value }),
            replace: true,
        });
    };

    const handleFormationChange = (formations: string[]) => {
        navigate({
            search: (prev) => ({
                ...prev,
                formations: formations.length === 0 ? undefined : formations.join(',')
            }),
            replace: true,
        });
    };

    const handleFormationOperatorChange = (useAnd: boolean) => {
        navigate({
            search: (prev) => ({
                ...prev,
                formation_operator: useAnd ? 'and' : undefined // undefined defaults to OR
            }),
            replace: true,
        });
    };

    return (
        <>
            <BackToMenuButton />
            <div className='space-y-4 p-4 max-h-full overflow-y-auto'>
                <div className="mb-4">
                    <h3 className="text-lg font-medium">Map Configurations</h3>
                </div>

                <Card>
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-base">Location Coordinate Format</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <RadioGroup
                            value={search.coordinate_format ?? 'dd'}
                            onValueChange={handleCoordFormatChange}
                            className="grid grid-cols-2 gap-2"
                        >
                            <div className="flex">
                                <RadioGroupItem
                                    value="dd"
                                    id="dd-radio"
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor="dd-radio"
                                    className="flex flex-1 items-center justify-center rounded-md border-2 border-transparent bg-popover p-3 text-center cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                                >
                                    Decimal Degrees
                                </Label>
                            </div>
                            <div className="flex">
                                <RadioGroupItem
                                    value="dms"
                                    id="dms-radio"
                                    className="peer sr-only"
                                />
                                <Label
                                    htmlFor="dms-radio"
                                    className="flex flex-1 items-center justify-center rounded-md border-2 border-transparent bg-popover p-3 text-center cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                                >
                                    Degrees, Minutes, Seconds
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-base">Filter Wells Database</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <WellCoreFilter
                            value={search.core ?? 'all'}
                            onChange={handleHasCoreChange}
                        />
                        <WellFormationFilter
                            value={selectedFormations}
                            onChange={handleFormationChange}
                            mappings={formationMappings}
                            isLoading={isFormationLoading}
                            error={formationError}
                            useAndOperator={useAndOperator}
                            onOperatorChange={handleFormationOperatorChange}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

const WellCoreFilter = ({ value, onChange }: { value: YesNoAll, onChange: (value: YesNoAll) => void }) => (
    <div>
        <Label className="text-sm font-medium text-muted-foreground mb-2 block">
            {wellsHasCoreFilterConfig.label}
        </Label>
        <RadioGroup
            value={value}
            onValueChange={onChange}
            className="grid grid-cols-3 gap-2"
        >
            {wellsHasCoreFilterConfig.options.map(option => (
                <div key={option.value}>
                    <RadioGroupItem
                        value={option.value}
                        id={`hascore-filter-${option.value}`}
                        className="peer sr-only"
                    />
                    <Label
                        htmlFor={`hascore-filter-${option.value}`}
                        className="flex flex-1 items-center justify-center rounded-md border-2 border-transparent bg-popover p-2 text-xs text-center cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                    >
                        {option.label}
                    </Label>
                </div>
            ))}
        </RadioGroup>
    </div>
);

interface WellFormationFilterProps {
    value: string[];
    onChange: (value: string[]) => void;
    mappings: FormationMapping[];
    isLoading: boolean;
    error: Error | null;
    useAndOperator: boolean;
    onOperatorChange: (useAnd: boolean) => void;
}

const WellFormationFilter = ({
    value,
    onChange,
    mappings,
    isLoading,
    error,
    useAndOperator,
    onOperatorChange
}: WellFormationFilterProps) => {
    const [open, setOpen] = useState(false);

    const handleSelect = (formationValue: string) => {
        if (formationValue === "") {
            // Clear all selections
            onChange([]);
        } else {
            // Toggle selection
            const isSelected = value.includes(formationValue);
            if (isSelected) {
                onChange(value.filter(v => v !== formationValue));
            } else {
                onChange([...value, formationValue]);
            }
        }
        // Don't close the popover to allow multiple selections
        // setOpen(false);
    };

    const removeFormation = (formationValue: string) => {
        onChange(value.filter(v => v !== formationValue));
    };

    return (
        <div>
            <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                {formationNameMappingConfig.label}
            </Label>

            {/* OR/AND Toggle - only show when multiple formations are selected */}
            {value.length > 1 && (
                <div className="mb-3 flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <span className={cn("text-xs font-medium transition-colors",
                            !useAndOperator ? "text-primary" : "text-muted-foreground"
                        )}>
                            OR
                        </span>
                        <Switch
                            id="formation-operator-toggle"
                            checked={useAndOperator}
                            onCheckedChange={onOperatorChange}
                        />
                        <span className={cn("text-xs font-medium transition-colors",
                            useAndOperator ? "text-primary" : "text-muted-foreground"
                        )}>
                            AND
                        </span>
                    </div>
                    <Label
                        htmlFor="formation-operator-toggle"
                        className="text-xs text-muted-foreground cursor-pointer"
                    >
                        {useAndOperator ? "Wells must have all selected formations" : "Wells can have any selected formation"}
                    </Label>
                </div>
            )}

            {/* Selected formations display - now shows even while loading */}
            {value.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                    {value.map((formationValue, index) => {
                        // Find the label, or show the value if mappings haven't loaded yet
                        const label = mappings.find(m => m.value === formationValue)?.label || formationValue;
                        return (
                            <div key={formationValue} className="flex items-center">
                                {index > 0 && (
                                    <span className="text-xs text-muted-foreground mr-2">
                                        {useAndOperator ? 'AND' : 'OR'}
                                    </span>
                                )}
                                <Badge
                                    variant="default"
                                    className="cursor-pointer flex items-center"
                                    onClick={() => removeFormation(formationValue)}
                                >
                                    {label}
                                    <X className="ml-1 h-3 w-3 flex-shrink-0" />
                                </Badge>
                            </div>
                        );
                    })}
                </div>
            )}

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between text-xs h-9"
                    >
                        {value.length === 0
                            ? "Select formations..."
                            : `${value.length} formation${value.length === 1 ? '' : 's'} selected`
                        }
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                        <CommandInput
                            placeholder="Search formation..."
                            className="h-8 text-xs"
                        />
                        <CommandList>
                            <CommandEmpty>
                                {isLoading ? "Loading..." : error ? "Error loading data" : "No formations found."}
                            </CommandEmpty>
                            <CommandGroup>
                                <CommandItem
                                    value=""
                                    onSelect={() => handleSelect("")}
                                    className="text-xs"
                                >
                                    <Check className={cn("mr-2 h-3 w-3", value.length === 0 ? "opacity-100" : "opacity-0")} />
                                    Clear All Selections
                                </CommandItem>
                                {mappings.map(mapping => {
                                    const isSelected = value.includes(mapping.value);
                                    return (
                                        <CommandItem
                                            key={mapping.value}
                                            value={mapping.label}
                                            onSelect={() => handleSelect(mapping.value)}
                                            className="text-xs"
                                        >
                                            <Check className={cn("mr-2 h-3 w-3", isSelected ? "opacity-100" : "opacity-0")} />
                                            {mapping.label}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default MapConfigurations;