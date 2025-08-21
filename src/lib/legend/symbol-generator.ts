import { FillSymbolizer, LineCap, LineJoin, StrokeSymbolizer, Symbolizer } from "@/lib/types/geoserver-types";

export interface CompositeSymbolResult {
    symbol?: SVGSVGElement; // Changed from __esri.Symbol to SVGSVGElement
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

    // Always create SVG representation for consistency, even for single LineSymbolizers
    const compositeHtml = createCompositeLineHTML(lineSymbolizers);

    return {
        html: compositeHtml,
        symbol: compositeHtml, // Same as html since it's SVG
        isComposite: lineSymbolizers.length > 1,
        symbolizers: lineSymbolizers
    };
}

function createCompositeLineHTML(lineSymbolizers: Symbolizer[]): SVGSVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 32 20");
    svg.style.display = "block";
    svg.style.width = "32px";
    svg.style.height = "20px";
    svg.style.maxWidth = "32px";
    svg.style.maxHeight = "20px";
    svg.style.minWidth = "32px";
    svg.style.minHeight = "20px";

    // Process symbolizers in order (first = bottom layer, last = top layer)
    lineSymbolizers.forEach((symbolizer, index) => {
        console.log(`🔍 Processing line symbolizer ${index}:`, symbolizer);
        const lineData = symbolizer.Line as StrokeSymbolizer;
        console.log("📋 Line data with dash array:", lineData);
        console.log("📋 Stroke-dasharray:", lineData["stroke-dasharray"]);
        
        // Check if this symbolizer has GraphicStroke
        const lineDataAny = lineData as any;
        const graphicStroke = lineDataAny.GraphicStroke || lineDataAny['graphic-stroke'];
        
        if (graphicStroke) {
            console.log("✨ This is a GraphicStroke symbolizer - only adding triangles, no base line");
            // For GraphicStroke symbolizers, ONLY add the graphic symbols, not another line
            const strokeElements = createGraphicStrokeElements(graphicStroke);
            strokeElements.forEach(element => svg.appendChild(element));
        } else {
            console.log("📏 This is a regular line symbolizer - creating base line");
            // For regular line symbolizers, create the base line (which may have dash patterns)
            const line = createSVGLineElement(lineData);
            console.log("📏 Created line element:", line.outerHTML);
            svg.appendChild(line);
        }
    });

    console.log("🎯 Final composite line SVG:", svg.outerHTML);
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

    // Position line in center of SVG (adjusted for 32px width)
    line.setAttribute("x1", "2");
    line.setAttribute("y1", "10");
    line.setAttribute("x2", "30");
    line.setAttribute("y2", "10");

    // Make lines a bit thicker for better visibility
    const originalWidth = parseFloat(strokeWidth);
    const enhancedWidth = Math.max(2, originalWidth + 1);

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
    if (symbolizers.every(symbolizer => symbolizer.Line)) {
        const result = createCompositeLineSymbol(symbolizers);
        // Return the full CompositeSymbolResult instead of just html or symbol
        return result;
    } else if (symbolizers.every(symbolizer => symbolizer.Polygon)) {
        return createPolygonSymbol(symbolizers);
    } else if (symbolizers.every(symbolizer => symbolizer.Point)) {
        return createPointSymbol(symbolizers);
    } else {
        console.error("Unsupported symbol type:", symbolizers);
        // Return empty SVG
        return document.createElementNS("http://www.w3.org/2000/svg", "svg");
    }
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

    // Create SVG with combined properties
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 32 20");

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", "2");
    line.setAttribute("y1", "10");
    line.setAttribute("x2", "30");
    line.setAttribute("y2", "10");
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
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 32 20");

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
            // Check for GraphicFill (your server's structure)
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

    // Create SVG polygon
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 32 20");

    // Create pattern definition if we have GraphicFill
    if (hasGraphicFill && graphicFillPattern) {
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const pattern = document.createElementNS("http://www.w3.org/2000/svg", "pattern");
        
        // Create a unique ID based on the pattern properties
        const patternId = `graphicFillPattern_${Math.random().toString(36).substr(2, 9)}`;
        pattern.setAttribute("id", patternId);
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        pattern.setAttribute("width", "8");
        pattern.setAttribute("height", "8");
        pattern.appendChild(graphicFillPattern);
        defs.appendChild(pattern);
        svg.appendChild(defs);
        fillColorWithOpacity = `url(#${patternId})`;
        
        console.log("🎨 Created pattern with ID:", patternId, "and fill:", fillColorWithOpacity);
    }

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", "2");
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

    console.log(`Creating point symbol with symbolizers:`, symbolizers);

    // Find the first symbolizer that has a 'Point' property
    const pointSymbolizer = symbolizers.find(symbolizer => 'Point' in symbolizer)?.Point;

    // Ensure a valid Point symbolizer exists
    if (!pointSymbolizer) {
        throw new Error("No valid Point symbolizer found in the provided symbolizers.");
    }

    // Destructure properties from the Point symbolizer
    const { size, opacity, rotation, graphics } = pointSymbolizer;

    // Ensure there is at least one graphic in the 'graphics' array
    const graphic = graphics && graphics.length > 0 ? graphics[0] : null;

    if (!graphic) {
        throw new Error("No valid graphic found in the Point symbolizer.");
    }

    // Parse the size, opacity, and rotation with default values
    const rawParsedSize = parseSize(size);
    const parsedOpacity = parseFloat(opacity) || 1.0;
    const parsedRotation = parseFloat(rotation) || 0.0;

    // Smart sizing for legend display
    let parsedSize: number;
    if (rawParsedSize <= 5) {
        // Small points - make them bigger for visibility
        parsedSize = Math.max(6, rawParsedSize * 1.5);
    } else if (rawParsedSize <= 20) {
        // Medium points - keep them reasonable
        parsedSize = Math.min(16, rawParsedSize * 0.8);
    } else {
        // Large points - scale them down significantly
        parsedSize = Math.min(18, 8 + (rawParsedSize - 20) * 0.3);
    }

    // Create SVG
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 32 20");

    const centerX = 16; // Center of 32px width
    const centerY = 10; // Center of 20px height
    const pointToPixelRatio = 4 / 3; // 1pt = 1.33px approximately
    const imageRatio = 5 / 4; // 1.25 for image scaling
    const pixelSize = rawParsedSize * pointToPixelRatio;
    const radius = pixelSize / 2;

    // Check for external graphic first (but only if it's a proper external graphic)
    if (graphic["external-graphic-url"] && graphic["external-graphic-type"]) {

        const imageUrl = graphic["external-graphic-url"];
        const imageSize = rawParsedSize * imageRatio; // Convert size to pixels

        // Create image element
        const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
        image.setAttribute("href", imageUrl);
        image.setAttribute("x", (centerX - imageSize / 2).toString());
        image.setAttribute("y", (centerY - imageSize / 2).toString());
        image.setAttribute("width", imageSize.toString());
        image.setAttribute("height", imageSize.toString());

        // Apply opacity if specified
        if (parsedOpacity !== 1.0) {
            image.setAttribute("opacity", parsedOpacity.toString());
        }

        // Apply rotation if specified
        if (parsedRotation !== 0) {
            image.setAttribute("transform", `rotate(${parsedRotation} ${centerX} ${centerY})`);
        }

        svg.appendChild(image);

        return svg;
    }

    // SKIP URL FALLBACK - go directly to basic shape rendering for marks

    const { fill, stroke, mark } = graphic;
    const fillOpacity = graphic["fill-opacity"];
    const strokeWidth = graphic["stroke-width"];



    let element: SVGElement;

    // Create the appropriate shape based on mark
    switch (mark?.toLowerCase()) {
        case "circle":
            element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            element.setAttribute("cx", centerX.toString());
            element.setAttribute("cy", centerY.toString());
            element.setAttribute("r", radius.toString());
            break;
        case "square":
            element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
            element.setAttribute("x", (centerX - radius).toString());
            element.setAttribute("y", (centerY - radius).toString());
            element.setAttribute("width", parsedSize.toString());
            element.setAttribute("height", parsedSize.toString());
            break;
        case "triangle":
            element = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const height = parsedSize * Math.sqrt(3) / 2;
            const points = [
                [centerX, centerY - height / 2],
                [centerX - radius, centerY + height / 2],
                [centerX + radius, centerY + height / 2]
            ].map(point => point.join(',')).join(' ');
            element.setAttribute("points", points);
            break;

        case "diamond":
            element = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
            const diamondPoints = [
                [centerX, centerY - radius],
                [centerX + radius, centerY],
                [centerX, centerY + radius],
                [centerX - radius, centerY]
            ].map(point => point.join(',')).join(' ');
            element.setAttribute("points", diamondPoints);

            break;

        case "cross":

            element = document.createElementNS("http://www.w3.org/2000/svg", "g");
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
            break;

        case "x":
            element = document.createElementNS("http://www.w3.org/2000/svg", "g");
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
            break;

        default:
            // Default to circle for unknown marks
            element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            element.setAttribute("cx", centerX.toString());
            element.setAttribute("cy", centerY.toString());
            element.setAttribute("r", radius.toString());
            break;
    }

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

    // Apply rotation if specified
    if (parsedRotation !== 0) {
        element.setAttribute("transform", `rotate(${parsedRotation} ${centerX} ${centerY})`);

    }

    svg.appendChild(element);


    return svg;
}

