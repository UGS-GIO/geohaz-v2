import { FillSymbolizer, LineCap, LineJoin, StrokeSymbolizer, Symbolizer } from "@/lib/types/geoserver-types";

// Constants for symbol generation
const SYMBOL_CONSTANTS = {
    SVG_WIDTH: 32,
    SVG_HEIGHT: 20,
    LINE_Y_CENTER: 10,
    LINE_START_X: 2,
    LINE_END_X: 30,
    MIN_LINE_WIDTH: 2,
    LINE_WIDTH_ENHANCEMENT: 1,
    TRIANGLE_HEIGHT: 6,
    TRIANGLE_COUNT: 4,
    PATTERN_TILE_SIZE: 8,
    POINT_TO_PIXEL_RATIO: 4 / 3,
    IMAGE_SCALING_RATIO: 5 / 4,
    MAX_POINT_SIZE: 17,
    DEFAULT_POINT_SIZE: 16
} as const;

// Interfaces for better type safety in graphic symbolizers
interface GraphicStrokeData {
    graphics?: Array<{
        mark?: string;
        fill?: string;
        stroke?: string;
        'stroke-width'?: string;
        size?: string;
    }>;
    size?: string;
}

interface GraphicFillData {
    graphics?: Array<{
        mark?: string;
        fill?: string;
        stroke?: string;
        'stroke-width'?: string;
    }>;
}

export interface CompositeSymbolResult {
    symbol?: SVGSVGElement;
    html?: HTMLElement | SVGSVGElement;
    isComposite: boolean;
    symbolizers: Symbolizer[];
}

// Enhanced function to create composite line symbols - now always returns SVG
export function createCompositeLineSymbol(symbolizers: Symbolizer[]): CompositeSymbolResult {
    const lineSymbolizers = symbolizers.filter(symbolizer => 'Line' in symbolizer);

    if (lineSymbolizers.length === 0) {
        throw new Error("No valid Line symbolizer found in the provided symbolizers.");
    }

    const compositeHtml = createCompositeLineHTML(lineSymbolizers);

    return {
        html: compositeHtml,
        symbol: compositeHtml,
        isComposite: lineSymbolizers.length > 1,
        symbolizers: lineSymbolizers
    };
}

function createCompositeLineHTML(lineSymbolizers: Symbolizer[]): SVGSVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", SYMBOL_CONSTANTS.SVG_WIDTH.toString());
    svg.setAttribute("height", SYMBOL_CONSTANTS.SVG_HEIGHT.toString());
    svg.setAttribute("viewBox", `0 0 ${SYMBOL_CONSTANTS.SVG_WIDTH} ${SYMBOL_CONSTANTS.SVG_HEIGHT}`);
    svg.style.display = "block";
    svg.style.width = `${SYMBOL_CONSTANTS.SVG_WIDTH}px`;
    svg.style.height = `${SYMBOL_CONSTANTS.SVG_HEIGHT}px`;
    svg.style.maxWidth = `${SYMBOL_CONSTANTS.SVG_WIDTH}px`;
    svg.style.maxHeight = `${SYMBOL_CONSTANTS.SVG_HEIGHT}px`;
    svg.style.minWidth = `${SYMBOL_CONSTANTS.SVG_WIDTH}px`;
    svg.style.minHeight = `${SYMBOL_CONSTANTS.SVG_HEIGHT}px`;

    // Process symbolizers in order (first = bottom layer, last = top layer)
    lineSymbolizers.forEach((symbolizer, index) => {
        try {
            const lineData = symbolizer.Line as StrokeSymbolizer;
            
            // Check if this symbolizer has GraphicStroke
            const lineDataAny = lineData as any;
            const graphicStroke = lineDataAny.GraphicStroke || lineDataAny['graphic-stroke'];
            
            if (graphicStroke) {
                // For GraphicStroke symbolizers, ONLY add the graphic symbols, not another line
                const strokeElements = createGraphicStrokeElements(graphicStroke);
                strokeElements.forEach(element => svg.appendChild(element));
            } else {
                // For regular line symbolizers, create the base line (which may have dash patterns)
                const line = createSVGLineElement(lineData);
                svg.appendChild(line);
            }
        } catch (error) {
            console.error(`Error processing line symbolizer at index ${index}:`, error);
        }
    });

    return svg;
}

