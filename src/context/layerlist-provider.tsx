import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

// TODO: lookinto putting the layerVisibility in the context

interface LayerListContextProps {
    groupLayerVisibility: Record<string, boolean>;
    setGroupLayerVisibility: Dispatch<SetStateAction<Record<string, boolean>>>;
    // layerVisibility: Record<string, boolean>;
    // setLayerVisibility: Dispatch<SetStateAction<Record<string, boolean>>>;
}

export const LayerListContext = createContext<LayerListContextProps>({
    groupLayerVisibility: {},
    setGroupLayerVisibility: () => { },
    // layerVisibility: {},
    // setLayerVisibility: () => { },
});

export const LayerListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [groupLayerVisibility, setGroupLayerVisibility] = useState<Record<string, boolean>>({});

    return (
        <LayerListContext.Provider value={{ groupLayerVisibility, setGroupLayerVisibility }}>
            {children}
        </LayerListContext.Provider>
    );
};