// Utility function to parse size from string or number
function parseSize(size: string | number): number {
    // Handle number values directly but with a maximum limit
    if (typeof size === 'number') {
        return size;
    }

    // Handle string values
    if (typeof size === 'string') {
        // Check if it's a simple numeric string first (for legend-only rules)
        const simpleNumeric = parseFloat(size);
        if (!isNaN(simpleNumeric)) {
            return simpleNumeric > 17 ? 17 : simpleNumeric; // Cap at 17 to avoid overflowing the parent container
        }

        // Handle interpolation expressions (for category rules)
        if (size.includes('Interpolate')) {
            return 12; // Default to 12 for Interpolate expressions
        }

        // Final fallback: extract any numeric values
        const numbers = size.match(/\d+\.?\d*/g);
        if (numbers && numbers.length > 0) {
            const fallbackSize = parseFloat(numbers[numbers.length - 1]);
            return fallbackSize;
        }
    }

    // If all parsing fails, return default
    return 16;
}

// Utility function for adding opacity to a hex color
function addOpacityToHex(hex: string, opacity: number): string {
    // Handle case when hex is undefined
    if (!hex) {
        return "#000000FF"; // Default to black with full opacity
    }
    // Ensure opacity is between 0 and 1
    const validOpacity = Math.max(0, Math.min(1, opacity));
    const alpha = Math.round(validOpacity * 255).toString(16).padStart(2, '0').toUpperCase();

    // If hex already has an alpha channel (8 characters), replace it
    if (hex.length === 9) {
        return `${hex.substring(0, 7)}${alpha}`;
    }
    // Otherwise, append the alpha channel
    return `${hex}${alpha}`;
}

