import { MapWidgets } from '@/pages/minerals/components/map-widgets';
import { MapContextMenu } from "@/components/custom/map/map-context-menu";
import { PopupDrawer } from "@/components/custom/popups/popup-drawer";
import { useMapContainer } from "@/hooks/use-map-container";

export default function ArcGISMap() {
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
        wmsUrl: 'https://ugs-geoserver-prod-flbcoqv7oa-uc.a.run.app/geoserver/wms'
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
                popupTitle="CCUS Information"
            />
            <div ref={setPopupContainer} />
        </>
    );
}