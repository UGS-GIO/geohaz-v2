import { useContext, useEffect } from 'react';
import { MapContext } from '@/context/map-provider';

// Custom hook to provide the sidebar context data
export function useCoordinateFormat() {
    const context = useContext(MapContext);

    // Ensure the hook is used within the SidebarContextProvider
    if (!context) {
        throw new Error(
            'useSidebar must be used within the scope of SidebarContextProvider'
        );
    }

    const { isDecimalDegrees, setIsDecimalDegrees } = context;
    // console.log('isDecimalDegrees use-coordinate-format', isDecimalDegrees);


    useEffect(() => {
        // console.log('isDecimalDegrees map-configurations', isDecimalDegrees);

        if (isDecimalDegrees) {
            console.log("Decimal Degrees");
        } else {
            console.log("Degrees, Minutes, Seconds");
        }
    }, [isDecimalDegrees, setIsDecimalDegrees]);

    return context;
}
