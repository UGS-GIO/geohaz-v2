import { useEffect } from 'react';
import { MapWidgets } from '@/pages/carbonstorage/components/map-widgets';
import { MapContextMenu } from "@/components/custom/map/map-context-menu";
import { PopupDrawer } from "@/components/custom/popups/popup-drawer";
import { useMapContainer } from "@/hooks/use-map-container";
import { PROD_GEOSERVER_URL } from '@/lib/constants';
import { wellWithTopsWMSTitle } from '@/pages/carbonstorage/data/layers';
import { findAndApplyWMSFilter } from '@/pages/carbonstorage/components/sidebar/map-configurations/map-configurations';
import { CcsSearchParams } from '@/routes/carbonstorage';
import { useGetLayerConfig } from '@/hooks/use-get-layer-config';

interface MapContainerProps {
    searchParams: CcsSearchParams;
    updateLayerSelection: (layerTitle: string, selected: boolean) => void;
}

export default function MapContainer({ searchParams, updateLayerSelection }: MapContainerProps) {
    const defaultLayersConfig = useGetLayerConfig('layers');

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
        layersConfig: defaultLayersConfig,
    });

    // ccs-specific effect for applying filters on initial load
    useEffect(() => {
        // Wait for the map and filters to be ready
        if (!view || !view.map) return;

        const filtersFromUrl = searchParams.filters ?? {};
        const wellFilter = filtersFromUrl[wellWithTopsWMSTitle] || null;

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
                popupTitle="CCS Information"
            />
            <div ref={setPopupContainer} />
        </>
    );
}