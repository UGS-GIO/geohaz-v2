import { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapContext } from '@/context/map-provider';
// Define the PostgREST Config
interface PostgRESTConfig {
    url: string; // Full URL (including 'rpc/' if it's a function endpoint)
    params?: Params; // Params is optional but we'll handle the undefined case
    functionName?: string; // Function name if it's a function endpoint
    headers?: Record<string, string>; // Flexible headers with string key and value
}

// Conditional type to enforce stricter validation on params
type Params =
    | { displayField: string; targetField: string; select?: never } // targetField required with displayField, select can't be provided
    | { displayField: string; select: string; targetField?: never } // select required with displayField, targetField can't be provided
    | { displayField: string; searchTermParam: string, searchKeyParam: string, targetField?: never, select?: never };  // for function-based queries


// Define the SearchConfig that contains PostgRESTConfig
export interface SearchConfig {
    postgrest: PostgRESTConfig;
    geoserver?: any;
    placeholder?: string;
    buttonWidth?: string;
}

// Define the props for the SearchCombobox component
interface SearchComboboxProps<T> {
    config: SearchConfig[];
    onSearchSelect?: (searchResult: T | null, source: string) => void;
    onFeatureSelect?: (geoserverFeature: any | null, source: string) => void;
}

// SearchCombobox component implementation
function SearchCombobox<T>({
    config,
    onSearchSelect,
    onFeatureSelect,
}: SearchComboboxProps<T>) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState('');
    const [search, setSearch] = useState('');
    const { view } = useContext(MapContext);

    // Function to handle PostgREST query
    // Function to handle PostgREST query
    const getPostgRESTQuery = (source: SearchConfig) => {
        const { postgrest } = source;

        return useQuery({
            queryKey: ['search-features', search],
            queryFn: async () => {
                // Safely get params or provide an empty object if not defined
                const params = cleanParams(postgrest.params);
                const urlParams = new URLSearchParams();

                // If functionName exists, build the URL with function name
                if (postgrest.functionName) {
                    console.log('functionName provided');
                    const functionUrl = `${postgrest.url}/rpc/${postgrest.functionName}`;
                    const searchTerm = search ? `%${search}%` : ''; // Prepare the search term with '%' for partial matching
                    urlParams.set('search_term', searchTerm); // Use searchTermParam or default to 'search_term'
                    // Construct the URL for the function
                    const url = `${functionUrl}?${urlParams.toString()}`;


                    console.log('url', url);
                    console.log('accept-profile', postgrest.headers?.['accept-profile']);


                    // Fetch the data from the function endpoint
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Profile': `${postgrest.headers?.['accept-profile']}`,
                        },
                        body: undefined,
                    });

                    // Check for errors in the response
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    console.log('data', data);

                    return data;
                } else {
                    console.log('functionName not provided', params);

                    // Handle regular PostgREST query (when functionName is not provided)
                    const url = `${postgrest.url}`;
                    const searchTerm = search ? `%${search}%` : '';

                    console.log('url', url);
                    console.log('searchTerm', searchTerm);



                    // If targetField exists, we use it with `ilike` (partial case-insensitive search)
                    if (params.targetField && searchTerm) {
                        console.log('targetField exists');
                        urlParams.set(params.targetField, `ilike.${searchTerm}`);
                    }

                    // If targetField does not exist, but select is present, we use select for partial matching
                    if (params.select && searchTerm) {
                        console.log('select exists');
                        urlParams.set(params.select, `ilike.${searchTerm}`);
                    }

                    // Construct the URL for regular endpoint
                    const finalUrl = `${url}?${urlParams.toString()}`;

                    console.log('finalUrl', finalUrl);

                    // Fetch the data from the regular PostgREST endpoint
                    const response = await fetch(finalUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Profile': `${postgrest.headers?.['accept-profile']}`,
                        },
                        body: undefined,
                    });

                    // Check for errors in the response
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }

                    const data = await response.json();
                    return data;
                }
            },
            enabled: search.length > 3, // Only run the query if search term is sufficiently long
        });
    };


    // Helper function to clean params (remove undefined fields)
    const cleanParams = (params: Params | undefined): Record<string, string> => {
        const cleanedParams: Record<string, string> = {};

        if (params?.displayField) {
            cleanedParams['displayField'] = params.displayField;
        }
        if (params?.targetField) {
            cleanedParams['targetField'] = params.targetField;
        }
        if (params?.select) {
            cleanedParams['select'] = params.select;
        }

        return cleanedParams;
    };

    // Handle selection from PostgREST search results
    const handleSelect = (currentValue: string, sourceIndex: number) => {
        const selected = currentValue === value ? null : queryResults[sourceIndex].data?.find((f: any) => f[config[sourceIndex].postgrest.params?.displayField!] === currentValue) || null;
        setValue(currentValue === value ? '' : currentValue);
        setOpen(false);
        onSearchSelect?.(selected, config[sourceIndex].postgrest.url);


        // update map
        console.log('map', view?.map);

    };



    const queryResults = config.map((source) => {
        const { data, isLoading, error } = getPostgRESTQuery(source);
        return { data, isLoading, error };
    });

    console.log('queryResults', queryResults);


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn('w-full', 'justify-between')}
                >
                    {value || 'Search...'}
                    {(queryResults.some((result) => result.isLoading)) && <Loader2 className="h-4 w-4 animate-spin" />}
                    <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput
                        placeholder="Search..."
                        className="h-9"
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        {queryResults.map((sourceResults, sourceIndex) => {
                            console.log({ sourceResults });

                            return (
                                <CommandGroup key={sourceIndex}>
                                    {sourceResults.data?.map((result: any) => {

                                        // console.log('postgrest.params?.displayfield', config[sourceIndex]);

                                        return (
                                            <CommandItem
                                                key={`${result[config[sourceIndex].postgrest.params?.displayField!]}-${sourceIndex}`}
                                                value={result[config[sourceIndex].postgrest.params?.displayField!]}
                                                onSelect={() => handleSelect(result[config[sourceIndex].postgrest.params?.displayField!], sourceIndex)}
                                                className="flex flex-col items-start"
                                            >
                                                <div className="flex w-full justify-between">
                                                    <span>{result[config[sourceIndex].postgrest.params?.displayField!]}</span>
                                                    <Check className={cn('ml-auto h-4 w-4', value === result[config[sourceIndex].postgrest.params?.displayField!] ? 'opacity-100' : 'opacity-0')} />
                                                </div>
                                            </CommandItem>
                                        )
                                    })}
                                </CommandGroup>
                            )
                        })}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export { SearchCombobox };