// Create individual SVG line element
function createSVGLineElement(lineSymbolizer: StrokeSymbolizer): SVGLineElement {
    const {
        stroke = "#000000",
        "stroke-width": strokeWidth = "1",
        "stroke-linecap": strokeLinecap = "round",
        "stroke-linejoin": strokeLinejoin = "round",
        "stroke-dasharray": strokeDasharray,
        "stroke-opacity": strokeOpacity = "1",
    } = lineSymbolizer;

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

    // Position line in center of SVG
    line.setAttribute("x1", SYMBOL_CONSTANTS.LINE_START_X.toString());
    line.setAttribute("y1", SYMBOL_CONSTANTS.LINE_Y_CENTER.toString());
    line.setAttribute("x2", SYMBOL_CONSTANTS.LINE_END_X.toString());
    line.setAttribute("y2", SYMBOL_CONSTANTS.LINE_Y_CENTER.toString());

    // Make lines a bit thicker for better visibility
    const originalWidth = parseFloat(strokeWidth);
    const enhancedWidth = Math.max(SYMBOL_CONSTANTS.MIN_LINE_WIDTH, originalWidth + SYMBOL_CONSTANTS.LINE_WIDTH_ENHANCEMENT);

    // Apply styling
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-width", enhancedWidth.toString());
    line.setAttribute("stroke-linecap", strokeLinecap);
    line.setAttribute("stroke-linejoin", strokeLinejoin);
    line.setAttribute("stroke-opacity", strokeOpacity);

    // Handle dash patterns
    if (strokeDasharray && strokeDasharray.length > 0) {
        line.setAttribute("stroke-dasharray", strokeDasharray.join(" "));
    }

    return line;
}

// Main function to orchestrate which symbol to create
export function createSVGSymbol(symbolizers: Symbolizer[]): SVGSVGElement | CompositeSymbolResult {
    try {
        if (symbolizers.every(symbolizer => symbolizer.Line)) {
            const result = createCompositeLineSymbol(symbolizers);
            return result;
        } else if (symbolizers.every(symbolizer => symbolizer.Polygon)) {
            return createPolygonSymbol(symbolizers);
        } else if (symbolizers.every(symbolizer => symbolizer.Point)) {
            return createPointSymbol(symbolizers);
        } else {
            console.error("Unsupported symbol type:", symbolizers);
            return createEmptySVG();
        }
    } catch (error) {
        console.error("Error creating SVG symbol:", error);
        return createEmptySVG();
    }
}

function createEmptySVG(): SVGSVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", SYMBOL_CONSTANTS.SVG_WIDTH.toString());
    svg.setAttribute("height", SYMBOL_CONSTANTS.SVG_HEIGHT.toString());
    svg.setAttribute("viewBox", `0 0 ${SYMBOL_CONSTANTS.SVG_WIDTH} ${SYMBOL_CONSTANTS.SVG_HEIGHT}`);
    return svg;
}

// Create a single SVG that approximates the composite
export function createApproximateCompositeSymbol(symbolizers: Symbolizer[]): SVGSVGElement {
    const lineSymbolizers = symbolizers.filter(symbolizer => 'Line' in symbolizer);

    if (lineSymbolizers.length <= 1) {
        return createSingleLineSymbolSVG(lineSymbolizers[0]?.Line as StrokeSymbolizer);
    }

    // Strategy: Use the widest line as base, with color from the top line
    const widestSymbolizer = lineSymbolizers.reduce((prev, current) => {
        const prevWidth = parseFloat((prev.Line as StrokeSymbolizer)["stroke-width"] || "1");
        const currentWidth = parseFloat((current.Line as StrokeSymbolizer)["stroke-width"] || "1");
        return currentWidth > prevWidth ? current : prev;
    });

    const topSymbolizer = lineSymbolizers[lineSymbolizers.length - 1];
    const topLine = topSymbolizer.Line as StrokeSymbolizer;
    const widestLine = widestSymbolizer.Line as StrokeSymbolizer;

    const svg = createEmptySVG();

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", SYMBOL_CONSTANTS.LINE_START_X.toString());
    line.setAttribute("y1", SYMBOL_CONSTANTS.LINE_Y_CENTER.toString());
    line.setAttribute("x2", SYMBOL_CONSTANTS.LINE_END_X.toString());
    line.setAttribute("y2", SYMBOL_CONSTANTS.LINE_Y_CENTER.toString());
    line.setAttribute("stroke", topLine.stroke || "#000000");
    line.setAttribute("stroke-width", widestLine["stroke-width"] || "1");
    line.setAttribute("stroke-linecap", topLine["stroke-linecap"] || "round");
    line.setAttribute("stroke-linejoin", topLine["stroke-linejoin"] || "round");

    if (topLine["stroke-opacity"]) {
        line.setAttribute("stroke-opacity", topLine["stroke-opacity"]);
    }

    svg.appendChild(line);
    return svg;
}

