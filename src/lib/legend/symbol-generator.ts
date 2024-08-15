import SimpleLineSymbol from "@arcgis/core/symbols/SimpleLineSymbol";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol.js";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol.js";
import Symbol from "@arcgis/core/symbols/Symbol.js";
import { LineSymbolizer, Symbolizer } from "@/lib/types/geoserver-types";

export function createLineSymbol(symbolizer: Symbolizer): __esri.Symbol {

    const LineSymbolizer = symbolizer.Line as LineSymbolizer;


    const {
        stroke,
        "stroke-width": strokeWidth,
        "stroke-linecap": strokeLinecap,
        "stroke-linejoin": strokeLinejoin,
        "stroke-dasharray": strokeDasharray,
    } = LineSymbolizer;

    // console.log('line-symbolizer', symbolizer);
    return new SimpleLineSymbol({
        color: stroke,
        width: strokeWidth,
        cap: strokeLinecap,
        join: strokeLinejoin,
        style: strokeDasharray ? "dash" : "solid",
        miterLimit: 2,
    });
}

export function createPolygonSymbol(symbolizer: any): __esri.Symbol {

    const {

    } = symbolizer.Polygon;

    // console.log('polygon-symbolizer', symbolizer);

    return new SimpleFillSymbol({
        // fill this in with real values
    });
}

export function createPointSymbol(symbolizer: any): __esri.Symbol {
    const { size, opacity, rotation } = symbolizer.Point;
    const graphic = symbolizer.Point.graphics[0]; // Take the first graphic only

    const fillColorWithOpacity = addOpacityToHex(graphic.fill, parseFloat(opacity) * parseFloat(graphic["fill-opacity"]));

    return new SimpleMarkerSymbol({
        color: fillColorWithOpacity,
        size: parseFloat(size),
        angle: parseFloat(rotation),
        style: graphic.mark.toLowerCase(), // Converts 'square' to 'SQUARE'
        outline: {
            color: "#000000", // Black outline by default
            width: 1 // Default outline width
        }
    });
}

function addOpacityToHex(hex: string, opacity: number): string {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0').toUpperCase();
    return `${hex}${alpha}`;
}




export function createEsriSymbol(symbolizer: any): __esri.Symbol {
    // console.log(symbolizer);
    if (symbolizer.Line) {
        return createLineSymbol(symbolizer);
    } else if (symbolizer.Polygon) {
        return createPolygonSymbol(symbolizer);
    } else if (symbolizer.Point) {
        return createPointSymbol(symbolizer);
    } else {
        console.error("Unsupported symbol type:", symbolizer.Line.type);
        return new Symbol();
    }
}