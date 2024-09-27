import { useContext, useRef, useState } from 'react';
import { MapContext } from '@/context/map-provider';

// Custom hook to provide the sidebar context data
export function useMapCoordinates() {
    const context = useContext(MapContext);
    const [coordinates, setCoordinates] = useState<{ x: string; y: string }>({ x: "000.000", y: "000.000" });
    const [scale, setScale] = useState<number>(context.view?.scale || 0);
    const lastPointerPosition = useRef<{ x: string; y: string }>({
        x: "",
        y: "",
    });



    // Ensure the hook is used within the SidebarContextProvider
    if (!context) {
        throw new Error(
            'useMapCoordinates must be used within the scope of MapContextProvider'
        );
    }

    // Return only the relevant values
    const { isDecimalDegrees, setIsDecimalDegrees } = context;

    return { isDecimalDegrees, setIsDecimalDegrees, coordinates, setCoordinates, scale, setScale, lastPointerPosition };
}