// Helper function to create a single line symbol SVG
function createSingleLineSymbolSVG(lineSymbolizer: StrokeSymbolizer): SVGSVGElement {
    const svg = createEmptySVG();
    const line = createSVGLineElement(lineSymbolizer);
    svg.appendChild(line);
    return svg;
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

export function createPolygonSymbol(symbolizers: Symbolizer[]): SVGSVGElement {
    let fillColorWithOpacity = "transparent";
    let strokeColorWithOpacity = "#000000";
    let strokeWidth = 1;
    let strokeJoin: LineJoin = "round";
    let strokeCap: LineCap = "round";
    let strokeDasharray = "";
    let hasGraphicFill = false;
    let graphicFillPattern: SVGElement | null = null;

    const PolygonSymbolizer = symbolizers.find(symbolizer => 'Polygon' in symbolizer)?.Polygon as StrokeSymbolizer;

    if (!PolygonSymbolizer) {
        throw new Error("No valid Polygon symbolizer found in the provided symbolizers.");
    }

    symbolizers.forEach(symbolizer => {
        if (isSymbolizerWithPolygon(symbolizer)) {
            // Check for GraphicFill
            const polygonData = symbolizer.Polygon as any;
            const graphicFill = polygonData.GraphicFill || polygonData['graphic-fill'];
            
            if (graphicFill) {
                hasGraphicFill = true;
                graphicFillPattern = createGraphicFillPatternElement(graphicFill);
            } else if ('fill' in symbolizer.Polygon) {
                fillColorWithOpacity = handleFillSymbolizer(symbolizer.Polygon);
            }

            if ('stroke' in symbolizer.Polygon) {
                const strokeSymbolizer = handleStrokeSymbolizer(symbolizer.Polygon);
                strokeColorWithOpacity = strokeSymbolizer.strokeColorWithOpacity;
                strokeWidth = strokeSymbolizer.strokeWidth;
                strokeJoin = strokeSymbolizer.strokeJoin;
                strokeCap = strokeSymbolizer.strokeCap;

                // Handle dash array
                const strokeData = symbolizer.Polygon as StrokeSymbolizer;
                if (strokeData["stroke-dasharray"]) {
                    strokeDasharray = strokeData["stroke-dasharray"].join(" ");
                }
            }
        }
    });

    const svg = createEmptySVG();

    // Create pattern definition if we have GraphicFill
    if (hasGraphicFill && graphicFillPattern) {
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
        
        const patternId = generateUniquePatternId();
        pattern.setAttribute("id", patternId);
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        pattern.setAttribute("width", SYMBOL_CONSTANTS.PATTERN_TILE_SIZE.toString());
        pattern.setAttribute("height", SYMBOL_CONSTANTS.PATTERN_TILE_SIZE.toString());
        pattern.appendChild(graphicFillPattern);
        defs.appendChild(pattern);
        svg.appendChild(defs);
        fillColorWithOpacity = `url(#${patternId})`;
    }

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", SYMBOL_CONSTANTS.LINE_START_X.toString());
    rect.setAttribute("y", "3");
    rect.setAttribute("width", "28");
    rect.setAttribute("height", "14");
    rect.setAttribute("fill", fillColorWithOpacity);
    rect.setAttribute("stroke", strokeColorWithOpacity);
    rect.setAttribute("stroke-width", strokeWidth.toString());
    rect.setAttribute("stroke-linecap", strokeCap);
    rect.setAttribute("stroke-linejoin", strokeJoin);

    if (strokeDasharray) {
        rect.setAttribute("stroke-dasharray", strokeDasharray);
    }

    svg.appendChild(rect);
    return svg;
}

function createPointSymbol(symbolizers: Symbolizer[]): SVGSVGElement {
    const pointSymbolizer = symbolizers.find(symbolizer => 'Point' in symbolizer)?.Point;

    if (!pointSymbolizer) {
        throw new Error("No valid Point symbolizer found in the provided symbolizers.");
    }

    const { size, opacity, rotation, graphics } = pointSymbolizer;
    const graphic = graphics && graphics.length > 0 ? graphics[0] : null;

    if (!graphic) {
        throw new Error("No valid graphic found in the Point symbolizer.");
    }

    const rawParsedSize = parseSize(size);
    const parsedOpacity = parseFloat(opacity) || 1.0;
    const parsedRotation = parseFloat(rotation) || 0.0;

    // Smart sizing for legend display
    const parsedSize = calculateLegendPointSize(rawParsedSize);

    const svg = createEmptySVG();
    const centerX = SYMBOL_CONSTANTS.SVG_WIDTH / 2;
    const centerY = SYMBOL_CONSTANTS.SVG_HEIGHT / 2;
    const pixelSize = rawParsedSize * SYMBOL_CONSTANTS.POINT_TO_PIXEL_RATIO;
    const radius = pixelSize / 2;

    // Check for external graphic first
    if (graphic["external-graphic-url"] && graphic["external-graphic-type"]) {
        const imageUrl = graphic["external-graphic-url"];
        const imageSize = rawParsedSize * SYMBOL_CONSTANTS.IMAGE_SCALING_RATIO;

        const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttribute("href", imageUrl);
        image.setAttribute("x", (centerX - imageSize / 2).toString());
        image.setAttribute("y", (centerY - imageSize / 2).toString());
        image.setAttribute("width", imageSize.toString());
        image.setAttribute("height", imageSize.toString());

        if (parsedOpacity !== 1.0) {
            image.setAttribute("opacity", parsedOpacity.toString());
        }

        if (parsedRotation !== 0) {
            image.setAttribute("transform", `rotate(${parsedRotation} ${centerX} ${centerY})`);
        }

        svg.appendChild(image);
        return svg;
    }

    const { fill, stroke, mark } = graphic;
    const fillOpacity = graphic["fill-opacity"];
    const strokeWidth = graphic["stroke-width"];

    const element = createMarkElement(mark, centerX, centerY, radius, parsedSize, stroke, strokeWidth);

    // Apply common styling (for shapes that support fill/stroke)
    if (mark?.toLowerCase() !== "cross" && mark?.toLowerCase() !== "x") {
        const finalFill = fill || "#000000";
        const finalFillOpacity = (parsedOpacity * parseFloat(fillOpacity || "1"));
        const finalStroke = stroke || "#000000";
        const finalStrokeWidth = strokeWidth || "1";

        element.setAttribute("fill", finalFill);
        element.setAttribute("fill-opacity", finalFillOpacity.toString());
        element.setAttribute("stroke", finalStroke);
        element.setAttribute("stroke-width", finalStrokeWidth);
    }

    if (parsedRotation !== 0) {
        element.setAttribute("transform", `rotate(${parsedRotation} ${centerX} ${centerY})`);
    }

    svg.appendChild(element);
    return svg;
}

function createMarkElement(
    mark: string | undefined,
    centerX: number,
    centerY: number,
    radius: number,
    parsedSize: number,
    stroke: string | undefined,
    strokeWidth: string | undefined
): SVGElement {
    switch (mark?.toLowerCase()) {
        case "circle":
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", centerX.toString());
            circle.setAttribute("cy", centerY.toString());
            circle.setAttribute("r", radius.toString());
            return circle;

        case "square":
            const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            rect.setAttribute("x", (centerX - radius).toString());
            rect.setAttribute("y", (centerY - radius).toString());
            rect.setAttribute("width", parsedSize.toString());
            rect.setAttribute("height", parsedSize.toString());
            return rect;

        case "triangle":
            const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const height = parsedSize * Math.sqrt(3) / 2;
            const trianglePoints = [
                [centerX, centerY - height / 2],
                [centerX - radius, centerY + height / 2],
                [centerX + radius, centerY + height / 2]
            ].map(point => point.join(',')).join(' ');
            triangle.setAttribute("points", trianglePoints);
            return triangle;

        case "diamond":
            const diamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const diamondPoints = [
                [centerX, centerY - radius],
                [centerX + radius, centerY],
                [centerX, centerY + radius],
                [centerX - radius, centerY]
            ].map(point => point.join(',')).join(' ');
            diamond.setAttribute("points", diamondPoints);
            return diamond;

        case "cross":
            return createCrossElement(centerX, centerY, radius, stroke, strokeWidth);

        case "x":
            return createXElement(centerX, centerY, radius, stroke, strokeWidth);

        default:
            // Default to circle for unknown marks
            const defaultCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            defaultCircle.setAttribute("cx", centerX.toString());
            defaultCircle.setAttribute("cy", centerY.toString());
            defaultCircle.setAttribute("r", radius.toString());
            return defaultCircle;
    }
}

function createCrossElement(
    centerX: number,
    centerY: number,
    radius: number,
    stroke: string | undefined,
    strokeWidth: string | undefined
): SVGElement {
    const element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    const crossLine1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    crossLine1.setAttribute("x1", (centerX - radius).toString());
    crossLine1.setAttribute("y1", centerY.toString());
    crossLine1.setAttribute("x2", (centerX + radius).toString());
    crossLine1.setAttribute("y2", centerY.toString());
    crossLine1.setAttribute("stroke", stroke || "#000000");
    crossLine1.setAttribute("stroke-width", strokeWidth || "1");

    const crossLine2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    crossLine2.setAttribute("x1", centerX.toString());
    crossLine2.setAttribute("y1", (centerY - radius).toString());
    crossLine2.setAttribute("x2", centerX.toString());
    crossLine2.setAttribute("y2", (centerY + radius).toString());
    crossLine2.setAttribute("stroke", stroke || "#000000");
    crossLine2.setAttribute("stroke-width", strokeWidth || "1");

    element.appendChild(crossLine1);
    element.appendChild(crossLine2);
    return element;
}

function createXElement(
    centerX: number,
    centerY: number,
    radius: number,
    stroke: string | undefined,
    strokeWidth: string | undefined
): SVGElement {
    const element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    
    const xLine1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xLine1.setAttribute("x1", (centerX - radius).toString());
    xLine1.setAttribute("y1", (centerY - radius).toString());
    xLine1.setAttribute("x2", (centerX + radius).toString());
    xLine1.setAttribute("y2", (centerY + radius).toString());
    xLine1.setAttribute("stroke", stroke || "#000000");
    xLine1.setAttribute("stroke-width", strokeWidth || "1");

    const xLine2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
    xLine2.setAttribute("x1", (centerX + radius).toString());
    xLine2.setAttribute("y1", (centerY - radius).toString());
    xLine2.setAttribute("x2", (centerX - radius).toString());
    xLine2.setAttribute("y2", (centerY + radius).toString());
    xLine2.setAttribute("stroke", stroke || "#000000");
    xLine2.setAttribute("stroke-width", strokeWidth || "1");

    element.appendChild(xLine1);
    element.appendChild(xLine2);
    return element;
}

function calculateLegendPointSize(rawSize: number): number {
    if (rawSize <= 5) {
        return Math.max(6, rawSize * 1.5);
    } else if (rawSize <= 20) {
        return Math.min(16, rawSize * 0.8);
    } else {
        return Math.min(18, 8 + (rawSize - 20) * 0.3);
    }
}

// Utility function to parse size from string or number
function parseSize(size: string | number): number {
    if (typeof size === 'number') {
        return size;
    }

    if (typeof size === 'string') {
        const simpleNumeric = parseFloat(size);
        if (!isNaN(simpleNumeric)) {
            return simpleNumeric > SYMBOL_CONSTANTS.MAX_POINT_SIZE ? SYMBOL_CONSTANTS.MAX_POINT_SIZE : simpleNumeric;
        }

        if (size.includes('Interpolate')) {
            return 12;
        }

        const numbers = size.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
            return parseFloat(numbers[numbers.length - 1]);
        }
    }

    return SYMBOL_CONSTANTS.DEFAULT_POINT_SIZE;
}

