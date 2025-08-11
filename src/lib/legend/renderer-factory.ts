import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js";
import { MapImageLayerRenderer, RegularLayerRenderer } from '@/lib/types/mapping-types';
import { SymbolUnion } from "@arcgis/core/unionTypes.js";

// Interface to match the CompositeSymbolResult from symbol-generator.ts
interface CompositeSymbolResult {
    symbol?: __esri.Symbol;
    html?: HTMLElement;
    isComposite: boolean;
    symbolizers: any[];
}

export const RendererFactory = {
    createPreview: async (rendererData: MapImageLayerRenderer | RegularLayerRenderer) => {
        if ('renderer' in rendererData) {
            return RendererFactory.createFeatureLayerPreview(rendererData);
        } else if ('imageData' in rendererData) {
            return RendererFactory.createMapImageLayerPreview(rendererData);
        } else {
            throw new Error("Unsupported renderer type");
        }
    },

    createFeatureLayerPreview: async (rendererData: RegularLayerRenderer) => {
        const renderer = rendererData.renderer;

        // Check if renderer is a CompositeSymbolResult
        if (renderer && typeof renderer === 'object' && 'isComposite' in renderer) {
            const compositeRenderer = renderer as CompositeSymbolResult;
            
            if (compositeRenderer.isComposite && compositeRenderer.html) {
                // Clone the element to avoid DOM manipulation issues
                const clonedElement = compositeRenderer.html.cloneNode(true) as HTMLElement;
                
                // Ensure proper styling for legend display
                clonedElement.style.width = '32px';
                clonedElement.style.height = '20px';
                clonedElement.style.display = 'block';
                clonedElement.style.minWidth = '32px';
                clonedElement.style.minHeight = '20px';
                
                return {
                    html: clonedElement,
                    label: rendererData.label,
                    title: '',
                    isComposite: true
                };
            } else if (compositeRenderer.symbol) {
                // Single symbol case
                const html = await symbolUtils.renderPreviewHTML(compositeRenderer.symbol as SymbolUnion);
                return {
                    html,
                    label: rendererData.label,
                    title: '',
                    isComposite: false
                };
            }
        }

        // Check if renderer is a direct HTMLElement (legacy support)
        if (renderer instanceof HTMLElement) {
            return {
                html: renderer,
                label: rendererData.label,
                title: '',
                isComposite: true
            };
        }

        // Standard ArcGIS symbol handling
        const html = await symbolUtils.renderPreviewHTML(renderer as SymbolUnion);
        return {
            html,
            label: rendererData.label,
            title: '',
            isComposite: false
        };
    },

    createMapImageLayerPreview: async (rendererData: MapImageLayerRenderer) => {
        const title = rendererData.title;
        const imgHTML = `<img src="data:image/png;base64,${rendererData.imageData}" alt="${rendererData.label}" />`;
        const range = document.createRange();
        const fragment = range.createContextualFragment(imgHTML);
        const html = fragment.firstChild as HTMLElement;

        return {
            html,
            label: rendererData.label,
            title,
            isComposite: false
        };
    }
};

// Enhanced version with better error handling and debugging
export const EnhancedRendererFactory = {
    createPreview: async (rendererData: MapImageLayerRenderer | RegularLayerRenderer) => {
        if ('renderer' in rendererData) {
            return EnhancedRendererFactory.createFeatureLayerPreview(rendererData);
        } else if ('imageData' in rendererData) {
            return EnhancedRendererFactory.createMapImageLayerPreview(rendererData);
        } else {
            throw new Error("Unsupported renderer type");
        }
    },

    createFeatureLayerPreview: async (rendererData: RegularLayerRenderer) => {
        const renderer = rendererData.renderer;

        console.log('Processing renderer:', renderer);

        // Handle CompositeSymbolResult objects
        if (renderer && typeof renderer === 'object' && 'isComposite' in renderer) {
            const compositeRenderer = renderer as CompositeSymbolResult;
            
            console.log('Found CompositeSymbolResult:', {
                isComposite: compositeRenderer.isComposite,
                hasHtml: !!compositeRenderer.html,
                hasSymbol: !!compositeRenderer.symbol,
                symbolizerCount: compositeRenderer.symbolizers?.length
            });

            if (compositeRenderer.isComposite && compositeRenderer.html) {
                // Clone the element to avoid DOM manipulation issues
                const clonedElement = compositeRenderer.html.cloneNode(true) as HTMLElement;
                
                // Ensure proper styling for legend display
                clonedElement.style.width = '40px';
                clonedElement.style.height = '20px';
                clonedElement.style.display = 'block';
                
                return {
                    html: clonedElement,
                    label: rendererData.label,
                    title: '',
                    isComposite: true,
                    symbolType: 'composite-line',
                    symbolizerCount: compositeRenderer.symbolizers?.length || 0
                };
            } else if (compositeRenderer.symbol) {
                // Single symbol case from CompositeSymbolResult
                const html = await symbolUtils.renderPreviewHTML(compositeRenderer.symbol as SymbolUnion);
                return {
                    html,
                    label: rendererData.label,
                    title: '',
                    isComposite: false,
                    symbolType: 'single-from-composite'
                };
            }
        }

        // Handle direct HTMLElement (legacy support)
        if (renderer instanceof HTMLElement) {
            console.log('Found HTMLElement renderer');
            const clonedElement = renderer.cloneNode(true) as HTMLElement;
            
            // Ensure proper styling for legend display
            clonedElement.style.width = '40px';
            clonedElement.style.height = '20px';
            clonedElement.style.display = 'block';
            
            return {
                html: clonedElement,
                label: rendererData.label,
                title: '',
                isComposite: true,
                symbolType: 'legacy-html'
            };
        }

        // Standard ArcGIS symbol handling
        try {
            console.log('Processing as standard ArcGIS symbol');
            const html = await symbolUtils.renderPreviewHTML(renderer as SymbolUnion);
            return {
                html,
                label: rendererData.label,
                title: '',
                isComposite: false,
                symbolType: 'arcgis-symbol'
            };
        } catch (error) {
            console.error('Error rendering symbol preview:', error, renderer);
            
            // Fallback: create a simple representation
            const fallbackSvg = this.createFallbackSymbol();
            return {
                html: fallbackSvg,
                label: rendererData.label,
                title: '',
                isComposite: false,
                symbolType: 'fallback',
                error: error
            };
        }
    },

    createMapImageLayerPreview: async (rendererData: MapImageLayerRenderer) => {
        const title = rendererData.title;
        const imgHTML = `<img src="data:image/png;base64,${rendererData.imageData}" alt="${rendererData.label}" style="max-width: 40px; max-height: 20px;" />`;
        const range = document.createRange();
        const fragment = range.createContextualFragment(imgHTML);
        const html = fragment.firstChild as HTMLElement;

        return {
            html,
            label: rendererData.label,
            title,
            isComposite: false,
            symbolType: 'map-image'
        };
    },

    createFallbackSymbol: (): HTMLElement => {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "40");
        svg.setAttribute("height", "20");
        svg.setAttribute("viewBox", "0 0 40 20");
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", "2");
        line.setAttribute("y1", "10");
        line.setAttribute("x2", "38");
        line.setAttribute("y2", "10");
        line.setAttribute("stroke", "#666666");
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-linecap", "round");
        
        svg.appendChild(line);
        return svg;
    }
};