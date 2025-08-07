import { Switch } from "@/components/ui/switch";
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { addThousandsSeparator } from "@/lib/utils";

const MapCoordinates = () => {
    const {
        coordinates,
        scale,
        isDecimalDegrees,
        setIsDecimalDegrees,
    } = useMapCoordinates();

    const handleOnCheckedChange = () => (checked: boolean) => {
        if (checked) {
            setIsDecimalDegrees(false)
        } else {
            setIsDecimalDegrees(true)
        }
    }

    const UnitSwitch = () => (
        <>
            {/* decimal degrees */}
            <span className="text-sm text-muted-foreground">DD</span>
            <Switch
                checked={isDecimalDegrees ? false : true}
                onCheckedChange={handleOnCheckedChange()}
                aria-label="Toggle coordinate format"
                // Use the primary color for the unchecked state also
                // This is not an on/off toggle. it toggles between DD (left) and DMS (right)
                // ossible non-standard use of the switch component
                className="data-[state=unchecked]:bg-primary"
            />
            {/* degrees minutes seconds */}
            <span className="text-sm text-muted-foreground">DMS</span>
        </>
    )

    return (
        <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Lat:{' '}{coordinates.y}</span>
                <span className="text-sm text-muted-foreground">Lon:{' '}{coordinates.x}</span>
                <UnitSwitch />
                <div className="h-4 w-px bg-border" aria-hidden="true" />
                <span className="text-sm text-muted-foreground">
                    Scale: 1:{addThousandsSeparator(scale?.toFixed(0).toString() || '')}
                </span>
            </div>
        </div>
    );
};

export { MapCoordinates };
