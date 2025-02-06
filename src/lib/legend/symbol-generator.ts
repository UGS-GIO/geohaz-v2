import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import Symbol from "@arcgis/core/symbols/Symbol.js";
import { FillSymbolizer, LineCap, LineJoin, StrokeSymbolizer, Symbolizer } from "@/lib/types/geoserver-types";

export function createLineSymbol(symbolizers: Symbolizer[]): __esri.Symbol {
    const lineSymbolizer = symbolizers.find(symbolizer => 'Line' in symbolizer)?.Line as StrokeSymbolizer;

    if (!lineSymbolizer) {
        throw new Error("No valid Line symbolizer found in the provided symbolizers.");
    }

    const {
        stroke,
        "stroke-width": strokeWidth,
        "stroke-linecap": strokeLinecap,
        "stroke-linejoin": strokeLinejoin,
        "stroke-dasharray": strokeDasharray,
    } = lineSymbolizer;

    /**
     * The following code addresses the issue of mapping dasharray patterns to ArcGIS SimpleLineSymbol styles.
     * Because the SLD spec uses dasharray patterns that are not directly supported by the ArcGIS JS API,
     * the code maps the dasharray patterns to the closest supported style in ArcGIS JS API.
     * See the style options at: https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-SimpleLineSymbol.html?#style
     * If new patterns are needed, they need to be added to the map below.
     */

    type LineSymbolStyle = "solid" | "dash" | "dash-dot" | "dot" | "long-dash" | "long-dash-dot" | "long-dash-dot-dot" | "none" | "short-dash" | "short-dash-dot" | "short-dash-dot-dot" | "short-dot";


    // Explicitly typing the dashMap to be a Record with string keys and string values
    const dashMap: Record<string, LineSymbolStyle> = {
        '8.0,2.0': 'short-dash',
        '3.0,3.0': 'short-dot',
        '4.0,4.0': 'long-dash',
        '1.0,1.0': 'dot',
        // Add more patterns as needed
    };

    // Function to map dasharray to the style using the lookup object
    function mapDashArrayToStyle(dasharray: string[]): LineSymbolStyle {
        // Create a key by joining the dasharray values (which now include decimals)
        const dashKey = dasharray.join(',');

        // Return the corresponding style from the object, or default to 'solid' if not found
        return dashMap[dashKey] || 'solid';
    }

    // Map the dash array to one of the GeoServer styles
    const style = strokeDasharray ? mapDashArrayToStyle(strokeDasharray) : 'solid';

    return new SimpleLineSymbol({
        color: stroke,
        width: strokeWidth,
        cap: strokeLinecap,
        join: strokeLinejoin,
        style: style,  // Use the mapped style here
        miterLimit: 2,
    });
}

type SymbolizerWithPolygon = Symbolizer & { Polygon: FillSymbolizer | StrokeSymbolizer };

function isSymbolizerWithPolygon(symbolizer: Symbolizer): symbolizer is SymbolizerWithPolygon {
    return 'Polygon' in symbolizer;
}

function handleFillSymbolizer(fillSymbolizer: FillSymbolizer) {
    const fillOpacity = parseFloat(fillSymbolizer["fill-opacity"]);
    return addOpacityToHex(fillSymbolizer.fill, fillOpacity);
}

function handleStrokeSymbolizer(strokeSymbolizer: StrokeSymbolizer) {
    const strokeOpacity = parseFloat(strokeSymbolizer["stroke-opacity"]) || 1;
    const strokeWidth = parseFloat(strokeSymbolizer["stroke-width"]) || 1;
    const strokeJoin = strokeSymbolizer["stroke-linejoin"] || "round";
    const strokeCap = strokeSymbolizer["stroke-linecap"] || "round";
    const strokeColorWithOpacity = addOpacityToHex(strokeSymbolizer.stroke, strokeOpacity);

    return { strokeColorWithOpacity, strokeWidth, strokeJoin, strokeCap };
}

export function createPolygonSymbol(symbolizers: Symbolizer[]): __esri.Symbol {
    let fillColorWithOpacity = "";
    let strokeColorWithOpacity = "";
    let strokeWidth = 1;
    let strokeJoin: LineJoin = "round";
    let strokeCap: LineCap = "round";

    const PolygonSymbolizer = symbolizers.find(symbolizer => 'Polygon' in symbolizer)?.Polygon as StrokeSymbolizer;

    if (!PolygonSymbolizer) {
        throw new Error("No valid Polygon symbolizer found in the provided symbolizers.");
    }

    symbolizers.forEach(symbolizer => {
        if (isSymbolizerWithPolygon(symbolizer)) {
            if ('fill' in symbolizer.Polygon) {
                fillColorWithOpacity = handleFillSymbolizer(symbolizer.Polygon);
            }

            if ('stroke' in symbolizer.Polygon) {
                const strokeSymbolizer = handleStrokeSymbolizer(symbolizer.Polygon);
                strokeColorWithOpacity = strokeSymbolizer.strokeColorWithOpacity;
                strokeWidth = strokeSymbolizer.strokeWidth;
                strokeJoin = strokeSymbolizer.strokeJoin;
                strokeCap = strokeSymbolizer.strokeCap;
            }
        }
    });

    return new SimpleFillSymbol({
        color: fillColorWithOpacity,
        style: "solid", // Default style
        outline: {
            color: strokeColorWithOpacity,
            width: strokeWidth,
            join: strokeJoin,
            cap: strokeCap
        }
    });
}

export function createPointSymbol(symbolizers: Symbolizer[]): __esri.Symbol {
    const pointSymbolizer = symbolizers.find(symbolizer => 'Point' in symbolizer)?.Point;

    if (!pointSymbolizer) {
        throw new Error("No valid Point symbolizer found in the provided symbolizers.");
    }

    const { size, opacity, rotation, url } = pointSymbolizer;

    const graphic = pointSymbolizer.graphics[0]; // Take the first graphic only

    const fillColorWithOpacity = addOpacityToHex(graphic.fill, parseFloat(opacity) * parseFloat(graphic["fill-opacity"]));

    if (url) {
        return new PictureMarkerSymbol({
            url,
            width: parseFloat(size),
            height: parseFloat(size),
        });
    }

    return new SimpleMarkerSymbol({
        color: fillColorWithOpacity,
        size: parseFloat(size),
        angle: parseFloat(rotation),
        // style:  graphic.mark.toLowerCase(), // Converts 'square' to 'SQUARE'
        outline: {
            color: graphic.stroke, // Use stroke color from graphic
            width: parseFloat(graphic["stroke-width"]) // Use stroke width from graphic
        }
    });

}

function addOpacityToHex(hex: string, opacity: number): string {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0').toUpperCase();
    return `${hex}${alpha}`;
}




export function createEsriSymbol(symbolizers: Symbolizer[]): __esri.Symbol {
    if (symbolizers.every(symbolizer => symbolizer.Line)) {
        return createLineSymbol(symbolizers);
    } else if (symbolizers.every(symbolizer => symbolizer.Polygon)) {
        return createPolygonSymbol(symbolizers);
    } else if (symbolizers.every(symbolizer => symbolizer.Point)) {
        return createPointSymbol(symbolizers);
    } else {
        console.error("Unsupported symbol type:", symbolizers);
        return new Symbol();
    }
}