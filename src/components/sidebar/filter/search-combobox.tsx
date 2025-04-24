import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty, CommandSeparator } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureCollection, Geometry, GeoJsonProperties, Feature } from 'geojson';
import { featureCollection } from '@turf/helpers';
import { useDebounce } from 'use-debounce';

interface BaseConfig {
    url: string;
    sourceName?: string; // Optional descriptive name
    headers?: Record<string, string>;
    displayField: string;
}

interface PostgRESTConfig extends BaseConfig {
    type: 'postgREST';
    crs?: string; // Optional: Coordinate Reference System (e.g., 'EPSG:26912')
    params?: PostgRESTParams;
    functionName?: string;
    searchTerm?: string;
}

type PostgRESTParams =
    | { targetField: string; select?: string } // Search specific field
    | { select: string; targetField?: never } // Select specific columns only
    | { searchKeyParam: string, targetField?: never, select?: never }; // Function param name (less common now?)

interface MasqueradeConfig extends BaseConfig {
    type: 'masquerade';
    maxSuggestions?: number;
    outSR?: number; // e.g., 4326
    // displayField will be 'text' for suggestions, 'address' for candidates
}

export type SearchSourceConfig = PostgRESTConfig | MasqueradeConfig;
export interface SearchConfig { config: SearchSourceConfig; placeholder?: string; }
export type ExtendedGeometry = Geometry & { crs?: { properties: { name: string; }; type: string; }; };

// Masquerade Suggestion
interface Suggestion {
    text: string;
    magicKey: string;
    isCollection?: boolean; // This property is specific to the suggest endpoint
}

type QueryData = Suggestion[] | FeatureCollection<Geometry, GeoJsonProperties>;
// QueryResult type
interface QueryResultWrapper<TData = QueryData> {
    data: TData | undefined;
    error: Error | null;
    isLoading: boolean;
    isError: boolean;
    type: SearchSourceConfig['type']; // Add type here
}


interface SearchComboboxProps {
    config: SearchConfig[];
    // Called when a PostgREST feature OR a finalized Masquerade candidate is selected
    onFeatureSelect?: (feature: Feature<Geometry, GeoJsonProperties> | null, sourceUrl: string, sourceIndex: number) => void;
    // Called when Enter is pressed on PostgREST results
    onCollectionSelect?: (featureCollection: FeatureCollection<Geometry, GeoJsonProperties> | null, sourceUrl: string | null, sourceIndex: number) => void;
    // Called when a Masquerade suggestion is clicked
    onSuggestionSelect?: (suggestion: Suggestion, sourceConfig: MasqueradeConfig, sourceIndex: number) => void;
    className?: string;
}

function formatAddressCase(address: string | undefined | null): string {
    if (!address) return '';
    // Convert to lowercase, split into words, capitalize first letter of each, join back
    return address.toLowerCase().split(' ')
        .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1) : '')
        .join(' ');
}

