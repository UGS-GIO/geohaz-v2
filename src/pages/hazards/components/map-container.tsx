import { MapWidgets } from '@/pages/hazards/components/map-widgets';
import { MapContextMenu } from "@/components/custom/map/map-context-menu";
import { PopupDrawer } from "@/components/custom/popups/popup-drawer";
import { useMapContainer } from "@/hooks/use-map-container";
import { PROD_GEOSERVER_URL } from '@/lib/constants';
import { useGetLayerConfigsData } from '@/hooks/use-get-layer-configs';
import { LoadingSpinner } from '@/components/custom/loading-spinner';
import { useIsMapLoading } from '@/hooks/use-is-map-loading';
import { useMap } from '@/hooks/use-map';

export default function MapContainer() {
    const defaultLayersConfig = useGetLayerConfigsData('layers');

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
    } = useMapContainer({
        wmsUrl: `${PROD_GEOSERVER_URL}wms`,
        layersConfig: defaultLayersConfig
    });
    const { view } = useMap();
    const isMapLoading = useIsMapLoading({
        view: view,
    });

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
                {isMapLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-50 bg-opacity-75">
                        <LoadingSpinner />
                    </div>
                )}
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
