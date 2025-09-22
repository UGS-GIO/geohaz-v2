import { ExtendedGeometry } from "@/components/sidebar/filter/search-combobox";
import { findLayerByTitle } from "@/lib/map/utils";
import Extent from "@arcgis/core/geometry/Extent";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import { Feature, GeoJsonProperties } from "geojson";

export interface SearchResult {
    name: string,
    feature: Feature<ExtendedGeometry, GeoJsonProperties>,
}

export const zoomToExtent = (xmin: number, ymin: number, xmax: number, ymax: number, view: __esri.SceneView | __esri.MapView, scale?: number) => {
    const extent = new Extent({
        xmin: xmin,
        ymin: ymin,
        xmax: xmax,
        ymax: ymax,
        spatialReference: { wkid: 4326 } // Assuming WGS 84 from the CRS
    });

    view.goTo({
        target: extent.expand(1.5),
        scale: scale ? scale : undefined,
    }).catch(error => {
        if (error.name !== "AbortError") {
            console.error("Error zooming to extent:", error);
        }
    });
}

export const findAndApplyWMSFilter = (
    mapInstance: __esri.Map | null | undefined,
    layerTitle: string,
    cqlFilter: string | null
) => {
    if (!mapInstance) return;

    const layer = findLayerByTitle(mapInstance, layerTitle);

    if (layer?.type === 'wms') {
        const wmsLayer = layer as WMSLayer;
        const newCustomParameters = { ...(wmsLayer.customParameters || {}) };

        if (cqlFilter) {
            newCustomParameters.cql_filter = cqlFilter;
        } else {
            delete newCustomParameters.cql_filter;
        }

        if (JSON.stringify(wmsLayer.customParameters) !== JSON.stringify(newCustomParameters)) {
            wmsLayer.customParameters = newCustomParameters;
            wmsLayer.refresh();
        }
    }
};