// Utility function for adding opacity to a hex color
function addOpacityToHex(hex: string, opacity: number): string {
    if (!hex) {
        return "#000000FF";
    }
    
    const validOpacity = Math.max(0, Math.min(1, opacity));
    const alpha = Math.round(validOpacity * 255).toString(16).padStart(2, '0').toUpperCase();

    if (hex.length === 9) {
        return `${hex.substring(0, 7)}${alpha}`;
    }
    
    return `${hex}${alpha}`;
}

function generateUniquePatternId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    return `graphicFillPattern_${timestamp}_${randomStr}`;
}

// Enhanced function to create the graphic fill pattern with support for multiple mark types
function createGraphicFillPatternElement(graphicFill: GraphicFillData): SVGElement | null {
    try {
        if (!graphicFill.graphics || graphicFill.graphics.length === 0) {
            console.warn("No graphics found in GraphicFill data");
            return null;
        }

        const graphic = graphicFill.graphics[0];
        if (!graphic.mark) {
            console.warn("No mark specified in graphic data");
            return null;
        }

        const strokeColor = graphic.stroke || graphic.fill || "#000000";
        const strokeWidth = graphic["stroke-width"] || "1";
        const fillColor = graphic.fill || "none";

        return createPatternMarkElement(graphic.mark, strokeColor, strokeWidth, fillColor);
    } catch (error) {
        console.error("Error creating graphic fill pattern:", error);
        return null;
    }
}

