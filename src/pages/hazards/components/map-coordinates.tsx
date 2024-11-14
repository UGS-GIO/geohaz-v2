// const handleMobileViewChange = useCallback(
//     ({ view }: { view: __esri.MapView | __esri.SceneView }) => {
//         let watchHandle: __esri.WatchHandle;
//         view.when(() => {
//             watchHandle = reactiveUtils.watch(
//                 () => [view.zoom, view.center],
//                 () => {
//                     const xyPoint = {
//                         x: view.center.longitude.toFixed(3),
//                         y: view.center.latitude.toFixed(3),
//                     };
//                     const convertedCoords = convertCoordinates(xyPoint.x, xyPoint.y);
//                     setCoordinates(convertedCoords);
//                     setScale(view.scale);
//                 }
//             );
//         })

//         return () => {
//             watchHandle.remove();
//         };
//     },
//     [view]
// );


import { Switch } from "@/components/ui/switch";
import { MapContext } from "@/context/map-provider";
import { useMapCoordinates } from "@/hooks/use-map-coordinates";
import { addCommas } from "@/lib/utils";
import { useContext, useEffect } from "react";

const MapCoordinates = () => {
    const { view, isMobile } = useContext(MapContext);
    const {
        coordinates,
        scale,
        handleDesktopViewChange,
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

    // Use desktop or mobile view handlers based on device type
    useEffect(() => {
        let viewChangeHandler: () => void;

        if (view) {

            if (isMobile) {
                // viewChangeHandler = handleMobileViewChange({ view });
            } else {
                viewChangeHandler = handleDesktopViewChange({ view });
            }
        }

        return () => {
            if (viewChangeHandler) viewChangeHandler();
        };
    }, [view, isMobile, handleDesktopViewChange]);

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
                    Scale: 1:{addCommas(scale?.toFixed(0).toString() || '')}
                </span>
            </div>
        </div>
    );
};

export { MapCoordinates };
