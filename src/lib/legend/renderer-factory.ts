import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js";
import { MapImageLayerRenderer, RegularLayerRenderer } from '@/lib/types/mapping-types';

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
        const html = await symbolUtils.renderPreviewHTML(rendererData.renderer);
        return {
            html,
            label: rendererData.label,
            title: ''
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
            title
        };
    }
};