function createPatternMarkElement(
    mark: string,
    strokeColor: string,
    strokeWidth: string,
    fillColor: string
): SVGElement | null {
    const tileSize = SYMBOL_CONSTANTS.PATTERN_TILE_SIZE;
    
    switch (mark.toLowerCase()) {
        case 'shape://slash':
        case 'slash':
            const slashLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            slashLine.setAttribute("x1", "0");
            slashLine.setAttribute("y1", tileSize.toString());
            slashLine.setAttribute("x2", tileSize.toString());
            slashLine.setAttribute("y2", "0");
            slashLine.setAttribute("stroke", strokeColor);
            slashLine.setAttribute("stroke-width", strokeWidth);
            return slashLine;

        case 'shape://backslash':
        case 'backslash':
            const backslashLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            backslashLine.setAttribute("x1", "0");
            backslashLine.setAttribute("y1", "0");
            backslashLine.setAttribute("x2", tileSize.toString());
            backslashLine.setAttribute("y2", tileSize.toString());
            backslashLine.setAttribute("stroke", strokeColor);
            backslashLine.setAttribute("stroke-width", strokeWidth);
            return backslashLine;

        case 'shape://plus':
        case 'plus':
            const plusGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const centerX = tileSize / 2;
            const centerY = tileSize / 2;
            
            const hLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            hLine.setAttribute("x1", "0");
            hLine.setAttribute("y1", centerY.toString());
            hLine.setAttribute("x2", tileSize.toString());
            hLine.setAttribute("y2", centerY.toString());
            hLine.setAttribute("stroke", strokeColor);
            hLine.setAttribute("stroke-width", strokeWidth);
            
            const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            vLine.setAttribute("x1", centerX.toString());
            vLine.setAttribute("y1", "0");
            vLine.setAttribute("x2", centerX.toString());
            vLine.setAttribute("y2", tileSize.toString());
            vLine.setAttribute("stroke", strokeColor);
            vLine.setAttribute("stroke-width", strokeWidth);
            
            plusGroup.appendChild(hLine);
            plusGroup.appendChild(vLine);
            return plusGroup;

        case 'shape://times':
        case 'times':
        case 'x':
            const timesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            
            const diag1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            diag1.setAttribute("x1", "0");
            diag1.setAttribute("y1", "0");
            diag1.setAttribute("x2", tileSize.toString());
            diag1.setAttribute("y2", tileSize.toString());
            diag1.setAttribute("stroke", strokeColor);
            diag1.setAttribute("stroke-width", strokeWidth);
            
            const diag2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            diag2.setAttribute("x1", "0");
            diag2.setAttribute("y1", tileSize.toString());
            diag2.setAttribute("x2", tileSize.toString());
            diag2.setAttribute("y2", "0");
            diag2.setAttribute("stroke", strokeColor);
            diag2.setAttribute("stroke-width", strokeWidth);
            
            timesGroup.appendChild(diag1);
            timesGroup.appendChild(diag2);
            return timesGroup;

        case 'shape://dot':
        case 'dot':
            const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            dot.setAttribute("cx", (tileSize / 2).toString());
            dot.setAttribute("cy", (tileSize / 2).toString());
            dot.setAttribute("r", "1");
            dot.setAttribute("fill", fillColor !== "none" ? fillColor : strokeColor);
            return dot;

        case 'shape://circle':
        case 'circle':
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", (tileSize / 2).toString());
            circle.setAttribute("cy", (tileSize / 2).toString());
            circle.setAttribute("r", "2");
            circle.setAttribute("fill", fillColor);
            circle.setAttribute("stroke", strokeColor);
            circle.setAttribute("stroke-width", strokeWidth);
            return circle;

        case 'shape://square':
        case 'square':
            const square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            const squareSize = 4;
            square.setAttribute("x", ((tileSize - squareSize) / 2).toString());
            square.setAttribute("y", ((tileSize - squareSize) / 2).toString());
            square.setAttribute("width", squareSize.toString());
            square.setAttribute("height", squareSize.toString());
            square.setAttribute("fill", fillColor);
            square.setAttribute("stroke", strokeColor);
            square.setAttribute("stroke-width", strokeWidth);
            return square;

        case 'shape://triangle':
        case 'triangle':
            const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const triCenterX = tileSize / 2;
            const triCenterY = tileSize / 2;
            const size = 3;
            const trianglePoints = [
                [triCenterX, triCenterY - size],
                [triCenterX - size, triCenterY + size],
                [triCenterX + size, triCenterY + size]
            ].map(point => point.join(',')).join(' ');
            triangle.setAttribute("points", trianglePoints);
            triangle.setAttribute("fill", fillColor);
            triangle.setAttribute("stroke", strokeColor);
            triangle.setAttribute("stroke-width", strokeWidth);
            return triangle;

        case 'shape://vertline':
        case 'vertline':
        case 'vertical':
            const vertLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            vertLine.setAttribute("x1", (tileSize / 2).toString());
            vertLine.setAttribute("y1", "0");
            vertLine.setAttribute("x2", (tileSize / 2).toString());
            vertLine.setAttribute("y2", tileSize.toString());
            vertLine.setAttribute("stroke", strokeColor);
            vertLine.setAttribute("stroke-width", strokeWidth);
            return vertLine;

        case 'shape://horline':
        case 'horline':
        case 'horizontal':
            const horLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            horLine.setAttribute("x1", "0");
            horLine.setAttribute("y1", (tileSize / 2).toString());
            horLine.setAttribute("x2", tileSize.toString());
            horLine.setAttribute("y2", (tileSize / 2).toString());
            horLine.setAttribute("stroke", strokeColor);
            horLine.setAttribute("stroke-width", strokeWidth);
            return horLine;

        default:
            console.warn(`Unsupported graphic fill mark type: ${mark}`);
            return null;
    }
}

