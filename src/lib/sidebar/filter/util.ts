import { ExtendedGeometry } from "@/components/sidebar/filter/search-combobox";
import Extent from "@arcgis/core/geometry/Extent";
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