import Graphic from "@arcgis/core/Graphic.js";
import Polyline from "@arcgis/core/geometry/Polyline.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";

// Function to fetch suggestions from the search box
export const fetchQFaultSuggestions = async (params: { suggestTerm: string, sourceIndex: number }, url: string): Promise<__esri.SuggestResult[]> => {
    const response = await fetch(`${url}?search_term=${encodeURIComponent(params.suggestTerm)}`);
    const data = await response.json();

    return data.features.map((item: any) => {
        return {
            text: '<p>' + item.properties.concatnames + '</p>',
            key: item.properties.concatnames,
            sourceIndex: params.sourceIndex,
        };
    });
};

// Function to fetch results from the search box
export const fetchQFaultResults = async (params: any, url: string): Promise<__esri.SearchResult[]> => {
    let searchUrl = url;
    let searchTerm = '';

    // If the sourceIndex is not null, then the user selected a suggestion from the search box
    // If the sourceIndex is null, then the user pressed enter in the search box or hit the search button (a non specific search)
    if (params.suggestResult.sourceIndex !== null) {
        searchTerm = params.suggestResult.key ? params.suggestResult.key : '';
        searchUrl += `?search_key=${encodeURIComponent(searchTerm)}`;
    } else {
        searchTerm = params.suggestResult.text ? params.suggestResult.text : '';
        searchUrl += `?search_term=${encodeURIComponent(searchTerm)}`;
    }

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (data.features.length === 0) {
        return [];
    }

    // Create graphics for each feature returned from the search
    const graphics: __esri.Graphic[] = data.features.map((item: any) => {
        const polyline = new Polyline({
            paths: item.geometry.coordinates,
            spatialReference: new SpatialReference({
                wkid: 4326
            }),
        });

        return new Graphic({
            geometry: polyline,
            attributes: item.attributes
        });
    });

    // Create a merged polyline to add the polyline paths to
    const mergedPolyline = new Polyline({
        spatialReference: new SpatialReference({ wkid: 4326 })
    });

    // Add the paths from each graphic to the merged polyline
    graphics.forEach((graphic: __esri.Graphic) => {
        const polyline = graphic.geometry as Polyline;
        const paths = polyline.paths;
        paths.forEach(path => {
            mergedPolyline.addPath(path);
        });
    });

    // Create attributes for the target graphic
    const attributes = params.sourceIndex !== null
        ? { name: data.features[0].properties.concatnames }
        : { name: `Search results for: ${params.text}` };

    // Create a target graphic to return
    const target = new Graphic({
        geometry: mergedPolyline,
        attributes: attributes
    });

    return [{
        extent: mergedPolyline.extent,
        name: target.attributes.name,
        feature: target,
        target: target
    }];
};