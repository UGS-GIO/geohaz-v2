import { MapWidgets } from '@/pages/hazards-review/components/map-widgets';
import { MapContextMenu } from "@/components/custom/map/map-context-menu";
import { PopupDrawer } from "@/components/custom/popups/popup-drawer";
import { useMapContainer } from "@/hooks/use-map-container";
import { PROD_GEOSERVER_URL } from '@/lib/constants';
import { HazardsReviewSearchParams } from '@/routes/hazards-review';
import { useEffect } from 'react';
import { useGetLayerConfigs } from '@/hooks/use-get-layer-configs';


interface MapContainerProps {
    searchParams: HazardsReviewSearchParams;
    updateLayerSelection: (layerTitle: string, selected: boolean) => void;
}

export default function MapContainer({ searchParams, updateLayerSelection }: MapContainerProps) {
    const layersConfig = useGetLayerConfigs();

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
        layersConfig: layersConfig
    });


    // hazards-review-specific effect for applying filters on initial load
    useEffect(() => {
        // Wait for the map and filters to be ready
        if (!view || !view.map) return;
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
                popupTitle="Hazards in your area"
            />
            <div ref={setPopupContainer} />
        </>
    );
}
