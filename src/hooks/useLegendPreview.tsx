import { useEffect, useState } from 'react';
import * as symbolUtils from "@arcgis/core/symbols/support/symbolUtils.js";
import { useQuery } from '@tanstack/react-query';
import { GetRenderer, MapImageLayerRenderer, RegularLayerRenderer } from '../config/types/mappingTypes';

const useLegendPreview = (layerId: string, url: string | undefined, getRenderer: GetRenderer) => {
    const [preview, setPreview] = useState<{ html: HTMLElement, label: string, title?: string }[]>();

    const { data: legendData } = useQuery(
        {
            queryKey: ['legendHTML', layerId],
            queryFn: () => getRenderer ? getRenderer(layerId, url) : Promise.resolve(undefined),
        }
    );

    useEffect(() => {
        const generatePreview = async (rendererData: MapImageLayerRenderer | RegularLayerRenderer) => {
            let html: HTMLElement | null = null;
            let title = '';
            const label = rendererData.label;

            if ('renderer' in rendererData) {
                html = await symbolUtils.renderPreviewHTML(rendererData.renderer);
            } else if ('imageData' in rendererData) {
                title = rendererData.title;
                const imgHTML = `<img src="data:image/png;base64,${rendererData.imageData}" alt="${label}" />`;
                const range = document.createRange();
                const fragment = range.createContextualFragment(imgHTML);
                html = fragment.firstChild as HTMLElement;
            }

            if (html) {
                return { html, label, title };
            }
            return null;
        };

        const generateAllPreviews = async () => {
            if (legendData) {
                const allRenderers = [...legendData.MapImageLayerRenderer, ...legendData.RegularLayerRenderer];
                const previews = [];
                for (let sublayerIndex = 0; sublayerIndex < allRenderers.length; sublayerIndex++) {
                    const rendererData = allRenderers[sublayerIndex];
                    const preview = await generatePreview(rendererData);
                    if (preview) {
                        previews.push(preview);
                    }
                }
                setPreview(previews);
            }
        };
        generateAllPreviews();
    }, [legendData]);

    return preview;
};

export default useLegendPreview;
