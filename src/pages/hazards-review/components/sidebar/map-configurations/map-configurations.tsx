import { useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from "lucide-react";
import { BackToMenuButton } from '@/components/custom/back-to-menu-button';
import { cn } from "@/lib/utils";
import { LayerOption, useFetchReviewableLayers } from '@/hooks/use-fetch-reviewable-layers';

// --- New Multi-Select Dropdown Component ---

interface ReviewableLayersFilterProps {
    layers: LayerOption[];
    selectedLayers: string[];
    onSelectionChange: (selected: string[]) => void;
    isLoading: boolean;
}

function ReviewableLayersFilter({ layers, selectedLayers, onSelectionChange, isLoading }: ReviewableLayersFilterProps) {
    const [open, setOpen] = useState(false);

    const handleSelect = (layerName: string) => {
        const isSelected = selectedLayers.includes(layerName);
        const newSelection = isSelected
            ? selectedLayers.filter(name => name !== layerName)
            : [...selectedLayers, layerName];
        onSelectionChange(newSelection);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filter Layers in Review</CardTitle>
                <CardDescription>Select specific layers to view their review data.</CardDescription>
            </CardHeader>
            <CardContent>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className="w-full justify-between"
                            disabled={isLoading || layers.length === 0}
                        >
                            <span className="truncate">
                                {selectedLayers.length === 0
                                    ? "Select layers..."
                                    : `${selectedLayers.length} layer(s) selected`}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandInput placeholder="Search layers..." />
                            <CommandList>
                                <CommandEmpty>No layers found.</CommandEmpty>
                                <CommandGroup>
                                    {layers.map((layer) => (
                                        <CommandItem
                                            key={layer.value}
                                            value={layer.label}
                                            onSelect={() => handleSelect(layer.label)}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedLayers.includes(layer.label) ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {layer.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                <div className="pt-2 flex flex-wrap gap-1">
                    {selectedLayers.map(layer => (
                        <Badge
                            key={layer}
                            variant="secondary"
                            className="flex items-center gap-1"
                        >
                            {layer}
                            <button
                                onClick={() => handleSelect(layer)}
                                className="rounded-full hover:bg-muted-foreground/20"
                                aria-label={`Remove ${layer}`}
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}


// --- Main Enhanced Component ---

const reviewStatusOptions = [
    { value: 'standard', label: 'Live' },
    { value: 'review', label: 'Review' },
    { value: 'all', label: 'All' },
] as const;

type ReviewStatus = typeof reviewStatusOptions[number]['value'];

function MapConfigurations() {
    const navigate = useNavigate({ from: '/hazards-review' });
    const { review_status } = useSearch({ from: '/hazards-review/' });

    // Fetch the list of layers that have 'R' data
    const { data: reviewableLayers = [], isLoading } = useFetchReviewableLayers();

    console.log('reviewableLayers', reviewableLayers);


    // Manage the selected layers in local state for now
    const [selectedLayers, setSelectedLayers] = useState<string[]>([]);

    const handleReviewStatusChange = (status: ReviewStatus) => {
        navigate({
            search: (prev) => ({ ...prev, review_status: status }),
            replace: true,
        });
    };

    return (
        <>
            <BackToMenuButton />
            <div className='space-y-4 p-4'>
                <div className="mb-4">
                    <h3 className="text-lg font-medium">Filters</h3>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Review Status</CardTitle>
                        <CardDescription>
                            Control which features are visible on the map based on their status.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={review_status}
                            onValueChange={handleReviewStatusChange}
                            className="grid grid-cols-3 gap-2"
                        >
                            {reviewStatusOptions.map(option => (
                                <div key={option.value}>
                                    <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                                    <Label
                                        htmlFor={option.value}
                                        className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-3 text-center hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        {option.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>

                {/* Conditionally render the new dropdown when in 'review' mode */}
                {review_status === 'review' && (
                    <ReviewableLayersFilter
                        layers={reviewableLayers}
                        selectedLayers={selectedLayers}
                        onSelectionChange={setSelectedLayers}
                        isLoading={isLoading}
                    />
                )}
            </div>
        </>
    );
}

export default MapConfigurations;