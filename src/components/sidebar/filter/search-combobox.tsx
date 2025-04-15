import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty, CommandSeparator } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureCollection, Geometry, GeoJsonProperties, Feature } from 'geojson';
import { featureCollection, point as turfPoint } from '@turf/helpers'; // Use turf helpers
import { useDebounce } from 'use-debounce';

interface PostgRESTConfig {
    url: string;
    displayField: string;
    params?: Params;
    functionName?: string;
    searchTerm?: string;
    headers?: Record<string, string>;
    sourceName?: string;
    isGeocodeProxy?: boolean;
}
type Params =
    | { targetField: string; select?: string }
    | { select: string; targetField?: never }
    | { searchKeyParam: string, targetField?: never, select?: never };
export interface SearchConfig { restConfig: PostgRESTConfig; placeholder?: string; buttonWidth?: string; }
export type ExtendedGeometry = Geometry & { crs?: { properties: { name: string; }; type: string; }; };

interface SearchComboboxProps {
    config: SearchConfig[];
    onFeatureSelect?: (feature: Feature<Geometry, GeoJsonProperties> | null, sourceUrl: string, sourceIndex: number) => void;
    onCollectionSelect?: (featureCollection: FeatureCollection<Geometry, GeoJsonProperties> | null, sourceUrl: string | null, sourceIndex: number) => void;
    className?: string;
}

