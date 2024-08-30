import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface LayerListContextProps {
    groupLayerVisibility: Record<string, boolean>;
    setGroupLayerVisibility: Dispatch<SetStateAction<Record<string, boolean>>>;
    layerVisibility: Record<string, boolean>;
    setLayerVisibility: Dispatch<SetStateAction<Record<string, boolean>>>;
}

export const LayerListContext = createContext<LayerListContextProps>({
    groupLayerVisibility: {},
    setGroupLayerVisibility: () => { },
    layerVisibility: {},
    setLayerVisibility: () => { },
});

export const LayerListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [groupLayerVisibility, setGroupLayerVisibility] = useState<Record<string, boolean>>({});
    const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({});

    return (
        <LayerListContext.Provider value={{ groupLayerVisibility, setGroupLayerVisibility, layerVisibility, setLayerVisibility }}>
            {children}
        </LayerListContext.Provider>
    );
};
