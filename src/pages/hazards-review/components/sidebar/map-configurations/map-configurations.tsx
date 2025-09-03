import { useNavigate, useSearch } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BackToMenuButton } from '@/components/custom/back-to-menu-button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const reviewStatusOptions = [
    { value: 'standard', label: 'Live' },
    { value: 'review', label: 'Review' },
    { value: 'all', label: 'All' },
] as const;

type ReviewStatus = typeof reviewStatusOptions[number]['value'];

function MapConfigurations() {
    const navigate = useNavigate({ from: '/hazards-review' });
    const search = useSearch({ from: '/hazards-review/' });

    const reviewStatus = search.review_status;

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
                    <h3 className="text-lg font-medium">Map Configurations</h3>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Review Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Control which features are visible on the map based on their status.
                        </p>
                        <RadioGroup
                            value={reviewStatus}
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
            </div>
        </>
    );
}

export default MapConfigurations;