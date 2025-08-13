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
            console.log(renderer)
            const compositeRenderer = renderer;
            
            // Handle any case where we have HTML (both composite and single LineSymbolizers)
            if (compositeRenderer.html) {
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
                    isComposite: compositeRenderer.isComposite
                };
            } else if (compositeRenderer.symbol) {
                // Single symbol case (fallback for other symbol types)
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