function SearchCombobox({
    config,
    onFeatureSelect,
    onCollectionSelect,
    onSuggestionSelect,
    className,
}: SearchComboboxProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState(''); // value shown in the combobox input/button
    const [search, setSearch] = useState(''); // internal search term driving debounced queries
    const [debouncedSearch] = useDebounce(search, 500);
    const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(null);

    const queryResults: QueryResultWrapper[] = config.map((sourceConfigWrapper, index) => {
        const source = sourceConfigWrapper.config;
        const query = useQuery<QueryData, Error>({
            queryKey: ['search', source.url, source.type, debouncedSearch, index],
            queryFn: async (): Promise<QueryData> => {
                if (source.type === 'masquerade') {

                    const params = new URLSearchParams();
                    params.set('text', debouncedSearch.trim());
                    params.set('maxSuggestions', (source.maxSuggestions ?? 6).toString());
                    const wkid = source.outSR ?? 4326;
                    params.set('outSR', JSON.stringify({ wkid }));
                    params.set('f', 'json');

                    const suggestUrl = `${source.url}/suggest?${params.toString()}`;
                    const response = await fetch(suggestUrl, { method: 'GET', headers: source.headers });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`Suggest API Error (${response.status}) from ${suggestUrl}: ${errorText}`);
                        throw new Error(`Suggest Network response was not ok (${response.status})`);
                    }
                    const data = await response.json();
                    const suggestions = (data?.suggestions || []) as Suggestion[];

                    // Filter based on magicKey and only include address points
                    const addressPointSuggestions = suggestions.filter(s =>
                        s.magicKey?.includes('opensgid.location.address_points')
                    );

                    return addressPointSuggestions; // Type: Suggestion[]

                } else if (source.type === 'postgREST') {
                    // --- Fetch logic for PostgREST ---
                    const params = source.params;
                    const urlParams = new URLSearchParams();
                    let apiUrl = '';
                    const headers: HeadersInit = source.headers || {};

                    if (source.functionName) {
                        // PostgREST Function Call
                        const functionUrl = `${source.url}/rpc/${source.functionName}`;
                        const searchTermValue = debouncedSearch ? `%${debouncedSearch}%` : '';
                        const searchTermParamName = source.searchTerm;
                        if (!searchTermParamName) throw new Error(`Missing searchTerm parameter config for function ${source.functionName}`);
                        urlParams.set(searchTermParamName, searchTermValue);

                        if (params && 'select' in params && params.select) {
                            urlParams.set('select', params.select);
                        }
                        apiUrl = `${functionUrl}?${urlParams.toString()}`;
                    } else {
                        // PostgREST Table/View Query
                        apiUrl = `${source.url}`;
                        const searchTermValue = debouncedSearch ? `%${debouncedSearch}%` : '';

                        if (params && 'targetField' in params && params.targetField && searchTermValue) {
                            urlParams.set(params.targetField, `ilike.${searchTermValue}`);
                        }

                        if (params && 'select' in params && params.select) {
                            urlParams.set('select', params.select);
                        } else { // Default select
                            urlParams.set('select', `*,geometry`);
                            if (!params || (params && !('select' in params))) {
                                console.warn(`Source ${index} ('${source.url}'): Defaulting select to '*,geometry'.`);
                            }
                        }
                        urlParams.set('limit', '100');
                        apiUrl = `${apiUrl}?${urlParams.toString()}`;
                    }

                    // Fetch and Process
                    const response = await fetch(apiUrl, { method: 'GET', headers });
                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error(`API Error (${response.status}) from ${apiUrl}: ${errorText}`);
                        throw new Error(`Network response was not ok (${response.status})`);
                    }
                    const data = await response.json();

                    // Handle different valid responses
                    if (data && Array.isArray(data) && (data.length === 0 || (data[0]?.type === 'Feature' && data[0]?.geometry && data[0]?.properties))) {
                        return featureCollection(data as Feature<Geometry, GeoJsonProperties>[]);
                    } else if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
                        return data as FeatureCollection<Geometry, GeoJsonProperties>;
                    } else {
                        console.warn(`API response from ${apiUrl} was not valid GeoJSON Feature array or FeatureCollection.`, data);
                        return featureCollection([]);
                    }
                } else {
                    throw new Error(`Unsupported source type`);
                }
            },

            enabled: (
                !!debouncedSearch &&
                debouncedSearch.trim().length > 3 &&
                (activeSourceIndex === null || activeSourceIndex === index)
            ),
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 300000, // 5 minutes
            gcTime: 600000, // 10 minutes
        });

        return {
            data: query.data,
            error: query.error,
            isLoading: query.isLoading,
            isError: query.isError,
            type: source.type
        } as QueryResultWrapper;
    });

    const handleSourceFilterSelect = (sourceIndex: number) => {
        setActiveSourceIndex(sourceIndex === activeSourceIndex ? null : sourceIndex);
        setInputValue('');
        setSearch('');
    };

    const handleResultSelect = (
        value: string,
        sourceIndex: number,
        itemData: Feature<Geometry, GeoJsonProperties> | Suggestion
    ) => {
        const sourceConfig = config[sourceIndex].config;

        // Use type guards or property checks on itemData
        if (sourceConfig.type === 'masquerade' && 'magicKey' in itemData) { // Check if it's a Suggestion
            onSuggestionSelect?.(itemData, sourceConfig, sourceIndex);
            setInputValue(itemData.text);
        } else if (sourceConfig.type === 'postgREST' && 'type' in itemData && itemData.type === 'Feature') {
            const displayValue = String(itemData.properties?.[sourceConfig.displayField] ?? '');
            setInputValue(displayValue || value);
            onFeatureSelect?.(itemData, sourceConfig.url, sourceIndex);
        } else {
            console.error("Mismatched item data type or config type in handleResultSelect", itemData, sourceConfig);
            setInputValue(value);
        }

        setOpen(false);
        setSearch('');
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault();

            let allVisibleFeatures: Feature<Geometry, GeoJsonProperties>[] = [];
            let firstValidSourceUrl: string | null = null;
            let firstValidSourceIndex: number = -1; // Use -1 to indicate not found yet

            const indicesToCheck = activeSourceIndex !== null ? [activeSourceIndex] : config.map((_, index) => index);

            indicesToCheck.forEach(index => {
                const sourceResult = queryResults[index];
                const searchConfigItem = config[index];
                const sourceConfig = searchConfigItem?.config;

                if (sourceResult && sourceConfig?.type === 'postgREST' && sourceResult.data && 'features' in sourceResult.data && Array.isArray(sourceResult.data.features) && sourceResult.data.features.length > 0) {

                    allVisibleFeatures = allVisibleFeatures.concat(sourceResult.data.features);

                    // Record the URL and index of the *first* source that provided features
                    if (firstValidSourceIndex === -1) {
                        firstValidSourceUrl = sourceConfig.url;
                        firstValidSourceIndex = index;
                    }
                }
            });

            // Create a combined FeatureCollection if any features were found
            let combinedCollection: FeatureCollection | null = null;
            if (allVisibleFeatures.length > 0) {
                combinedCollection = featureCollection(allVisibleFeatures);
            }

            // Trigger the callback with the combined collection and info from the first source
            onCollectionSelect?.(combinedCollection, firstValidSourceUrl, firstValidSourceIndex);
            setOpen(false); // close popover
        }
    };
    // --- Helper Functions ---
    function getSourceDisplayName(sourceConfig: SearchSourceConfig): string {
        if (sourceConfig.sourceName) return sourceConfig.sourceName;
        let name = '';
        if (sourceConfig.type === 'postgREST') {
            if (sourceConfig.functionName) name = sourceConfig.functionName;
            else if (sourceConfig.params && 'targetField' in sourceConfig.params && sourceConfig.params.targetField) {
                name = sourceConfig.params.targetField;
            } else {
                const urlParts = sourceConfig.url.split('/');
                name = urlParts[urlParts.length - 1] || ''; // Get last part of URL as fallback
            }
        } else if (sourceConfig.type === 'masquerade') {
            name = "Address Search: e.g. 123 Main St";
        }

        if (!name) { // Fallback if name is still empty
            const urlParts = sourceConfig.url.split('/');
            name = urlParts[urlParts.length - 1] || 'Unknown Source';
        }
        return formatName(name);
    }

    function formatName(name: string): string { // Format name for display: E.g. "api" -> "API", "address_search" -> "Address Search"
        return name
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1') // Add space before caps (might add extra space if already spaced)
            .replace(/\s+/g, ' ') // Consolidate multiple spaces
            .split(' ')
            .map(word => word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '')
            .join(' ')
            .replace(/^Rpc\s/, '') // Remove "Rpc " prefix if present
            .trim();
    }

    const isLoading = queryResults.some(result => result.isLoading);

    const getPlaceholderText = () => {
        if (activeSourceIndex !== null && config[activeSourceIndex]) {
            return `Search in ${getSourceDisplayName(config[activeSourceIndex].config)}...`;
        }
        return config[0]?.placeholder || `Search...`;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(className, 'w-full', 'justify-between', 'text-left h-auto min-h-10')}
                    aria-label={getPlaceholderText()}
                >
                    <span className="truncate">
                        {inputValue || getPlaceholderText()}
                    </span>
                    <span className='ml-2 flex-shrink-0'>
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {!isLoading && <ChevronsUpDown className="h-4 w-4 opacity-50" />}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="end">
                <Command shouldFilter={false} className='max-h-[400px]'>
                    <CommandInput
                        placeholder={getPlaceholderText()}
                        className="h-9"
                        value={search}
                        onValueChange={setSearch}
                        onKeyDown={handleKeyDown}
                        aria-label="Search input"
                    />
                    <CommandList>
                        {/* Data Sources Filter */}
                        {config.length > 1 && ( // Only show source filter if more than one source
                            <>
                                <CommandGroup heading="Filter by Data Source">
                                    {config.map((sourceConfigWrapper, idx) => (
                                        <CommandItem
                                            key={`source-${idx}`}
                                            value={`##source-${idx}`}
                                            onSelect={() => handleSourceFilterSelect(idx)}
                                            className="cursor-pointer"
                                        >
                                            {getSourceDisplayName(sourceConfigWrapper.config)}
                                            <Check className={cn('ml-auto h-4 w-4', activeSourceIndex === idx ? 'opacity-100' : 'opacity-0')} />
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                                <CommandSeparator />
                            </>
                        )}

                        {/* Results Area */}
                        {queryResults.map((sourceResult, sourceIndex) => {
                            // Skip rendering if a filter is active and it's not the active source
                            if (activeSourceIndex !== null && activeSourceIndex !== sourceIndex) return null;

                            const source = config[sourceIndex].config;

                            // Loading State: check if query is loading AND search term is valid length
                            const isSearchLongEnough = debouncedSearch.trim().length > 3;
                            if (sourceResult.isLoading && isSearchLongEnough) {
                                return (
                                    <CommandItem key={`loading-${sourceIndex}`} disabled className="opacity-50 italic">
                                        Loading {getSourceDisplayName(source)}...
                                    </CommandItem>
                                );
                            }

                            // Error State
                            if (sourceResult.isError) {
                                return (
                                    <CommandItem key={`error-fetch-${sourceIndex}`} disabled className="text-destructive">
                                        Error loading {getSourceDisplayName(source)}.
                                    </CommandItem>
                                );
                            }

                            const hasData = sourceResult.data &&
                                ((sourceResult.type === 'masquerade' && Array.isArray(sourceResult.data) && sourceResult.data.length > 0) ||
                                    (sourceResult.type === 'postgREST' && 'features' in sourceResult.data && sourceResult.data.features.length > 0));

                            // Empty State
                            if (isSearchLongEnough && !sourceResult.isLoading && !hasData) {
                                return <CommandEmpty key={`empty-${sourceIndex}`}>No results found for "{debouncedSearch}" in {getSourceDisplayName(source)}.</CommandEmpty>;
                            }

                            // return null for no data
                            if (!hasData) {
                                return null;
                            }

                            return (
                                <CommandGroup key={sourceIndex} heading={getSourceDisplayName(source)}>
                                    {/* Type guard for Masquerade results */}
                                    {sourceResult.type === 'masquerade' && Array.isArray(sourceResult.data) && sourceResult.data.map((suggestion, sugIndex) => (
                                        <CommandItem
                                            key={`${suggestion.magicKey}-${sugIndex}`}
                                            value={suggestion.text}
                                            onSelect={(currentValue) => handleResultSelect(currentValue, sourceIndex, suggestion)}
                                            className="cursor-pointer"
                                        >
                                            <span className="text-wrap">{formatAddressCase(suggestion.text)}</span>
                                        </CommandItem>
                                    ))}

                                    {/* Type guard for PostgREST results */}
                                    {sourceResult.type === 'postgREST' && sourceResult.data && 'features' in sourceResult.data && sourceResult.data.features.map((feature, featureIndex) => {
                                        const displayValue = String(feature.properties?.[source.displayField] ?? '');
                                        if (!displayValue) return null;

                                        return (
                                            <CommandItem
                                                key={feature.id ?? `${displayValue}-${featureIndex}-${sourceIndex}`}
                                                value={displayValue}
                                                onSelect={(currentValue) => handleResultSelect(currentValue, sourceIndex, feature)}
                                                className="cursor-pointer"
                                            >
                                                <span className="text-wrap">{displayValue}</span>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            );
                        })}

                        {/* Empty State Check */}
                        {!isLoading && debouncedSearch.trim().length > 1 && queryResults.every(result => {
                            // Check if this specific source is loading or has data
                            const hasDataForSource = result.data &&
                                ((result.type === 'masquerade' && Array.isArray(result.data) && result.data.length > 0) ||
                                    (result.type === 'postgREST' && 'features' in result.data && result.data.features.length > 0));
                            // The condition for .every is true if the source is NOT loading AND it does NOT have data
                            return !result.isLoading && !hasDataForSource;
                        }) && (
                                <CommandEmpty>No results found for "{debouncedSearch}".</CommandEmpty>
                            )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export { SearchCombobox };