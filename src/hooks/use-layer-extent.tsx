import Extent from "@arcgis/core/geometry/Extent";
import { useQuery } from "@tanstack/react-query";
import { XMLParser } from "fast-xml-parser";
import { TypeNarrowedLayer } from "@/hooks/use-custom-layerlist";

const parseCapabilitiesExtent = (xml: string, targetLayerName: string): Extent | null => {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_'
    });

    try {
        const parsed = parser.parse(xml);
        const capability = parsed.WMS_Capabilities?.Capability ||
            parsed.WMT_MS_Capabilities?.Capability;

        if (!capability?.Layer) return null;

        // Helper function to find layer by name
        const findLayerByName = (layer: any, name: string): any => {
            if (layer.Name === name) return layer;
            if (layer.Layer) {
                if (Array.isArray(layer.Layer)) {
                    for (const sublayer of layer.Layer) {
                        const found = findLayerByName(sublayer, name);
                        if (found) return found;
                    }
                } else {
                    return findLayerByName(layer.Layer, name);
                }
            }
            return null;
        };

        const targetLayer = findLayerByName(capability.Layer, targetLayerName);

        if (!targetLayer) return null;

        // Try WMS 1.3.0 BoundingBox
        if (targetLayer.BoundingBox) {
            const bbox = Array.isArray(targetLayer.BoundingBox)
                ? targetLayer.BoundingBox.find((box: any) =>
                    box['@_CRS'] === 'EPSG:4326' || box['@_CRS'] === 'CRS:84')
                : targetLayer.BoundingBox;

            if (bbox) {
                return new Extent({
                    xmin: parseFloat(bbox['@_minx']),
                    ymin: parseFloat(bbox['@_miny']),
                    xmax: parseFloat(bbox['@_maxx']),
                    ymax: parseFloat(bbox['@_maxy'])
                });
            }
        }

        // Try WMS 1.3.0 EX_GeographicBoundingBox
        if (targetLayer.EX_GeographicBoundingBox) {
            const bbox = targetLayer.EX_GeographicBoundingBox;
            return new Extent({
                xmin: parseFloat(bbox.westBoundLongitude),
                ymin: parseFloat(bbox.southBoundLatitude),
                xmax: parseFloat(bbox.eastBoundLongitude),
                ymax: parseFloat(bbox.northBoundLatitude)
            });
        }

        return null;
    } catch (error) {
        console.error('Error parsing GetCapabilities response:', error);
        return null;
    }
};

const fetchLayerExtent = async (layer: TypeNarrowedLayer): Promise<__esri.Extent> => {
    if (layer.type === 'wms') {
        const wmsLayer = layer as __esri.WMSLayer;
        const sublayer = wmsLayer.allSublayers.getItemAt(0);

        if (!sublayer || !layer.url) {
            console.warn('No sublayer or URL found for WMS layer:', layer);
            return wmsLayer.fullExtent || new Extent();
        }

        // Extract namespace and layer name
        const layerName = sublayer.name;
        const [namespace, _name] = layerName.split(':');

        // Construct GetCapabilities URL with version (1.3.0 is most current)
        const capabilitiesUrl = new URL(layer.url);
        capabilitiesUrl.searchParams.set('service', 'WMS');
        capabilitiesUrl.searchParams.set('version', '1.3.0');
        capabilitiesUrl.searchParams.set('request', 'GetCapabilities');

        if (namespace) {
            capabilitiesUrl.searchParams.set('namespace', namespace);
        }

        try {
            const response = await fetch(capabilitiesUrl.toString());

            if (!response.ok) {
                throw new Error(`Failed to fetch capabilities: ${response.statusText}`);
            }

            const xml = await response.text();
            const extent = parseCapabilitiesExtent(xml, layerName);

            if (extent) {
                // Convert to ArcGIS Extent
                return {
                    xmin: extent.xmin,
                    ymin: extent.ymin,
                    xmax: extent.xmax,
                    ymax: extent.ymax,
                    spatialReference: { wkid: 4326 } // WMS typically uses WGS84
                } as __esri.Extent;
            }
        } catch (error) {
            console.error('Error fetching WMS capabilities:', error);
        }

        // Fallback to layer's fullExtent if parsing fails
        return wmsLayer.fullExtent || new Extent();
    }

    // Handle other layer types
    if (layer.type === 'map-image') {
        return (layer as __esri.MapImageLayer).fullExtent || new Extent();
    }

    if (layer.type === 'feature') {
        return (layer as __esri.FeatureLayer).fullExtent || new Extent();
    }

    console.warn('Unsupported layer type');
    return new Extent();
};

const useLayerExtent = (layer: TypeNarrowedLayer) => {
    return useQuery({
        queryKey: ['layerExtent', layer.id],
        queryFn: () => fetchLayerExtent(layer),
        enabled: false, // Prevents automatic fetching
        staleTime: Infinity, // Keeps the data fresh forever (never marks as stale)
    });
};

export { useLayerExtent };