// TODO: replace the esri/widgets/Search with a custom search bar

import * as React from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/custom/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const layers = [
  "Layer 1",
  "Layer 2",
  "Layer 3",
  "Layer 4",
];

// Mock function to simulate fetching suggestions
const fetchSuggestions = async (term: string, selectedLayer: string | null) => {
  console.log(`Fetching suggestions for "${term}" in ${selectedLayer || "all layers"}`);

  // Implement logic to fetch suggestions based on term and layer
  return [
    `${term} Suggestion 1`,
    `${term} Suggestion 2`,
    `${term} Suggestion 3`,
  ];
};

// Mock function to simulate fetching results
const fetchResults = async (term: string, selectedLayer: string | null) => {
  // Implement logic to fetch results based on term and layer
  console.log(`Fetching results for "${term}" in ${selectedLayer || "all layers"}`);
  return [
    `${term} Result 1`,
    `${term} Result 2`,
    `${term} Result 3`,
  ];
};

export function SearchBar() {
  const [selectedLayer, setSelectedLayer] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [results, setResults] = React.useState<string[]>([]);

  const handleSearch = async (term: string) => {
    const fetchedResults = await fetchResults(term, selectedLayer);
    setResults(fetchedResults);
    console.log("Results:", results);
  };

  const handleSuggestions = async (term: string) => {
    const fetchedSuggestions = await fetchSuggestions(term, selectedLayer);
    setSuggestions(fetchedSuggestions);
  };

  return (
    <div className="flex w-full flex-col items-start justify-between rounded-md px-4 sm:flex-row sm:items-center">
      <Command className="w-full">
        <CommandInput
          placeholder={`Search in ${selectedLayer || "all layers"}...`}
          value={searchTerm}
          onValueChange={(value) => {
            setSearchTerm(value);
            handleSuggestions(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch(searchTerm);
            }
          }}
        />
        <CommandList>
          {suggestions.length > 0 && (
            <CommandGroup>
              {suggestions.map((suggestion, index) => (
                <CommandItem key={index} onSelect={() => handleSearch(suggestion)}>
                  {suggestion}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {searchTerm && suggestions.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
        </CommandList>
      </Command>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <DotsHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Select Layer</DropdownMenuLabel>
          <DropdownMenuGroup>
            {layers.map((layer) => (
              <DropdownMenuItem
                key={layer}
                onSelect={() => setSelectedLayer(layer)}
              >
                {layer}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => setSelectedLayer(null)}
            >
              Search All Layers
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
