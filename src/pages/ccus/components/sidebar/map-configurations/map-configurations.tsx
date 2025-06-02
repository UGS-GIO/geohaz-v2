import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

import { BackToMenuButton } from '@/components/custom/back-to-menu-button';
import { useMapCoordinates } from '@/hooks/use-map-coordinates';
import { MapContext } from '@/context/map-provider';
import WMSLayer from "@arcgis/core/layers/WMSLayer.js";
import { findLayerByTitle } from '@/lib/mapping-utils';
import { wellWithTopsWMSTitle } from '@/pages/ccus/data/layers';

const findAndApplyWMSFilter = (
    mapInstance: __esri.Map | null | undefined,
    layerTitle: string,
    cqlFilter: string | null
) => {
    if (!mapInstance) {
        console.warn("[DEMO] Map instance is not available. Cannot apply filter.");
        return;
    }
    const layer = findLayerByTitle(mapInstance, layerTitle);

    if (layer) {
        if (layer.type === 'wms') {
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
                console.log(`[DEMO] Layer "${layerTitle}" refreshed with CQL: ${cqlFilter}`);
            }
        } else {
            console.warn(`[DEMO] Layer "${layerTitle}" found, but it's not a WMS layer. Type: ${layer.type}`);
        }
    } else {
        console.warn(`[DEMO] Layer "${layerTitle}" not found.`);
    }
};

type YesNoAll = "yes" | "no" | "all";

const wellsHasCoreFilterConfig = {
    label: "Cores/Cuttings Available?",
    attribute: "hascore",
    options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }, { value: "all", label: "All" }] as { value: YesNoAll; label: string }[],
    trueValue: 'True',
    falseValue: 'False'
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
    value: string;
    label: string;
}