// Enhanced function to create graphic stroke elements with support for multiple mark types
function createGraphicStrokeElements(graphicStroke: GraphicStrokeData): SVGElement[] {
    const elements: SVGElement[] = [];
    
    try {
        if (!graphicStroke.graphics || graphicStroke.graphics.length === 0) {
            console.warn("No graphics found in GraphicStroke data");
            return elements;
        }

        const graphic = graphicStroke.graphics[0];
        const originalSize = parseFloat(graphicStroke.size || "6");
        
        if (!graphic.mark) {
            console.warn("No mark specified in graphic data");
            return elements;
        }

        // For legend display, we want multiple symbols spanning the full line width
        const symbolCount = SYMBOL_CONSTANTS.TRIANGLE_COUNT;
        const lineStart = SYMBOL_CONSTANTS.LINE_START_X;
        const lineEnd = SYMBOL_CONSTANTS.LINE_END_X;
        const lineWidth = lineEnd - lineStart;
        
        // Each symbol gets equal width across the full line
        const symbolSpacing = lineWidth / symbolCount;
        const symbolSize = Math.min(SYMBOL_CONSTANTS.TRIANGLE_HEIGHT, originalSize);
        
        for (let i = 0; i < symbolCount; i++) {
            // Calculate the center X position for this symbol
            const symbolLeft = lineStart + (i * symbolSpacing);
            const symbolRight = lineStart + ((i + 1) * symbolSpacing);
            const symbolCenter = (symbolLeft + symbolRight) / 2;
            
            const element = createStrokeSymbolElement(
                graphic.mark,
                symbolCenter,
                SYMBOL_CONSTANTS.LINE_Y_CENTER,
                symbolSize,
                symbolSpacing,
                graphic.fill || "#000000",
                graphic.stroke || "#000000",
                graphic["stroke-width"] || "0.5"
            );
            
            if (element) {
                elements.push(element);
            }
        }
    } catch (error) {
        console.error("Error creating graphic stroke elements:", error);
    }
    
    return elements;
}

