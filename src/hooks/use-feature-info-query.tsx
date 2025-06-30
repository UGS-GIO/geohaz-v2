import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Point from '@arcgis/core/geometry/Point';
import { Feature } from 'geojson';
import { fetchWMSFeatureInfo, reorderLayers } from '@/lib/mapping-utils';
import { LayerOrderConfig } from "@/hooks/use-get-layer-config";
import { LayerContentProps } from '@/components/custom/popups/popup-content-with-pagination';


interface UseFeatureInfoQueryProps {
    view: __esri.MapView | __esri.SceneView | undefined;
    wmsUrl: string;
    visibleLayersMap: Record<string, LayerContentProps>;
    layerOrderConfigs: LayerOrderConfig[];
}

export function useFeatureInfoQuery({ view, wmsUrl, visibleLayersMap, layerOrderConfigs }: UseFeatureInfoQueryProps) {
    const [mapPoint, setMapPoint] = useState<Point | null>(null);

    const queryFn = async () => {
        if (!view || !mapPoint) return null;

        const queryableLayers = Object.entries(visibleLayersMap)
            .filter(([_, layerInfo]) => layerInfo.visible && layerInfo.queryable)
            .map(([key]) => key);

        if (queryableLayers.length === 0) return [];

        const featureInfo = await fetchWMSFeatureInfo({
            mapPoint,
            view,
            layers: queryableLayers,
            url: wmsUrl
        });

        if (!featureInfo || !featureInfo.features) return [];

        const layerInfoPromises = Object.entries(visibleLayersMap)
            .filter(([_, value]) => value.visible)
            .map(async ([key, value]) => {

                const baseLayerInfo: any = {
                    visible: value.visible,
                    layerTitle: value.layerTitle,
                    groupLayerTitle: value.groupLayerTitle,
                    features: featureInfo.features.filter((feature: Feature) =>
                        feature.id?.toString().includes(key.split(':')[0]) ||
                        feature.id?.toString().split('.')[0].includes(key.split(':')[1])
                    ),
                    ...(value.popupFields && { popupFields: value.popupFields }),
                    ...(value.linkFields && { linkFields: value.linkFields }),
                    ...(value.colorCodingMap && { colorCodingMap: value.colorCodingMap }),
                    ...(value.relatedTables && value.relatedTables.length > 0 && {
                        relatedTables: value.relatedTables.map(table => ({
                            ...table,
                            matchingField: table.matchingField || "",
                            fieldLabel: table.fieldLabel || ""
                        }))
                    }),
                    ...(value.schema && { schema: value.schema }),
                };

                if (value.rasterSource) {
                    const rasterFeatureInfo = await fetchWMSFeatureInfo({
                        mapPoint,
                        view,
                        layers: [value.rasterSource.layerName],
                        url: value.rasterSource.url,
                    });

                    baseLayerInfo.rasterSource = {
                        ...value.rasterSource,
                        data: rasterFeatureInfo
                    };
                }

                return baseLayerInfo;
            });

        const resolvedLayerInfo = await Promise.all(layerInfoPromises);
        const layerInfoFiltered = resolvedLayerInfo.filter(layer => layer.features.length > 0);

        return layerOrderConfigs.length > 0
            ? reorderLayers(layerInfoFiltered, layerOrderConfigs)
            : layerInfoFiltered;
    };

    const { data, isFetching, isSuccess, refetch } = useQuery({
        queryKey: ['wmsFeatureInfo', mapPoint?.toJSON()],
        queryFn,
        enabled: false,
        refetchOnWindowFocus: false,
    });

    const fetchForPoint = (point: Point) => {
        setMapPoint(point);
    };

    // trigger refetch when mapPoint changes
    useEffect(() => {
        if (mapPoint) {
            refetch();
        }
    }, [mapPoint, refetch]);

    return {
        fetchForPoint,
        data: isSuccess ? data : [], // Return data only on success, otherwise an empty array
        isFetching,
        isSuccess,
        lastClickedPoint: mapPoint,
    };
}