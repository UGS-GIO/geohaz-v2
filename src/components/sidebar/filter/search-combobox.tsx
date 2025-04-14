import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty, CommandSeparator } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureCollection, Geometry, GeoJsonProperties, Feature } from 'geojson';
import { featureCollection } from '@turf/helpers'; // Using turf helper
import { useDebounce } from 'use-debounce';

// --- Config & Type Interfaces ---
interface PostgRESTConfig {
    url: string;
    params?: Params;
    functionName?: string;
    searchTerm?: string; // Param name for search term in function calls
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
    // Callback for when a single item is clicked
    onFeatureSelect?: (
        feature: Feature<Geometry, GeoJsonProperties> | null,
        sourceUrl: string,
        sourceIndex: number
    ) => void;
    // Callback for when Enter is pressed (selects all visible)
    onCollectionSelect?: (
        featureCollection: FeatureCollection<Geometry, GeoJsonProperties> | null,
        sourceUrl: string | null,
        sourceIndex: number
    ) => void;
    className?: string;
}

/**
 * SearchCombobox component for searching features in multiple data sources.
 * It allows users to filter results based on a search term and select a specific feature.
 */
function SearchCombobox({
    config,
    onFeatureSelect,
    onCollectionSelect,
    className,
}: SearchComboboxProps) {
    const [open, setOpen] = useState(false);
    const [dataSourcesValue, setDataSourcesValue] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(null);

    const getPostgRESTQueries = () => {
        return config.map((source, index) => {
            const { postgrest } = source;
            return useQuery<FeatureCollection<Geometry, GeoJsonProperties>, Error>({
                queryKey: ['search-features', postgrest.url, postgrest.functionName, debouncedSearch, index],
                queryFn: async (): Promise<FeatureCollection<Geometry, GeoJsonProperties>> => {
                    const params = cleanParams(postgrest.params);
                    const urlParams = new URLSearchParams();
                    let apiUrl = '';
                    const headers: HeadersInit = postgrest.headers || {};

                    if (postgrest.functionName) {
                        const functionUrl = `${postgrest.url}/rpc/${postgrest.functionName}`;
                        const searchTerm = debouncedSearch ? `%${debouncedSearch}%` : '';
                        const searchTermParamName = postgrest.searchTerm;
                        if (!searchTermParamName) { throw new Error(`Missing searchTerm parameter config for function ${postgrest.functionName}`); }
                        urlParams.set(searchTermParamName, searchTerm);
                        apiUrl = `${functionUrl}?${urlParams.toString()}`;
                    } else {
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

                    // Fetch and Validate Response
                    const response = await fetch(apiUrl, { method: 'GET', headers });
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`API Error (${response.status}) from ${apiUrl}: ${errorText}`);
                        throw new Error(`Network response was not ok (${response.status})`);
                    }
                    const data = await response.json();
                    if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
                        return data as FeatureCollection<Geometry, GeoJsonProperties>;
                    } else {
                        console.warn(`API response from ${apiUrl} was not valid FeatureCollection.`, data);
                        return { type: "FeatureCollection", features: [] }; // Return empty collection on error
                    }
                },
                enabled: !!debouncedSearch && debouncedSearch.trim().length > 2,
                refetchOnWindowFocus: false,
                retry: 1,
                staleTime: 300000, // 5 minutes
                gcTime: 600000, // 10 minutes
            });
        });
    };

    const cleanParams = (params: Params | undefined): Partial<Params> => { return params || {}; };

    const handleSelect = (
        currentValue: string,
        sourceIndex: number,
        isSourceOnly: boolean = false
    ) => {
        if (isSourceOnly) {
            setActiveSourceIndex(sourceIndex === activeSourceIndex ? null : sourceIndex);
            setDataSourcesValue('');
            return;
        }

        const source = config[sourceIndex];
        const displayField = source.postgrest.params?.displayField;
        const currentFeatureCollection = queryResults[sourceIndex]?.data;

        let selectedFeature: Feature<Geometry, GeoJsonProperties> | null = null;

        if (displayField && currentFeatureCollection?.features) {
            selectedFeature = currentFeatureCollection.features.find(feature => {
                const properties = feature.properties || {};
                return String(properties[displayField]) === currentValue;
            }) ?? null;
        }

        setDataSourcesValue(currentValue);
        setOpen(false);
        onFeatureSelect?.(selectedFeature, source.postgrest.url, sourceIndex);
    };

    // --- handleKeyDown (Enter Handler) -> Calls onCollectionSelect ---
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault();

            let allVisibleFeatures: Feature<Geometry, GeoJsonProperties>[] = [];
            let firstValidSourceUrl: string | null = null;
            let firstValidSourceIndex: number = -1; // Indicate combined results

            const indicesToCheck = activeSourceIndex !== null ? [activeSourceIndex] : config.map((_, i) => i);

            indicesToCheck.forEach(index => {
                const sourceResult = queryResults[index];
                if (sourceResult?.data?.features?.length) {
                    allVisibleFeatures = allVisibleFeatures.concat(sourceResult.data.features);
                    if (firstValidSourceIndex === -1) { // Capture info from first source with results
                        firstValidSourceUrl = config[index].postgrest.url;
                        firstValidSourceIndex = index;
                    }
                }
            });

            let combinedCollection: FeatureCollection | null = null;
            if (allVisibleFeatures.length > 0) {
                combinedCollection = featureCollection(allVisibleFeatures);
            }

            // Call the collection callback
            onCollectionSelect?.(combinedCollection, firstValidSourceUrl, firstValidSourceIndex);
            setOpen(false);
        }
    };

    // --- Helper Functions ---
    function getSourceDisplayName(source: SearchConfig): string {
        if (source.postgrest.sourceName) return source.postgrest.sourceName;
        if (source.postgrest.functionName) return formatName(source.postgrest.functionName);
        if (source.postgrest.params && 'targetField' in source.postgrest.params && source.postgrest.params.targetField) {
            return formatName(source.postgrest.params.targetField);
        }
        const urlParts = source.postgrest.url.split('/');
        return formatName(urlParts[urlParts.length - 1] || 'Unknown Source');
    }
    function formatName(name: string): string {
        return name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ').trim();
    }

    // Get the results for each PostgREST source
    const queryResults = getPostgRESTQueries().map((query, index) => {
        const { data, isLoading, error } = query;
        return {
            // Default to empty FeatureCollection if data is initially undefined
            data: data ?? { type: "FeatureCollection", features: [] },
            isLoading,
            error,
            sourceName: config[index].postgrest.sourceName || getSourceDisplayName(config[index])
        };
    });

    const getPlaceholderText = () => {
        if (activeSourceIndex !== null) {
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
                    className={cn(className, 'w-full', 'justify-between')}
                    aria-label={`Search ${getPlaceholderText()}`}
                >
                    <span className="truncate">
                        {dataSourcesValue || (activeSourceIndex !== null ?
                            `Search in ${queryResults[activeSourceIndex]?.sourceName}...` :
                            'Search...')}
                    </span>
                    <span className='flex-shrink-0'>
                        {queryResults.some(result => result.isLoading) && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        {!queryResults.some(result => result.isLoading) && <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={getPlaceholderText()}
                        className="h-9"
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={handleKeyDown} // Attach Enter key handler
                    />
                    <CommandList>
                        {/* Data Sources */}
                        <CommandGroup heading="Filter by Data Source">
                            {config.map((source, idx) => (
                                <CommandItem
                                    key={`source-${idx}`}
                                    value={`##source-${idx}`}
                                    onSelect={() => handleSelect(`##source-${idx}`, idx, true)}
                                    className="cursor-pointer" >
                                    {source.postgrest.sourceName || getSourceDisplayName(source)}
                                    <Check className={cn('ml-auto h-4 w-4', activeSourceIndex === idx ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        {/* Results */}
                        {queryResults.map((sourceResults, sourceIndex) => {
                            if (activeSourceIndex !== null && activeSourceIndex !== sourceIndex) return null;
                            const displayField = config[sourceIndex].postgrest.params?.displayField;
                            if (!displayField) return <CommandItem key={`error-config-${sourceIndex}`} disabled className="text-destructive">Config Error</CommandItem>;
                            if (sourceResults.isLoading && debouncedSearch.trim().length > 2) return <CommandItem key={`loading-${sourceIndex}`} disabled>Loading...</CommandItem>;
                            if (sourceResults.error) return <CommandItem key={`error-fetch-${sourceIndex}`} disabled className="text-destructive">Error</CommandItem>;
                            if (debouncedSearch.trim().length > 2 && !sourceResults.data?.features?.length && !sourceResults.isLoading) return <CommandEmpty key={`empty-${sourceIndex}`}>No results found.</CommandEmpty>;
                            if (!sourceResults.data?.features?.length) return null;

                            return (
                                <React.Fragment key={sourceIndex}>
                                    {sourceIndex > 0 && activeSourceIndex === null && <CommandSeparator />}
                                    <CommandGroup heading={sourceResults.sourceName}>
                                        {sourceResults.data.features.map((feature: Feature<Geometry, GeoJsonProperties>, featureIndex: number) => { // Use Geometry here unless ExtendedGeometry is strictly necessary
                                            const properties = feature.properties || {};
                                            const displayValue = String(properties[displayField] ?? '');
                                            if (!displayValue) return null;
                                            return (
                                                <CommandItem
                                                    key={feature.id ?? `${displayValue}-${featureIndex}-${sourceIndex}`}
                                                    value={displayValue}
                                                    onSelect={() => handleSelect(displayValue, sourceIndex, false)} // Click calls handleSelect
                                                    className="cursor-pointer" >
                                                    <span className="text-wrap">{displayValue}</span>
                                                    <Check className={cn('ml-auto h-4 w-4', dataSourcesValue === displayValue ? 'opacity-100' : 'opacity-0')} />
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