function createStrokeSymbolElement(
    mark: string,
    centerX: number,
    centerY: number,
    size: number,
    spacing: number,
    fill: string,
    stroke: string,
    strokeWidth: string
): SVGElement | null {
    switch (mark.toLowerCase()) {
        case 'triangle':
        case 'shape://triangle':
            const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            
            // Position triangles so their base touches the top edge of the line
            const lineTopEdge = centerY - 1; // Assuming 2px line width
            const halfSpacing = spacing / 2;
            
            const points = [
                [centerX, lineTopEdge - size],                    // Top point (above the line)
                [centerX - halfSpacing, lineTopEdge],             // Bottom left
                [centerX + halfSpacing, lineTopEdge]              // Bottom right
            ].map(point => point.join(',')).join(' ');
            
            triangle.setAttribute("points", points);
            triangle.setAttribute("fill", fill);
            triangle.setAttribute("stroke", stroke);
            triangle.setAttribute("stroke-width", strokeWidth);
            return triangle;

        case 'circle':
        case 'shape://circle':
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", centerX.toString());
            circle.setAttribute("cy", (centerY - size / 2).toString());
            circle.setAttribute("r", (size / 3).toString());
            circle.setAttribute("fill", fill);
            circle.setAttribute("stroke", stroke);
            circle.setAttribute("stroke-width", strokeWidth);
            return circle;

        case 'square':
        case 'shape://square':
            const square = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            const squareSize = size / 2;
            square.setAttribute("x", (centerX - squareSize / 2).toString());
            square.setAttribute("y", (centerY - size).toString());
            square.setAttribute("width", squareSize.toString());
            square.setAttribute("height", squareSize.toString());
            square.setAttribute("fill", fill);
            square.setAttribute("stroke", stroke);
            square.setAttribute("stroke-width", strokeWidth);
            return square;

        case 'diamond':
        case 'shape://diamond':
            const diamond = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const halfSize = size / 2;
            const diamondPoints = [
                [centerX, centerY - size],              // Top
                [centerX + halfSize, centerY - halfSize], // Right
                [centerX, centerY],                      // Bottom
                [centerX - halfSize, centerY - halfSize]  // Left
            ].map(point => point.join(',')).join(' ');
            diamond.setAttribute("points", diamondPoints);
            diamond.setAttribute("fill", fill);
            diamond.setAttribute("stroke", stroke);
            diamond.setAttribute("stroke-width", strokeWidth);
            return diamond;

        case 'cross':
        case 'shape://cross':
        case 'plus':
        case 'shape://plus':
            const crossGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const crossSize = size / 2;
            
            const hLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            hLine.setAttribute("x1", (centerX - crossSize).toString());
            hLine.setAttribute("y1", (centerY - crossSize).toString());
            hLine.setAttribute("x2", (centerX + crossSize).toString());
            hLine.setAttribute("y2", (centerY - crossSize).toString());
            hLine.setAttribute("stroke", stroke);
            hLine.setAttribute("stroke-width", strokeWidth);
            
            const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
            vLine.setAttribute("x1", centerX.toString());
            vLine.setAttribute("y1", (centerY - size).toString());
            vLine.setAttribute("x2", centerX.toString());
            vLine.setAttribute("y2", centerY.toString());
            vLine.setAttribute("stroke", stroke);
            vLine.setAttribute("stroke-width", strokeWidth);
            
            crossGroup.appendChild(hLine);
            crossGroup.appendChild(vLine);
            return crossGroup;

        case 'x':
        case 'shape://times':
        case 'times':
            const xGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const xSize = size / 2;
            
            const diag1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            diag1.setAttribute("x1", (centerX - xSize).toString());
            diag1.setAttribute("y1", (centerY - size).toString());
            diag1.setAttribute("x2", (centerX + xSize).toString());
            diag1.setAttribute("y2", centerY.toString());
            diag1.setAttribute("stroke", stroke);
            diag1.setAttribute("stroke-width", strokeWidth);
            
            const diag2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
            diag2.setAttribute("x1", (centerX + xSize).toString());
            diag2.setAttribute("y1", (centerY - size).toString());
            diag2.setAttribute("x2", (centerX - xSize).toString());
            diag2.setAttribute("y2", centerY.toString());
            diag2.setAttribute("stroke", stroke);
            diag2.setAttribute("stroke-width", strokeWidth);
            
            xGroup.appendChild(diag1);
            xGroup.appendChild(diag2);
            return xGroup;

        case 'arrow':
        case 'shape://arrow':
            const arrow = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const arrowSize = size / 2;
            const arrowPoints = [
                [centerX, centerY - size],               // Tip
                [centerX - arrowSize, centerY - arrowSize], // Left wing
                [centerX - arrowSize / 2, centerY - arrowSize], // Left notch
                [centerX - arrowSize / 2, centerY],      // Left bottom
                [centerX + arrowSize / 2, centerY],      // Right bottom
                [centerX + arrowSize / 2, centerY - arrowSize], // Right notch
                [centerX + arrowSize, centerY - arrowSize]  // Right wing
            ].map(point => point.join(',')).join(' ');
            arrow.setAttribute("points", arrowPoints);
            arrow.setAttribute("fill", fill);
            arrow.setAttribute("stroke", stroke);
            arrow.setAttribute("stroke-width", strokeWidth);
            return arrow;

        default:
            console.warn(`Unsupported graphic stroke mark type: ${mark}`);
            return null;
    }
}