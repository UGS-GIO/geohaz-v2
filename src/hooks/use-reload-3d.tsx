import { useContext, useEffect, useState } from "react";
import { useMapUrlParams } from "@/hooks/use-map-url-params";
import { MapContext } from "@/context/map-provider";
import { useGetLayerConfig } from "@/hooks/use-get-layer-config";

const useReload3d = () => {
    const [is3d, setIs3d] = useState(false);
    const { view, mapRef, reloadMap } = useContext(MapContext);
    const { zoom, center } = useMapUrlParams(view);
    const layersConfig = useGetLayerConfig();

    useEffect(() => {
        if (is3d) {
            if (mapRef?.current && reloadMap && layersConfig) {
                console.log('reloading 3d map');

                reloadMap(mapRef.current, { zoom, center }, layersConfig, 'scene');
            }
        } else {
            console.log('reloading 2d map');
            if (mapRef?.current && reloadMap && layersConfig) {
                reloadMap(mapRef.current, { zoom, center }, layersConfig, 'map');
            }
        }
    }, [is3d]);

    return { is3d, setIs3d };
}
export { useReload3d };
