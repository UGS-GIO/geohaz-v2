import { createContext, useContext, useCallback, ReactNode, useMemo, useEffect, useRef } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { LayerProps } from '@/lib/types/mapping-types';
import { useGetLayerConfig } from '@/hooks/use-get-layer-config';

interface LayerUrlContextType {
    selectedLayerTitles: Set<string>;
    hiddenGroupTitles: Set<string>;
    updateLayerSelection: (titles: string | string[], shouldBeSelected: boolean) => void;
    toggleGroupVisibility: (title: string) => void;
}

const LayerUrlContext = createContext<LayerUrlContextType | undefined>(undefined);

const getDefaultVisible = (layers: LayerProps[]): string[] => {
    let visible: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'group' && 'layers' in layer && layer.layers) {
            visible.push(...getDefaultVisible(layer.layers));
        } else if (layer.visible && layer.title) {
            visible.push(layer.title);
        }
    });
    return visible;
};

const getDefaultHiddenGroups = (layers: LayerProps[]): string[] => {
    let hidden: string[] = [];
    layers.forEach(layer => {
        if (layer.type === 'group' && layer.title) {
            if (layer.visible === false) {
                hidden.push(layer.title);
            }
            if ('layers' in layer && layer.layers) {
                hidden.push(...getDefaultHiddenGroups(layer.layers));
            }
        }
    });
    return hidden;
};

export const LayerUrlProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const { visibility: urlVisibility } = useSearch({ from: '__root__' });
    const layersConfig = useGetLayerConfig();
    const hasInitialized = useRef(false);

    const selectedLayerTitles = useMemo(() => new Set(urlVisibility?.selected || []), [urlVisibility]);
    const hiddenGroupTitles = useMemo(() => new Set(urlVisibility?.hidden || []), [urlVisibility]);

    useEffect(() => {
        if (!layersConfig || hasInitialized.current) return;
        if (!urlVisibility) {
            const defaultSelected = getDefaultVisible(layersConfig);
            const defaultHidden = getDefaultHiddenGroups(layersConfig);

            console.log('defaulthid:', defaultHidden);


            const newVisibility: { selected?: string[], hidden?: string[] } = {};
            if (defaultSelected.length > 0) {
                newVisibility.selected = defaultSelected;
            }
            if (defaultHidden.length > 0) {
                newVisibility.hidden = defaultHidden;
            }

            if (Object.keys(newVisibility).length > 0) {
                navigate({ to: '.', search: (prev) => ({ ...prev, visibility: JSON.stringify(newVisibility) }), replace: true });
            }
        }
        hasInitialized.current = true;
        // FIX: Add `urlVisibility` to the dependency array
    }, [layersConfig, navigate, urlVisibility]);

    const updateLayerSelection = useCallback((titles: string | string[], shouldBeSelected: boolean) => {
        const newSelectedSet = new Set(selectedLayerTitles);
        const titlesToUpdate = Array.isArray(titles) ? titles : [titles];
        if (shouldBeSelected) {
            titlesToUpdate.forEach(title => newSelectedSet.add(title));
        } else {
            titlesToUpdate.forEach(title => newSelectedSet.delete(title));
        }

        const { selected, ...restOfVisibility } = urlVisibility || {};
        const newVisibility = { ...restOfVisibility, ...(newSelectedSet.size > 0 && { selected: Array.from(newSelectedSet) }) };
        const newVisibilityString = Object.keys(newVisibility).length > 0 ? JSON.stringify(newVisibility) : undefined;
        navigate({ to: '.', search: (prev) => ({ ...prev, visibility: newVisibilityString }), replace: true });
    }, [navigate, selectedLayerTitles, urlVisibility]);

    const toggleGroupVisibility = useCallback((title: string) => {
        const newHiddenSet = new Set(hiddenGroupTitles);
        if (newHiddenSet.has(title)) {
            newHiddenSet.delete(title);
        } else {
            newHiddenSet.add(title);
        }

        const { hidden, ...restOfVisibility } = urlVisibility || {};
        const newVisibility = { ...restOfVisibility, ...(newHiddenSet.size > 0 && { hidden: Array.from(newHiddenSet) }) };
        const newVisibilityString = Object.keys(newVisibility).length > 0 ? JSON.stringify(newVisibility) : undefined;
        navigate({ to: '.', search: (prev) => ({ ...prev, visibility: newVisibilityString }), replace: true });
    }, [navigate, hiddenGroupTitles, urlVisibility]);

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