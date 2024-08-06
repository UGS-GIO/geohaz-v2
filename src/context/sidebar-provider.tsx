import { SideLink } from '@/data/sidelinks';
import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface SidebarContextContextProps {
    currentContent: SideLink | null;
    setCurrentContent: Dispatch<SetStateAction<SideLink | null>>;
}

export const SidebarContext = createContext<SidebarContextContextProps | null>(null);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentContent, setCurrentContent] = useState<SideLink | null>(null);

    return (
        <SidebarContext.Provider value={{ currentContent, setCurrentContent }}>
            {children}
        </SidebarContext.Provider>
    );
};