function MapConfigurations() {
    const { setIsDecimalDegrees, locationCoordinateFormat } = useMapCoordinates();
    const { map } = useContext(MapContext);
    const navigate = useNavigate({ from: '/ccus' });
    const search = useSearch({ from: '/ccus/' })

    const [hasCoreFilter, setHasCoreFilter] = useState<YesNoAll>(search.core ?? "all");
    const [selectedFormationColumn, setSelectedFormationColumn] = useState<string>(search.formation ?? "");
    const [formationMappings, setFormationMappings] = useState<FormationMapping[]>([]);
    const [formationDropdownOpen, setFormationDropdownOpen] = useState(false);
    const [isLoadingFormations, setIsLoadingFormations] = useState(false);

    useEffect(() => {
        const fetchFormationMappings = async () => {
            setIsLoadingFormations(true);
            const { postgrestUrl, tableName, fieldsToSelect, displayField, columnNameField, acceptProfile } = formationNameMappingConfig;
            const url = `${postgrestUrl}/${tableName}?select=${fieldsToSelect}`;
            try {
                const response = await fetch(url, {
                    headers: {
                        "Accept-Profile": acceptProfile,
                        "Accept": "application/json",
                        "Cache-Control": "no-cache",
                    },
                });
                if (!response.ok)
                    throw new Error(`HTTP error fetching formation mappings! status: ${response.status}`);
                const data: Array<Record<string, any>> = await response.json();

                const uniqueMappings: FormationMapping[] = [];
                const seenAliases = new Set<string>();

                data.forEach(item => {
                    const alias = item[displayField];
                    const columnName = item[columnNameField];
                    if (alias && columnName && !seenAliases.has(alias)) {
                        uniqueMappings.push({ value: columnName, label: alias });
                        seenAliases.add(alias);
                    }
                });
                setFormationMappings(uniqueMappings.sort((a, b) => a.label.localeCompare(b.label)));
            } catch (error) {
                console.error("Failed to fetch formation mappings:", error);
                setFormationMappings([]);
            }
            finally {
                setIsLoadingFormations(false);
            }
        };
        fetchFormationMappings();
    }, []);

    // Update decimal degrees state based on search parameter
    useEffect(() => {
        if (search.coordFmt && setIsDecimalDegrees) {
            setIsDecimalDegrees(search.coordFmt === 'dd');
        }
    }, [setIsDecimalDegrees, search.coordFmt]);

    useEffect(() => {
        if (!map) return;
        const wellFilterParts: string[] = [];
        const { attribute: hasCoreAttr, trueValue: hcTrue, falseValue: hcFalse } = wellsHasCoreFilterConfig;
        if (hasCoreFilter === "yes") {
            const value = typeof hcTrue === 'string' ? `'${hcTrue}'` : hcTrue;
            wellFilterParts.push(`${hasCoreAttr} = ${value}`);
        } else if (hasCoreFilter === "no") {
            const value = typeof hcFalse === 'string' ? `'${hcFalse}'` : hcFalse;
            wellFilterParts.push(`${hasCoreAttr} = ${value}`);
        }
        if (selectedFormationColumn) {
            wellFilterParts.push(`${selectedFormationColumn} IS NOT NULL`);
        }
        const combinedWellFilter = wellFilterParts.length > 0 ? wellFilterParts.join(' AND ') : null;
        findAndApplyWMSFilter(map, wellWithTopsWMSTitle, combinedWellFilter);
    }, [hasCoreFilter, selectedFormationColumn, map]);

    const handleCoordFormatChange = (value: string) => {
        const isDD = value === "Decimal Degrees";
        if (setIsDecimalDegrees) setIsDecimalDegrees(isDD);
        navigate({
            search: (prev) => ({ ...prev, coordFmt: isDD ? 'dd' : 'dms' }),
            replace: true,
        });
    };

    const handleHasCoreChange = (value: string) => {
        const newCoreValue = value as YesNoAll;
        setHasCoreFilter(newCoreValue);
        navigate({
            search: (prev) => ({ ...prev, core: newCoreValue === "all" ? undefined : newCoreValue }),
            replace: true,
        });
    };

    const handleFormationChange = (newFormationValue: string) => {
        setSelectedFormationColumn(newFormationValue);
        navigate({
            search: (prev) => ({ ...prev, formation: newFormationValue === "" ? undefined : newFormationValue }),
            replace: true,
        });
        setFormationDropdownOpen(false);
    };

    const coordFormatRadioValue = locationCoordinateFormat === "Decimal Degrees" ? "Decimal Degrees" : "Degrees, Minutes, Seconds";

    return (
        <>
            <BackToMenuButton />
            <div className='space-y-4 p-4 max-h-full overflow-y-auto'>
                <div className="mb-4"><h3 className="text-lg font-medium mb-2">Map Configurations</h3></div>
                <Card>
                    <CardHeader className="py-3 px-4"><CardTitle className="text-base">Location Coordinate Format</CardTitle></CardHeader>
                    <CardContent className="p-4">
                        <RadioGroup value={coordFormatRadioValue} onValueChange={handleCoordFormatChange} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div className="flex">
                                <RadioGroupItem value="Decimal Degrees" id="decimal-degrees" className="peer sr-only" />
                                <Label
                                    htmlFor="decimal-degrees"
                                    className="flex flex-1 items-center justify-center rounded-md border-2 border-transparent bg-popover p-3 text-center cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                                >
                                    Decimal Degrees
                                </Label>
                            </div>
                            <div className="flex">
                                <RadioGroupItem value="Degrees, Minutes, Seconds" id="dms" className="peer sr-only" />
                                <Label
                                    htmlFor="dms"
                                    className="flex flex-1 items-center justify-center rounded-md border-2 border-transparent bg-popover p-3 text-center cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground"
                                >
                                    Degrees, Minutes, Seconds
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Filters Card */}
                <Card>
                    <CardHeader className="py-3 px-4"><CardTitle className="text-base">Filter Wells Database (Demo)</CardTitle></CardHeader>
                    <CardContent className="p-4 space-y-4">

                        { /* Has Core Filter */}
                        <div>
                            <Label htmlFor="has-core-filter-group" className="text-sm font-medium text-muted-foreground mb-2 block">{wellsHasCoreFilterConfig.label}</Label>
                            <RadioGroup id="has-core-filter-group" value={hasCoreFilter} onValueChange={handleHasCoreChange} className="grid grid-cols-3 gap-2">
                                {wellsHasCoreFilterConfig.options.map(option => (
                                    <div className="flex" key={`hascore-${option.value}`}>
                                        <RadioGroupItem value={option.value} id={`hascore-filter-${option.value}`} className="peer sr-only" />
                                        <Label htmlFor={`hascore-filter-${option.value}`} className="flex flex-1 items-center justify-center rounded-md border-2 border-transparent bg-popover p-2 text-xs text-center cursor-pointer transition-colors hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground">{option.label}</Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                        <div>
                            <Label htmlFor="formation-present-combobox"
                                className="text-sm font-medium text-muted-foreground mb-2 block"
                            >
                                {formationNameMappingConfig.label}
                            </Label>
                            <Popover open={formationDropdownOpen} onOpenChange={setFormationDropdownOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        id="formation-present-combobox"
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={formationDropdownOpen}
                                        className="w-full justify-between text-xs h-9"
                                    >
                                        {selectedFormationColumn
                                            ? formationMappings.find((f) => f.value === selectedFormationColumn)?.label
                                            : "Select formation..."
                                        }
                                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search formation..." className="h-8 text-xs" />
                                        <CommandList>
                                            <CommandEmpty>{isLoadingFormations ? "Loading..." : "No formations found."}</CommandEmpty>
                                            <CommandGroup>
                                                <CommandItem
                                                    key="all-formations"
                                                    value=""
                                                    onSelect={() => handleFormationChange("")}
                                                    className="text-xs"
                                                >
                                                    <Check className={cn("mr-2 h-3 w-3", selectedFormationColumn === "" ? "opacity-100" : "opacity-0")} />
                                                    All Formations
                                                </CommandItem>
                                                {formationMappings.map((mapping) => (
                                                    <CommandItem
                                                        key={mapping.value} // geoserver column name
                                                        value={mapping.value} // geoserver column name
                                                        onSelect={(currentValue) => { // currentValue is the geoserver column name
                                                            handleFormationChange(currentValue === selectedFormationColumn ? "" : currentValue);
                                                        }}
                                                        className="text-xs"
                                                    >
                                                        <Check className={cn("mr-2 h-3 w-3", selectedFormationColumn === mapping.value ? "opacity-100" : "opacity-0")} />
                                                        {mapping.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default MapConfigurations;