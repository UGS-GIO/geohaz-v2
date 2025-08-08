import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Point from '@arcgis/core/geometry/Point';
import { Feature } from 'geojson';
import { LayerOrderConfig } from "@/hooks/use-get-layer-config";
import { LayerContentProps } from '@/components/custom/popups/popup-content-with-pagination';
import { createBbox } from "@/lib/map/utils";

interface WMSQueryProps {
    mapPoint: __esri.Point;
    view: __esri.MapView | __esri.SceneView;
    layers: string[];
    url: string;
    version?: '1.1.1' | '1.3.0';
    headers?: Record<string, string>;
    infoFormat?: string;
    buffer?: number;
    featureCount?: number;
    cql_filter?: string | null;
}

export async function fetchWMSFeatureInfo({
    mapPoint,
    view,
    layers,
    url,
    version = '1.3.0',
    headers = {},
    infoFormat = 'application/json',
    buffer = 10,
    featureCount = 50,
    cql_filter = null
}: WMSQueryProps): Promise<any> {
    if (layers.length === 0) {
        console.warn('No layers specified to query.');
        return null;
    }

    const bbox = createBbox({
        mapPoint,
        resolution: view.resolution,
        buffer
    });

    const { minX, minY, maxX, maxY } = bbox;

    // Different versions handle coordinates differently
    const bboxString = version === '1.1.1'
        ? `${minY},${minX},${maxY},${maxX}` // 1.1.0 uses lat,lon order
        : `${minX},${minY},${maxX},${maxY}`; // 1.3.1 uses lon,lat order

    const params = new URLSearchParams();

    // Add base parameters
    params.set('service', 'WMS');
    params.set('request', 'GetFeatureInfo');
    params.set('version', version);
    params.set('layers', layers.join(','));
    params.set('query_layers', layers.join(','));
    params.set('info_format', infoFormat);
    params.set('bbox', bboxString);
    params.set('crs', 'EPSG:3857');
    params.set('width', view.width.toString());
    params.set('height', view.height.toString());
    params.set('feature_count', featureCount.toString());

    // Add version-specific pixel coordinates
    if (version === '1.3.0') {
        params.set('i', Math.round(view.width / 2).toString());
        params.set('j', Math.round(view.height / 2).toString());
    } else {
        params.set('x', Math.round(view.width / 2).toString());
        params.set('y', Math.round(view.height / 2).toString());
    }

    if (cql_filter) {
        params.set('cql_filter', cql_filter);
    }

    const response = await fetch(`${url}?${params.toString()}`, { headers });

    if (!response.ok) {
        throw new Error(`GetFeatureInfo request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Handle both raster and vector responses
    if (data.results) {
        // Raster response
        return data.results[0]?.value;
    } else if (data.features) {
        // Vector response - add namespaces
        const namespaceMap = layers.reduce((acc, layer) => {
            const [namespace, layerName] = layer.split(':');
            if (namespace && layerName) {
                acc[layerName] = namespace;
            }
            return acc;
        }, {} as Record<string, string>);

        const featuresWithNamespace = data.features.map((feature: any) => {
            const layerName = feature.id?.split('.')[0];
            const namespace = namespaceMap[layerName] || null;
            return {
                ...feature,
                namespace,
            };
        });

        return { ...data, features: featuresWithNamespace };
    }

    return data;
}

// Reorder layers based on the specified order config. this is useful for reordering layers in the popup
const reorderLayers = (layerInfo: LayerContentProps[], layerOrderConfigs: LayerOrderConfig[]): LayerContentProps[] => {
    // First, create an object to map layer names to their desired positions
    const layerPositions: Record<string, number> = {};

    // Loop through layerOrderConfigs and assign positions
    layerOrderConfigs.forEach(config => {
        if (config.position === 'start') {
            layerPositions[config.layerName] = -Infinity; // Move to the front
        } else if (config.position === 'end') {
            layerPositions[config.layerName] = Infinity; // Move to the back
        }
    });

    // Now, sort the layers based on these positions
    return layerInfo.sort((a, b) => {
        // Determine the title to use for layer A (considering empty layerTitle)
        const aLayerTitle = a.layerTitle.trim() || a.groupLayerTitle.trim() || "Unnamed Layer";
        // Determine the title to use for layer B
        const bLayerTitle = b.layerTitle.trim() || b.groupLayerTitle.trim() || "Unnamed Layer";

        // Get positions from the layerPositions map (default to 0 if not found)
        const aPosition = layerPositions[aLayerTitle] ?? 0;
        const bPosition = layerPositions[bLayerTitle] ?? 0;

        // Compare positions
        return aPosition - bPosition;
    });
};

/**
 * Safely parses the CRS from a GeoJSON object from GeoServer.
 * Defaults to WGS 84 ('EPSG:4326') if the crs member is missing, per the GeoJSON spec.
 */
const getSourceCRSFromGeoJSON = (geoJson: any): string => {

    const crsName = geoJson?.crs?.properties?.name;
    console.log('CRS Name:', crsName);
    if (typeof crsName === 'string') {
        const epsgMatch = crsName.match(/EPSG::(\d+)/);
        if (epsgMatch && epsgMatch[1]) {
            return `EPSG:${epsgMatch[1]}`;
        }
    }
    // If no CRS is specified, default to WGS 84
    return 'EPSG:4326';
};

interface UseFeatureInfoQueryProps {
    view: __esri.MapView | __esri.SceneView | undefined;
    wmsUrl: string;
    visibleLayersMap: Record<string, LayerContentProps>;
    layerOrderConfigs: LayerOrderConfig[];
}

export function useFeatureInfoQuery({ view, wmsUrl, visibleLayersMap, layerOrderConfigs }: UseFeatureInfoQueryProps) {
    const [mapPoint, setMapPoint] = useState<Point | null>(null);

    const queryFn = async (): Promise<LayerContentProps[]> => {
        if (!view || !mapPoint) return [];

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

        // Extract the source CRS for all features in this response.
        const sourceCRS = getSourceCRSFromGeoJSON(featureInfo);

        const layerInfoPromises = Object.entries(visibleLayersMap)
            .filter(([_, value]) => value.visible)
            .map(async ([key, value]) => {
                const baseLayerInfo = {
                    visible: value.visible,
                    layerTitle: value.layerTitle,
                    groupLayerTitle: value.groupLayerTitle,
                    sourceCRS: sourceCRS,
                    features: featureInfo.features.filter((feature: Feature) =>
                        feature.id?.toString().includes(key.split(':')[0]) ||
                        feature.id?.toString().split('.')[0].includes(key.split(':')[1])
                    ),
                    popupFields: value.popupFields,
                    linkFields: value.linkFields,
                    colorCodingMap: value.colorCodingMap,
                    relatedTables: value.relatedTables?.map(table => ({
                        ...table,
                        matchingField: table.matchingField || "",
                        fieldLabel: table.fieldLabel || ""
                    })),
                    schema: value.schema,
                    rasterSource: value.rasterSource
                };

                if (value.rasterSource) {
                    const rasterFeatureInfo = await fetchWMSFeatureInfo({
                        mapPoint,
                        view,
                        layers: [value.rasterSource.layerName],
                        url: value.rasterSource.url,
                    });
                    baseLayerInfo.rasterSource = { ...value.rasterSource, data: rasterFeatureInfo };
                }

                return baseLayerInfo as LayerContentProps;
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