import { ExtendedGeometry } from "@/components/sidebar/filter/search-combobox";
import { convertBbox } from "@/lib/map/conversion-utils";
import Extent from "@arcgis/core/geometry/Extent";
import { Feature, GeoJsonProperties } from "geojson";
import * as turf from "@turf/turf";

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


export const getBoundingBox = (geom: ExtendedGeometry) => {
    let xmin, ymin, xmax, ymax;
    [xmin, ymin, xmax, ymax] = turf.bbox(geom);

    // if the geometry is not in EPSG:4326, convert it to EPSG:4326
    if (geom.crs && geom.crs.properties.name !== "EPSG:4326") [xmin, ymin, xmax, ymax] = convertBbox([xmin, ymin, xmax, ymax]);

    return [xmin, ymin, xmax, ymax];
}
