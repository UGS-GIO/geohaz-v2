import { ExtendedGeometry } from "@/components/sidebar/filter/search-combobox";
import { extractCoordinates, convertCoordinates, HighlightOptions, createHighlightGraphic, convertBbox } from "@/lib/mapping-utils";
import Extent from "@arcgis/core/geometry/Extent";
import { Feature, GeoJsonProperties } from "geojson";
import * as turf from "@turf/turf";

export interface SearchResult {
    name: string,
    feature: Feature<ExtendedGeometry, GeoJsonProperties>,
}

export const highlightSearchResult = async (
    searchResult: Feature<ExtendedGeometry, GeoJsonProperties>,
    view: __esri.MapView | __esri.SceneView,
    options?: HighlightOptions
) => {

    const geom = searchResult.geometry
    // Prepare the result for highlighting
    const feature = turf.feature(geom, {
        ...searchResult
    });
    const resultToHighlight: SearchResult = {
        name: feature.geometry.crs?.properties.name || '',
        feature: feature,
    };

    const targetFeature = resultToHighlight.feature
    const defaultHighlightOptions: HighlightOptions = {
        fillColor: [0, 0, 0, 0],
        outlineColor: [255, 0, 0, 1],
        outlineWidth: 4,
        pointSize: 5
    }

    const highlightOptions = { ...defaultHighlightOptions, ...options };
    const graphics = createHighlightGraphic(targetFeature, highlightOptions);
    view.graphics.removeAll();

    graphics.forEach(graphic => view.graphics.add(graphic));

    // Return the converted coordinates if needed
    const coordinates = extractCoordinates(targetFeature);

    let coords = coordinates;

    if (targetFeature.geometry.crs?.properties.name !== 'EPSG:4326' && targetFeature.geometry.crs?.properties.name !== undefined) {
        // currently configured to convert from EPSG:26912 to EPSG:4326
        // todo: add more generic conversion
        coords = [convertCoordinates(coordinates)];
    } else if (targetFeature.geometry.crs?.properties.name === undefined) {
        console.warn('No CRS found for the feature geometry. Using original coordinates.');
    }

    return coords;
}

export const zoomToExtent = (xmin: number, ymin: number, xmax: number, ymax: number, view: __esri.SceneView | __esri.MapView) => {
    const extent = new Extent({
        xmin: xmin,
        ymin: ymin,
        xmax: xmax,
        ymax: ymax,
        spatialReference: { wkid: 4326 } // Assuming WGS 84 from the CRS
    });

    view.goTo(extent.expand(1.5)).catch(error => {
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
