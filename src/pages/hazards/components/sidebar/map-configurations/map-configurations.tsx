import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackToMenuButton } from '@/components/custom/back-to-menu-button';
import { useMapCoordinates } from '@/hooks/use-map-coordinates';
import { useSearch, useNavigate } from '@tanstack/react-router'; // ADDED
import { YesNoAll } from '@/lib/types/filter-types';

function MapConfigurations() {
    const { setIsDecimalDegrees, locationCoordinateFormat } = useMapCoordinates();
    const navigate = useNavigate({ from: '/hazards' });
    const search = useSearch({ from: '/hazards/' });

    const handleCoordFormatChange = (value: string) => {
        if (value && setIsDecimalDegrees) {
            setIsDecimalDegrees(value === "Decimal Degrees");
        }
    };

    const handleReviewDataChange = (value: YesNoAll) => {
        navigate({
            search: (prev) => ({
                ...prev,
                review_data: value === "all" ? undefined : value,
            }),
            replace: true,
        });
    };

    return (
        <>
            <BackToMenuButton />
            <div className='space-y-4 p-4'>
                <div className="mb-4">
                    <h3 className="text-lg font-medium">Map Configurations</h3>
                </div>

                <ReviewDataFilter
                    value={search.review_data ?? 'all'}
                    onChange={handleReviewDataChange}
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Location Coordinate Format</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RadioGroup
                            value={locationCoordinateFormat}
                            onValueChange={handleCoordFormatChange}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                        >
                            <div className="flex">
                                <RadioGroupItem value="Decimal Degrees" id="decimal-degrees" className="peer sr-only" />
                                <Label
                                    htmlFor="decimal-degrees"
                                    className="flex flex-1 items-center justify-center rounded-sm bg-popover p-3 text-center hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground"
                                >
                                    Decimal Degrees
                                </Label>
                            </div>
                            <div className="flex">
                                <RadioGroupItem value="Degrees, Minutes, Seconds" id="dms" className="peer sr-only" />
                                <Label
                                    htmlFor="dms"
                                    className="flex flex-1 items-center justify-center rounded-sm bg-popover p-3 text-center hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground"
                                >
                                    Degrees, Minutes, Seconds
                                </Label>
                            </div>
                        </RadioGroup>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

// ADDED: A reusable sub-component for the new filter's UI
const ReviewDataFilter = ({ value, onChange }: { value: YesNoAll, onChange: (value: YesNoAll) => void }) => {
    const options: { value: YesNoAll, label: string }[] = [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "all", label: "All" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Has Review Data?</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    value={value}
                    onValueChange={onChange}
                    className="grid grid-cols-3 gap-2"
                >
                    {options.map(option => (
                        <div key={option.value} className="flex">
                            <RadioGroupItem value={option.value} id={`review-data-${option.value}`} className="peer sr-only" />
                            <Label
                                htmlFor={`review-data-${option.value}`}
                                className="flex flex-1 items-center justify-center rounded-sm bg-popover p-3 text-center text-sm peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary [&:has([data-state=checked])]:text-primary-foreground"
                            >
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
        </Card>
    );
};

export default MapConfigurations;