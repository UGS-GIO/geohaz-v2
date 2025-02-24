import { MapWidgets } from '@/pages/ccus/components/map-widgets';
import { MapContextMenu } from "@/components/custom/map/map-context-menu";
import { PopupDrawer } from "@/components/custom/popups/popup-drawer";
import { useMapContainer } from "@/hooks/use-map-container";
import { LayerOrderConfig } from '@/hooks/use-get-layer-config';

export default function ArcGISMap() {
    const layerOrderConfigs: LayerOrderConfig[] = [
        { layerName: "_global_", reverse: true }, // The layerName doesn't matter when using reverse because we're reversing the entire structure
    ];

    const {
        mapRef,
        contextMenuTriggerRef,
        drawerTriggerRef,
        popupContainer,
        setPopupContainer,
        popupContent,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleOnContextMenu,
        coordinates,
        setCoordinates,
    } = useMapContainer({
        wmsUrl: 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/wms',
        layerOrderConfigs
    });

    return (
        <>
            <MapContextMenu coordinates={coordinates} hiddenTriggerRef={contextMenuTriggerRef} />
            <div
                className="relative w-full h-full"
                ref={mapRef}
                onContextMenu={e => handleOnContextMenu(e, contextMenuTriggerRef, setCoordinates)}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
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
