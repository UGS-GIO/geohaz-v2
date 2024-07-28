import { SideLink } from '@/data/sidelinks';
import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface SidebarContextContextProps {
    currentContent: SideLink | null;
    setCurrentContent: Dispatch<SetStateAction<SideLink | null>>;
}

const SidebarContext = createContext<SidebarContextContextProps | null>(null);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentContent, setCurrentContent] = useState<SideLink | null>(null);

    return (
        <SidebarContext.Provider value={{ currentContent, setCurrentContent }}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
