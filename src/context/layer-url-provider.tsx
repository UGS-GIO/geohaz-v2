import { createContext, useContext, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { LayerProps } from '@/lib/types/mapping-types';
import { useGetLayerConfig } from '@/hooks/use-get-layer-config';

interface LayerUrlContextType {
    visibleLayerTitles: Set<string>;
    updateLayerVisibility: (titles: string | string[], shouldBeVisible: boolean) => void;
}

const LayerUrlContext = createContext<LayerUrlContextType | undefined>(undefined);

// Helper functions (can be moved to a utils file)
const getAllValidTitles = (layers: LayerProps[]): Set<string> => {
    const titles = new Set<string>();
    const traverse = (layerArray: LayerProps[]) => {
        for (const layer of layerArray) {
            if (layer.title) {
                titles.add(layer.title);
            }
            if (layer.type === 'group' && 'layers' in layer && layer.layers) {
                traverse(layer.layers);
            }
        }
    };
    traverse(layers);
    return titles;
};

const getDefaultVisible = (layers: LayerProps[]): string[] => {
    let visible: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'group' && 'layers' in layer && layer.layers) {
            visible = [...visible, ...getDefaultVisible(layer.layers)];
        } else if (layer.visible && layer.title) {
            visible.push(layer.title);
        }
    });
    return visible;
};

export const LayerUrlProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const { layers: urlLayers } = useSearch({ from: '__root__' });
    const layersConfig = useGetLayerConfig();

    const allValidTitles = useMemo(() => {
        if (!layersConfig) return new Set<string>();
        return getAllValidTitles(layersConfig);
    }, [layersConfig]);

    const visibleLayerTitles = useMemo(() => {
        if (!urlLayers) return new Set<string>();
        const layersArray = Array.isArray(urlLayers) ? urlLayers : [urlLayers];
        return new Set(layersArray.filter(title => allValidTitles.has(title)));
    }, [urlLayers, allValidTitles]);

    useEffect(() => {
        if (!layersConfig) return;

        const layersParamExists = new URL(window.location.href).searchParams.has('layers');

        // Case 1: The `layers` parameter is not in the URL at all.
        if (!layersParamExists) {
            const defaults = getDefaultVisible(layersConfig);
            if (defaults.length > 0) {
                navigate({
                    to: '.',
                    search: (prev) => ({ ...prev, layers: defaults }), replace: true
                });
            }
            return;
        }

        // Case 2: The `layers` parameter IS present. We validate its contents.
        const urlLayersArray = Array.isArray(urlLayers) ? urlLayers : (urlLayers ? [urlLayers].filter(Boolean) : []);
        const validatedTitles = urlLayersArray.filter(title => allValidTitles.has(title));

        // If, after validation, the list is empty (because the param was empty OR all titles were invalid),
        // we populate the defaults.
        if (validatedTitles.length === 0) {
            const defaults = getDefaultVisible(layersConfig);
            // Only update if there are defaults, to prevent an infinite loop on `?layers=`
            if (defaults.length > 0) {
                navigate({
                    to: '.',
                    search: (prev) => ({ ...prev, layers: defaults }), replace: true
                });
            }
        }
        // Otherwise, if the list isn't empty, but we removed some invalid titles, we clean the URL.
        else if (validatedTitles.length < urlLayersArray.length) {
            navigate({
                to: '.',
                search: (prev) => ({ ...prev, layers: validatedTitles }), replace: true
            });
        }
        // If the URL was already clean and valid, we do nothing.
    }, [layersConfig, urlLayers, allValidTitles, navigate]);



    const updateLayerVisibility = useCallback((titles: string | string[], shouldBeVisible: boolean) => {
        const titlesToUpdate = Array.isArray(titles) ? titles : [titles];
        const newVisibleSet = new Set(visibleLayerTitles);

        if (shouldBeVisible) {
            titlesToUpdate.forEach(title => newVisibleSet.add(title));
        } else {
            titlesToUpdate.forEach(title => newVisibleSet.delete(title));
        }

        const newLayers = Array.from(newVisibleSet);

        // If the final list of layers is empty, remove the 'layers' key from the URL.
        if (newLayers.length === 0) {
            navigate({
                to: '.',
                search: (prev) => {
                    const { layers, ...rest } = prev; // Create a new object without the 'layers' key
                    return rest;
                },
                replace: true,
            });
        } else {
            // Otherwise, update the URL with the new list.
            navigate({
                to: '.',
                search: (prev) => ({ ...prev, layers: newLayers }),
                replace: true,
            });
        }

    }, [navigate, visibleLayerTitles]);

    return (
        <LayerUrlContext.Provider value={{ visibleLayerTitles, updateLayerVisibility }}>
            {children}
        </LayerUrlContext.Provider>
    );
};

export const useLayerUrl = () => {
    const context = useContext(LayerUrlContext);
    if (context === undefined) {
        throw new Error('useLayerUrl must be used within a LayerUrlProvider');
    }
    return context;
};