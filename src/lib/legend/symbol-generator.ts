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

    return new SimpleLineSymbol({
        color: stroke,
        width: strokeWidth,
        cap: strokeLinecap,
        join: strokeLinejoin,
        style: strokeDasharray ? "dash" : "solid",
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