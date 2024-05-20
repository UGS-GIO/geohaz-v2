import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextProps {
    currentActionName: string | undefined;
    setCurrentActionName: (actionName: string | undefined) => void;
}

const NavigationContext = createContext<NavigationContextProps | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentActionName, setCurrentActionName] = useState<string | undefined>(undefined);

    return (
        <NavigationContext.Provider value={{ currentActionName, setCurrentActionName }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};
