import { createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { useSearch, useNavigate, useLocation } from '@tanstack/react-router';
import { LayerProps } from '@/lib/types/mapping-types';
import { useGetLayerConfig } from '@/hooks/use-get-layer-config';

interface LayerUrlContextType {
    selectedLayerTitles: Set<string>;
    hiddenGroupTitles: Set<string>;
    updateLayerSelection: (titles: string | string[], shouldBeSelected: boolean) => void;
    toggleGroupVisibility: (title: string) => void;
}

const LayerUrlContext = createContext<LayerUrlContextType | undefined>(undefined);

const getAllValidTitles = (layers: LayerProps[], groupsOnly = false): Set<string> => {
    const titles = new Set<string>();
    layers.forEach(layer => {
        if (layer.type === 'group' && layer.title) {
            titles.add(layer.title);
            if ('layers' in layer && layer.layers) {
                getAllValidTitles(layer.layers, groupsOnly).forEach(t => titles.add(t));
            }
        } else if (!groupsOnly && layer.title) {
            titles.add(layer.title);
        }
    });
    return titles;
};

const getDefaultVisible = (layers: LayerProps[]): { selected: string[], hidden: string[] } => {
    let selected: string[] = [];
    let hidden: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'group' && 'layers' in layer && layer.layers) {
            if (layer.visible === false && layer.title) hidden.push(layer.title);
            const children = getDefaultVisible(layer.layers);
            selected.push(...children.selected);
            hidden.push(...children.hidden);
        } else if (layer.visible && layer.title) {
            selected.push(layer.title);
        }
    });
    return { selected, hidden };
};

export const LayerUrlProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const { layers: urlLayers, filters: urlFilters } = useSearch({ from: '__root__' });
    const layersConfig = useGetLayerConfig();
    const hasInitializedForPath = useRef<string | null>(null);
    const location = useLocation();

    if (hasInitializedForPath.current !== location.pathname) {
        hasInitializedForPath.current = null; // Reset when path changes
    }

    const selectedLayerTitles = useMemo(() => new Set(urlLayers?.selected || []), [urlLayers]);
    const hiddenGroupTitles = useMemo(() => new Set(urlLayers?.hidden || []), [urlLayers]);

    useEffect(() => {
        if (!layersConfig || hasInitializedForPath.current === location.pathname) {
            return;
        }

        const allValidLayerTitles = getAllValidTitles(layersConfig);
        const defaults = getDefaultVisible(layersConfig);

        let finalLayers = urlLayers;
        let finalFilters = urlFilters;
        let needsUpdate = false;

        if (urlFilters) {
            const validFilterKeys = Object.keys(urlFilters).filter(key => allValidLayerTitles.has(key));
            if (validFilterKeys.length < Object.keys(urlFilters).length) {
                finalFilters = undefined;
                needsUpdate = true;
            }
        }

        if (!urlLayers || urlLayers.selected?.length === 0) {
            finalLayers = defaults;
            needsUpdate = true;
        } else {
            const currentSelected = urlLayers.selected || [];
            const validSelected = currentSelected.filter(title => allValidLayerTitles.has(title));
            if (currentSelected.length > 0 && validSelected.length === 0) {
                finalLayers = defaults;
                needsUpdate = true;
            } else if (validSelected.length !== currentSelected.length) {
                finalLayers = { ...urlLayers, selected: validSelected };
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            const finalLayersString = Object.keys(finalLayers || {}).length > 0 ? JSON.stringify(finalLayers) : undefined;
            navigate({
                to: '.',
                search: (prev) => ({ ...prev, layers: finalLayersString, filters: finalFilters }),
                replace: true
            });
        }

        hasInitializedForPath.current = location.pathname;

    }, [layersConfig, navigate, urlLayers, urlFilters, location.pathname]);

    const updateLayerSelection = useCallback((titles: string | string[], shouldBeSelected: boolean) => {
        const newSelectedSet = new Set(selectedLayerTitles);
        const titlesToUpdate = Array.isArray(titles) ? titles : [titles];
        if (shouldBeSelected) {
            titlesToUpdate.forEach(title => newSelectedSet.add(title));
        } else {
            titlesToUpdate.forEach(title => newSelectedSet.delete(title));
        }

        const { selected, ...restOfLayers } = urlLayers || {};
        const newLayers = { ...restOfLayers, ...(newSelectedSet.size > 0 && { selected: Array.from(newSelectedSet) }) };
        const newLayersString = Object.keys(newLayers).length > 0 ? JSON.stringify(newLayers) : undefined;
        navigate({ to: '.', search: (prev) => ({ ...prev, layers: newLayersString }), replace: true });
    }, [navigate, selectedLayerTitles, urlLayers]);

    const toggleGroupVisibility = useCallback((title: string) => {
        const newHiddenSet = new Set(hiddenGroupTitles);
        if (newHiddenSet.has(title)) {
            newHiddenSet.delete(title);
        } else {
            newHiddenSet.add(title);
        }

        const { hidden, ...restOfLayers } = urlLayers || {};
        const newLayers = { ...restOfLayers, ...(newHiddenSet.size > 0 && { hidden: Array.from(newHiddenSet) }) };
        const newLayersString = Object.keys(newLayers).length > 0 ? JSON.stringify(newLayers) : undefined;
        navigate({ to: '.', search: (prev) => ({ ...prev, layers: newLayersString }), replace: true });
    }, [navigate, hiddenGroupTitles, urlLayers]);

    return (
        <LayerUrlContext.Provider value={{ selectedLayerTitles, hiddenGroupTitles, updateLayerSelection, toggleGroupVisibility }}>
            {children}
        </LayerUrlContext.Provider>
    );
};

export const useLayerUrl = () => {
    const context = useContext(LayerUrlContext);
    if (!context) throw new Error('useLayerUrl must be used within a LayerUrlProvider');
    return context;
};