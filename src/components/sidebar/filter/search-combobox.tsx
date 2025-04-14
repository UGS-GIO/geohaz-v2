import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty, CommandSeparator } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureCollection, Geometry, GeoJsonProperties, Feature } from 'geojson';
import { useDebounce } from 'use-debounce';
interface PostgRESTConfig {
    url: string;
    params?: Params;
    functionName?: string;
    searchTerm?: string;
    headers?: Record<string, string>;
    sourceName?: string;
}

type Params =
    | { displayField: string; targetField: string; select?: string }
    | { displayField: string; select: string; targetField?: never }
    | { displayField: string; searchKeyParam: string, targetField?: never, select?: never };

export interface SearchConfig {
    postgrest: PostgRESTConfig;
    placeholder?: string;
    buttonWidth?: string;
}

export type ExtendedGeometry = Geometry & {
    crs?: {
        properties: {
            name: string;
        };
        type: string;
    };
};

interface SearchComboboxProps {
    config: SearchConfig[];
    onSearchSelect?: (
        feature: Feature<ExtendedGeometry, GeoJsonProperties> | null
    ) => void;
    className?: string;
}

/**
 * SearchCombobox component for searching features in multiple data sources.
 * It allows users to filter results based on a search term and select a specific feature.
 */
function SearchCombobox({
    config,
    onSearchSelect,
    className,
}: SearchComboboxProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(''); // Stores the display value of the selected item trigger
    const [search, setSearch] = useState(''); // Input search text
    const [debouncedSearch] = useDebounce(search, 300);
    const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(null);

    // Get the PostgREST queries for each source
    // TODO: refactor this to make more generic, and only care about it being a rest api. name it getRESTQueries
    const getPostgRESTQueries = () => {
        return config.map((source, index) => {
            const { postgrest } = source;

            // Type useQuery to expect FeatureCollection from geojson
            return useQuery<FeatureCollection<ExtendedGeometry, GeoJsonProperties>, Error>({
                queryKey: ['search-features', postgrest.url, postgrest.functionName, debouncedSearch, index],
                queryFn: async (): Promise<FeatureCollection<ExtendedGeometry, GeoJsonProperties>> => {
                    const params = cleanParams(postgrest.params);
                    const urlParams = new URLSearchParams();
                    let apiUrl = '';

                    const headers: HeadersInit = postgrest.headers || {};

                    // Build URL (Function or Table/View) - Using logic that expects FeatureCollection response
                    if (postgrest.functionName) {
                        const functionUrl = `${postgrest.url}/rpc/${postgrest.functionName}`;
                        const searchTerm = debouncedSearch ? `%${debouncedSearch}%` : '';
                        const searchTermParamName = postgrest.searchTerm;
                        if (!searchTermParamName) {
                            console.error(`Function ${postgrest.functionName} in source ${index} is missing 'searchTerm' parameter.`);
                            throw new Error(`Missing searchTerm parameter for function ${postgrest.functionName}`);
                        }
                        urlParams.set(searchTermParamName, searchTerm);
                        apiUrl = `${functionUrl}?${urlParams.toString()}`;
                    } else {
                        // Table/View Query URL
                        apiUrl = `${postgrest.url}`;
                        const searchTerm = debouncedSearch ? `%${debouncedSearch}%` : '';

                        if ('targetField' in params && params.targetField && searchTerm) {
                            urlParams.set(params.targetField, `ilike.${searchTerm}`);
                        }

                        // CRITICAL: Ensure geometry column is selected for GeoJSON output
                        if ('select' in params && params.select) {
                            // If select is provided, assume it includes the geometry column
                            urlParams.set('select', params.select);
                        }
                        urlParams.set('limit', '100');
                        apiUrl = `${apiUrl}?${urlParams.toString()}`;
                    }

                    // Fetch
                    const response = await fetch(apiUrl, { method: 'GET', headers });

                    // Error Handling
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`API Error (${response.status}) from ${apiUrl}: ${errorText}`);
                        throw new Error(`Network response was not ok (${response.status})`);
                    }

                    // Parse JSON
                    const data = await response.json();

                    // Validate and Assert Type
                    if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
                        return data as FeatureCollection<Geometry, GeoJsonProperties>;
                    } else {
                        console.warn(`API response from ${apiUrl} was not a valid FeatureCollection:`, data);
                        return { type: "FeatureCollection", features: [] }; // Return empty FC
                    }
                },
                enabled: !!debouncedSearch && debouncedSearch.trim().length > 2,
                refetchOnWindowFocus: false,
                retry: 1,
                staleTime: 300000, // 5 minutes
                gcTime: 600000,    // 10 minutes
            });
        });
    };

    // Helper function to clean params (keep simple version)
    const cleanParams = (params: Params | undefined): Partial<Params> => {
        return params || {};
    };

    // handleSelect to pass FeatureCollection ---
    const handleSelect = (
        currentValue: string, // The display value of the item *clicked*
        sourceIndex: number,
        isSourceOnly: boolean = false,
        featureIndex?: number
    ) => {
        if (isSourceOnly) {
            setActiveSourceIndex(sourceIndex === activeSourceIndex ? null : sourceIndex);
            setValue(''); // Clear display value
            return;
        }


        // Get the FeatureCollection associated with the current search for this source
        const currentFeatureCollection = queryResults[sourceIndex]?.data;
        const featureToReturn = currentFeatureCollection?.features[featureIndex ?? 0];

        // Set the input display value to the item the user clicked
        setValue(currentValue);
        setOpen(false);

        // Pass the entire FeatureCollection back to the parent component
        onSearchSelect?.(featureToReturn);

    };

    function getSourceDisplayName(source: SearchConfig): string {
        if (source.postgrest.sourceName) return source.postgrest.sourceName;
        if (source.postgrest.functionName) return formatName(source.postgrest.functionName);
        // Check if params exists before accessing targetField
        if (source.postgrest.params && 'targetField' in source.postgrest.params && source.postgrest.params.targetField) {
            return formatName(source.postgrest.params.targetField);
        }
        const urlParts = source.postgrest.url.split('/');
        return formatName(urlParts[urlParts.length - 1] || 'Unknown Source');
    }

    function formatName(name: string): string {
        return name.replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
            .join(' ').trim(); // Trim potential leading/trailing spaces
    }

    // Get the results for each PostgREST source
    const queryResults = getPostgRESTQueries().map((query, index) => {
        const { data, isLoading, error } = query;
        return {
            // Default to empty FeatureCollection if data is initially undefined
            data: data ?? { type: "FeatureCollection", features: [] } as FeatureCollection,
            isLoading,
            error,
            sourceName: config[index].postgrest.sourceName || getSourceDisplayName(config[index])
        };
    });

    // set placeholder text based on active source index
    const getPlaceholderText = () => {
        if (activeSourceIndex !== null) {
            // Ensure queryResults[activeSourceIndex] exists before accessing sourceName
            return `Search in ${queryResults[activeSourceIndex]?.sourceName ?? 'selected source'}...`;
        }
        const sourceNames = config.map(c => c.postgrest.sourceName || getSourceDisplayName(c)).join(' or ');
        return `Search ${sourceNames}...`;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(className, 'justify-between')}
                    aria-label={`Search ${getPlaceholderText()}`}
                >
                    <span className="truncate">
                        {value || (activeSourceIndex !== null ?
                            `Search in ${queryResults[activeSourceIndex]?.sourceName}...` :
                            'Search...')}
                    </span>
                    {queryResults.some(result => result.isLoading) && <Loader2 className="ml-2 h-4 w-4 animate-spin flex-shrink-0" />}
                    {!queryResults.some(result => result.isLoading) && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" >
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={getPlaceholderText()}
                        className="h-9"
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        {/* Data Sources Filter Section */}
                        <CommandGroup heading="Filter by Data Source">
                            {config.map((source, idx) => {

                                return (
                                    <CommandItem
                                        key={`source-${idx}`}
                                        value={`##source-${idx}`} // Prefix value
                                        onSelect={() => handleSelect(`##source-${idx}`, idx, true)}
                                        className="cursor-pointer" // Style from your version
                                    >
                                        {source.postgrest.sourceName || getSourceDisplayName(source)}
                                        <Check className={cn('ml-auto h-4 w-4', activeSourceIndex === idx ? 'opacity-100' : 'opacity-0')} />
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>

                        <CommandSeparator />

                        {/* --- Results Rendering Logic */}
                        {queryResults.map((sourceResults, sourceIndex) => {
                            // Filter sources if activeSourceIndex is set
                            if (activeSourceIndex !== null && activeSourceIndex !== sourceIndex) {
                                return null;
                            }

                            const displayField = config[sourceIndex].postgrest.params?.displayField;
                            if (!displayField) {
                                return <CommandItem key={`error-config-${sourceIndex}`} disabled className="text-destructive">Config Error for {sourceResults.sourceName}</CommandItem>;
                            }

                            // console.log('Source Results:', sourceResults);


                            // Loading/Error/Empty States
                            if (sourceResults.isLoading && search.trim().length > 2) {
                                return <CommandItem key={`loading-${sourceIndex}`} disabled>Loading {sourceResults.sourceName}...</CommandItem>;
                            }
                            if (sourceResults.error) {
                                return <CommandItem key={`error-fetch-${sourceIndex}`} disabled className="text-destructive">Error loading {sourceResults.sourceName}</CommandItem>;


                            }
                            if (search.trim().length > 2 && sourceResults.data?.features?.length === 0) {
                                // console.log(search.trim().length > 2 && sourceResults.data?.features?.length === 0);
                                return <CommandEmpty key={`empty-${sourceIndex}`}>No results found in {sourceResults.sourceName}.</CommandEmpty>;
                            }
                            if (!sourceResults.data?.features?.length) {
                                return null; // Don't render group if no features (e.g., before search starts)
                            }

                            // Render the group heading and feature items
                            return (
                                <React.Fragment key={sourceIndex}>
                                    {sourceIndex > 0 && activeSourceIndex === null && <CommandSeparator />}
                                    <CommandGroup heading={sourceResults.sourceName}>
                                        {sourceResults.data.features.map((feature: Feature<Geometry, GeoJsonProperties>, featureIndex: number) => {
                                            const properties = feature.properties || {};
                                            const displayValue = String(properties[displayField] ?? '');

                                            if (!displayValue) {
                                                console.warn(`Feature (index ${featureIndex}, id ${feature.id ?? 'N/A'}) in source ${sourceIndex} missing displayField '${displayField}'.`);
                                                console.log('properties:', properties);
                                                return null;
                                            }

                                            return (
                                                <CommandItem
                                                    key={feature.id ?? `${displayValue}-${featureIndex}-${sourceIndex}`}
                                                    value={displayValue}
                                                    onSelect={() => handleSelect(displayValue, sourceIndex, false, featureIndex)}
                                                    className="cursor-pointer"
                                                >
                                                    <span className="text-wrap">{displayValue}</span> {/* Style from your version */}
                                                    <Check className={cn('ml-auto h-4 w-4', value === displayValue ? 'opacity-100' : 'opacity-0')} />
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </React.Fragment>
                            );
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export { SearchCombobox };