// @/pages/ccus/components/map-container.tsx
import { useEffect } from 'react';
import { MapWidgets } from '@/pages/ccus/components/map-widgets';
import { MapContextMenu } from "@/components/custom/map/map-context-menu";
import { PopupDrawer } from "@/components/custom/popups/popup-drawer";
import { useMapContainer } from "@/hooks/use-map-container";
import { PROD_GEOSERVER_URL } from '@/lib/constants';
import { wellWithTopsWMSTitle } from '@/pages/ccus/data/layers';
import { findAndApplyWMSFilter } from '@/pages/ccus/components/sidebar/map-configurations/map-configurations';
import { CCUSSearch } from '@/routes/ccus';

interface MapContainerProps {
    searchParams: CCUSSearch;
    updateLayerSelection: (layerTitle: string, selected: boolean) => void;
}

export default function MapContainer({ searchParams, updateLayerSelection }: MapContainerProps) {
    const {
        mapRef,
        contextMenuTriggerRef,
        drawerTriggerRef,
        popupContainer,
        setPopupContainer,
        popupContent,
        clickOrDragHandlers,
        handleOnContextMenu,
        coordinates,
        setCoordinates,
        view,
    } = useMapContainer({
        wmsUrl: `${PROD_GEOSERVER_URL}wms`,
    });

    // CCUS-specific effect for applying filters on initial load
    useEffect(() => {
        // Wait for the map and filters to be ready
        if (!view || !view.map) return;

        const filtersFromUrl = searchParams.filters ?? {};
        const wellFilter = filtersFromUrl[wellWithTopsWMSTitle] || null;
        console.log('Applying WMS filter:', wellFilter);

        findAndApplyWMSFilter(view.map, wellWithTopsWMSTitle, wellFilter);
        if (wellFilter) {
            updateLayerSelection(wellWithTopsWMSTitle, true);
        }
    }, [view, searchParams.filters, updateLayerSelection]);

    return (
        <>
            <MapContextMenu coordinates={coordinates} hiddenTriggerRef={contextMenuTriggerRef} />
            <div
                className="relative w-full h-full"
                ref={mapRef}
                onContextMenu={e => handleOnContextMenu(e, contextMenuTriggerRef, setCoordinates)}
                {...clickOrDragHandlers}
            >
                <MapWidgets />
            </div>
            <PopupDrawer
                container={popupContainer}
                drawerTriggerRef={drawerTriggerRef}
                popupContent={popupContent}
                popupTitle="CCUS Information"
            />
            <div ref={setPopupContainer} />
        </>
    );
}