// Add this helper function to create the graphic fill pattern
function createGraphicFillPatternElement(graphicFill: any): SVGElement | null {
    console.log("🎨 Creating graphic fill pattern from:", graphicFill);
    
    // Handle your server's structure
    if (graphicFill.graphics && graphicFill.graphics.length > 0) {
        const graphic = graphicFill.graphics[0];
        console.log("🎭 Graphic data:", graphic);
        
        if (graphic.mark === 'shape://slash') {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", "0");
            line.setAttribute("y1", "8");
            line.setAttribute("x2", "8");
            line.setAttribute("y2", "0");
            
            // Get stroke color - try multiple property paths
            const strokeColor = graphic.stroke || graphic["stroke"] || "#000000";
            const strokeWidth = graphic["stroke-width"] || graphic.strokeWidth || "2";
            
            console.log("🖊️ Using stroke color:", strokeColor, "width:", strokeWidth);
            
            line.setAttribute("stroke", strokeColor);
            line.setAttribute("stroke-width", strokeWidth);
            
            console.log("📐 Created slash line:", line.outerHTML);
            return line;
        }
    }
    
    console.warn("⚠️ No valid slash graphic found");
    return null;
}

// Add this helper function to create graphic stroke elements
function createGraphicStrokeElements(graphicStroke: any): SVGElement[] {
    console.log("🔺 Creating full-width triangles from:", graphicStroke);
    const elements: SVGElement[] = [];
    
    // Handle your server's structure
    if (graphicStroke.graphics && graphicStroke.graphics.length > 0) {
        const graphic = graphicStroke.graphics[0];
        const originalSize = parseFloat(graphicStroke.size || "6");
        
        console.log("🔺 Graphic data:", graphic);
        console.log("📏 Original size:", originalSize);
        
        // For legend display, we want 4 triangles spanning the FULL line width
        const symbolCount = 4;
        const lineStart = 2;  // Line starts at x=2
        const lineEnd = 30;   // Line ends at x=30
        const lineWidth = lineEnd - lineStart; // 28px total
        
        // Each triangle gets equal width across the full line
        const triangleWidth = lineWidth / symbolCount; // 28/4 = 7px per triangle
        const triangleHeight = 6; // Make them a good height for visibility
        
        console.log("🧮 Symbol count:", symbolCount, "Triangle width:", triangleWidth, "height:", triangleHeight);
        
        for (let i = 0; i < symbolCount; i++) {
            // Calculate the center X position for this triangle
            const triangleLeft = lineStart + (i * triangleWidth);
            const triangleRight = lineStart + ((i + 1) * triangleWidth);
            const triangleCenter = (triangleLeft + triangleRight) / 2;
            
            const y = 10; // Line center
            
            console.log(`🎯 Creating triangle ${i}: left=${triangleLeft}, center=${triangleCenter}, right=${triangleRight}`);
            
            if (graphic.mark?.toLowerCase() === 'triangle') {
                const triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                
                // Position triangles so their base just touches the TOP edge of the line
                // Line has stroke-width of 2, so it extends 1px above and below y=10
                const lineTopEdge = y - 1; // Top edge of the 2px wide line
                
                // Create triangles that span the full allocated width
                const points = [
                    [triangleCenter, lineTopEdge - triangleHeight],  // Top point (above the line)
                    [triangleLeft, lineTopEdge],                     // Bottom left (touching line, at segment start)
                    [triangleRight, lineTopEdge]                     // Bottom right (touching line, at segment end)
                ].map(point => point.join(',')).join(' ');
                
                triangle.setAttribute("points", points);
                triangle.setAttribute("fill", graphic.fill || "#000000");
                triangle.setAttribute("stroke", graphic.stroke || "#000000");
                triangle.setAttribute("stroke-width", graphic["stroke-width"] || "0.5");
                
                console.log("🔺 Created full-width triangle:", triangle.outerHTML);
                elements.push(triangle);
            }
        }
    }
    
    console.log("🔺 Total full-width triangles created:", elements.length);
    return elements;
}