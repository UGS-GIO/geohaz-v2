import { MapImageLayerRenderer, RegularLayerRenderer } from '@/lib/types/mapping-types';
import { CompositeSymbolResult } from '@/lib/legend/symbolizers/line';

export const RendererFactory = {
    createPreview: async (rendererData: MapImageLayerRenderer | RegularLayerRenderer) => {
        if ('renderer' in rendererData) {
            return RendererFactory.createFeatureLayerPreview(rendererData);
        } else if ('imageData' in rendererData) {
            return RendererFactory.createMapImageLayerPreview(rendererData);
        } else if (!('renderer' in rendererData)) {
            return RendererFactory.createNoLegendPreview(rendererData);
        }
        else {
            throw new Error("Unsupported renderer type");
        }
    },

    createFeatureLayerPreview: async (rendererData: RegularLayerRenderer) => {
        const renderer = rendererData.renderer;

        // Check if renderer is a CompositeSymbolResult
        if (renderer && typeof renderer === 'object' && 'isComposite' in renderer) {
            const compositeRenderer = renderer as CompositeSymbolResult;

            // Handle any case where we have HTML (both composite and single LineSymbolizers)
            if (compositeRenderer.html) {
                // Clone the element to avoid DOM manipulation issues
                const clonedElement = compositeRenderer.html.cloneNode(true) as HTMLElement;

                // Ensure proper styling for legend display
                clonedElement.style.width = '32px';
                clonedElement.style.height = '22px';
                clonedElement.style.display = 'block';
                clonedElement.style.minWidth = '32px';
                clonedElement.style.minHeight = '22px';

                return {
                    html: clonedElement,
                    label: rendererData.label,
                    title: '',
                    isComposite: compositeRenderer.isComposite
                };
            } else if (compositeRenderer.symbol) {
                // SVG symbol case - clone the SVG element
                const clonedElement = compositeRenderer.symbol.cloneNode(true) as SVGSVGElement;

                // Ensure proper styling for legend display
                clonedElement.style.width = '32px';
                clonedElement.style.height = '22px';
                clonedElement.style.display = 'block';
                clonedElement.style.minWidth = '32px';
                clonedElement.style.minHeight = '22px';

                return {
                    html: clonedElement,
                    label: rendererData.label,
                    title: '',
                    isComposite: compositeRenderer.isComposite
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

        // Check if renderer is an SVGSVGElement (direct SVG symbol)
        if (renderer instanceof SVGSVGElement) {
            const clonedElement = renderer.cloneNode(true) as SVGSVGElement;

            // Ensure proper styling for legend display
            clonedElement.style.width = '32px';
            clonedElement.style.height = '22px';
            clonedElement.style.display = 'block';
            clonedElement.style.minWidth = '32px';
            clonedElement.style.minHeight = '22px';

            return {
                html: clonedElement,
                label: rendererData.label,
                title: '',
                isComposite: false
            };
        }

        // Fallback: create a placeholder if no valid renderer is found
        console.warn('Unknown renderer type, creating placeholder:', renderer);
        const placeholder = document.createElement('div');
        placeholder.style.width = '32px';
        placeholder.style.height = '22px';
        placeholder.style.backgroundColor = '#cccccc';
        placeholder.style.border = '1px solid #999999';
        placeholder.style.display = 'block';
        placeholder.textContent = '?';
        placeholder.style.textAlign = 'center';
        placeholder.style.lineHeight = '18px';
        placeholder.style.fontSize = '12px';

        return {
            html: placeholder,
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
    },

    createNoLegendPreview: (rendererData: RegularLayerRenderer) => {
        const label = rendererData.label || 'No Legend Available';

        return {
            label: label,
            html: null,
            title: '',
            isComposite: false
        };
    }
};