function SearchCombobox({
    config,
    onFeatureSelect,
    onCollectionSelect,
    className,
}: SearchComboboxProps) {
    const [open, setOpen] = useState(false);
    const [dataSourcesValue, setDataSourcesValue] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500); // Increased debounce for geocoding
    const [activeSourceIndex, setActiveSourceIndex] = useState<number | null>(null);

    const getSearchQueries = () => {
        return config.map((source, index) => {
            const { restConfig } = source;
            return useQuery<FeatureCollection<Geometry, GeoJsonProperties>, Error>({
                queryKey: ['search-features', restConfig.url, restConfig.functionName ?? 'table', restConfig.isGeocodeProxy, debouncedSearch, index],
                queryFn: async (): Promise<FeatureCollection<ExtendedGeometry, GeoJsonProperties>> => {
                    const params = cleanParams(restConfig.params);
                    const urlParams = new URLSearchParams();
                    let apiUrl = '';
                    const headers: HeadersInit = restConfig.headers || {};

                    if (restConfig.isGeocodeProxy) {
                        apiUrl = restConfig.url;
                        const searchTerm = debouncedSearch.trim();
                        const parts = searchTerm.split(',');
                        const street = parts[0]?.trim();
                        const zone = parts.slice(1).join(',').trim();

                        if (!street || !zone) {
                            return featureCollection([]); // Return empty if not parseable
                        }
                        urlParams.set('street', street);
                        urlParams.set('zone', zone);
                        apiUrl = `${apiUrl}?${urlParams.toString()}`;

                        const response = await fetch(apiUrl, { method: 'GET', headers });
                        if (!response.ok) {
                            const errorText = await response.text();
                            console.error(`API Error (${response.status}) from ${apiUrl}: ${errorText}`);
                            throw new Error(`Network response was not ok (${response.status})`);
                        }
                        const data = await response.json();
                        if (data && data.status === 200 && data.result?.location?.x && data.result?.location?.y) {
                            const result = data.result;
                            const pointGeom = turfPoint([result.location.x, result.location.y]).geometry;
                            console.log(`Geocode result: ${pointGeom}`);

                            return featureCollection([{
                                type: "Feature", geometry: pointGeom,
                                properties: {
                                    matchAddress: result.matchAddress, score: result.score,
                                    [restConfig.displayField]: result.matchAddress, // Ensure displayField property exists
                                    geocoder: result.locator,
                                }
                            }]);
                        } else {
                            return featureCollection([]); // Return empty on geocode error/no result
                        }

                    } else {
                        if (restConfig.functionName) {
                            // PostgREST Function Call
                            const functionUrl = `${restConfig.url}/rpc/${restConfig.functionName}`;
                            const searchTerm = debouncedSearch ? `%${debouncedSearch}%` : '';
                            const searchTermParamName = restConfig.searchTerm;
                            if (!searchTermParamName) { throw new Error(`Missing searchTerm parameter config for function ${restConfig.functionName}`); }
                            urlParams.set(searchTermParamName, searchTerm);
                            apiUrl = `${functionUrl}?${urlParams.toString()}`;
                        } else {
                            // PostgREST Table/View Query
                            apiUrl = `${restConfig.url}`;
                            const searchTerm = debouncedSearch ? `%${debouncedSearch}%` : '';
                            if ('targetField' in params && params.targetField && searchTerm) {
                                urlParams.set(params.targetField, `ilike.${searchTerm}`);
                            }
                            if ('select' in params && params.select) {
                                urlParams.set('select', params.select);
                            } else {
                                const defaultGeomCol = 'geometry';
                                urlParams.set('select', `*,${defaultGeomCol}`);
                                console.warn(`Source ${index} ('${restConfig.url}'): 'select' param missing. Defaulting to '*,${defaultGeomCol}'. Verify.`);
                            }
                            urlParams.set('limit', '100');
                            apiUrl = `${apiUrl}?${urlParams.toString()}`;
                        }

                        // Fetch PostgREST endpoint (expecting FeatureCollection)
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
                            return featureCollection([]);
                        }
                    }
                },
                enabled: !!debouncedSearch && debouncedSearch.trim().length > 2 &&
                    (!restConfig.isGeocodeProxy || debouncedSearch.includes(',')), // Only enable geocode if comma present and zone is provided
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
        const displayField = source.restConfig.displayField;
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
        onFeatureSelect?.(selectedFeature, source.restConfig.url, sourceIndex);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
            event.preventDefault();

            let allVisibleFeatures: Feature<Geometry, GeoJsonProperties>[] = [];
            let firstValidSourceUrl: string | null = null;
            let firstValidSourceIndex: number = -1;

            const indicesToCheck = activeSourceIndex !== null ? [activeSourceIndex] : config.map((_, i) => i);

            indicesToCheck.forEach(index => {
                const sourceResult = queryResults[index];
                if (sourceResult?.data?.features?.length) {
                    allVisibleFeatures = allVisibleFeatures.concat(sourceResult.data.features);
                    if (firstValidSourceIndex === -1) {
                        firstValidSourceUrl = config[index].restConfig.url;
                        firstValidSourceIndex = index;
                    }
                }
            });

            let combinedCollection: FeatureCollection | null = null;
            if (allVisibleFeatures.length > 0) {
                combinedCollection = featureCollection(allVisibleFeatures);
            }
            onCollectionSelect?.(combinedCollection, firstValidSourceUrl, firstValidSourceIndex);
            setOpen(false);
        }
    };

    // --- Helper Functions ---
    function getSourceDisplayName(source: SearchConfig): string {
        if (source.restConfig.sourceName) return source.restConfig.sourceName;
        if (source.restConfig.functionName) return formatName(source.restConfig.functionName);
        if (source.restConfig.params && 'targetField' in source.restConfig.params && source.restConfig.params.targetField) {
            return formatName(source.restConfig.params.targetField);
        }
        const urlParts = source.restConfig.url.split('/');
        return formatName(urlParts[urlParts.length - 1] || 'Unknown Source');
    }
    function formatName(name: string): string {
        return name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ').trim();
    }

    const queryResults = getSearchQueries().map((query, index) => { // Renamed function call
        const { data, isLoading, error } = query;
        return {
            data: data ?? featureCollection([]),
            isLoading,
            error,
            sourceName: config[index].restConfig.sourceName || getSourceDisplayName(config[index])
        };
    });

    const getPlaceholderText = () => {
        if (activeSourceIndex !== null) {
            return `Search in ${queryResults[activeSourceIndex]?.sourceName ?? 'selected source'}...`;
        }
        const sourceNames = config.map(c => c.restConfig.sourceName || getSourceDisplayName(c)).join(' or ');
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
                        onKeyDown={handleKeyDown}
                    />
                    <CommandList>
                        {/* TODO: customize the heading to say Filter or Search based on what the mode is */}
                        {/* Data Sources */}
                        <CommandGroup heading="Search by Data Source">
                            {config.map((source, idx) => (
                                <CommandItem
                                    key={`source-${idx}`}
                                    value={`##source-${idx}`}
                                    onSelect={() => handleSelect(`##source-${idx}`, idx, true)}
                                    className="cursor-pointer" >
                                    {source.restConfig.sourceName || getSourceDisplayName(source)}
                                    <Check className={cn('ml-auto h-4 w-4', activeSourceIndex === idx ? 'opacity-100' : 'opacity-0')} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        {/* Results */}
                        {queryResults.map((sourceResults, sourceIndex) => {
                            if (activeSourceIndex !== null && activeSourceIndex !== sourceIndex) return null;
                            const displayField = config[sourceIndex].restConfig.displayField;
                            if (!displayField) return <CommandItem key={`error-config-${sourceIndex}`} disabled className="text-destructive">Config Error</CommandItem>;
                            if (sourceResults.isLoading && debouncedSearch.trim().length > 2) return <CommandItem key={`loading-${sourceIndex}`} disabled>Loading...</CommandItem>;
                            if (sourceResults.error) return <CommandItem key={`error-fetch-${sourceIndex}`} disabled className="text-destructive">Error</CommandItem>;
                            if (debouncedSearch.trim().length > 2 && !sourceResults.data?.features?.length && !sourceResults.isLoading) return <CommandEmpty key={`empty-${sourceIndex}`}>No results found.</CommandEmpty>;
                            if (!sourceResults.data?.features?.length) return null;

                            return (
                                <React.Fragment key={sourceIndex}>
                                    {sourceIndex > 0 && activeSourceIndex === null && <CommandSeparator />}
                                    <CommandGroup heading={sourceResults.sourceName}>
                                        {sourceResults.data.features.map((feature: Feature<Geometry, GeoJsonProperties>, featureIndex: number) => {
                                            const properties = feature.properties || {};
                                            const displayValue = String(properties[displayField] ?? '');
                                            if (!displayValue) return null;
                                            return (
                                                <CommandItem
                                                    key={feature.id ?? `${displayValue}-${featureIndex}-${sourceIndex}`}
                                                    value={displayValue}
                                                    onSelect={() => handleSelect(displayValue, sourceIndex, false)}
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