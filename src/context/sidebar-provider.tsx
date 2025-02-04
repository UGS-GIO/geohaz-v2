import Info from '@/components/sidebar/info';
import useLocalStorage from '@/hooks/use-local-storage';
import { SideLink } from '@/lib/types/sidelink-types';
import { InfoIcon } from 'lucide-react';
import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface SidebarContextContextProps {
    currentContent: SideLink | null;
    setCurrentContent: Dispatch<SetStateAction<SideLink | null>>;
    isCollapsed: boolean;
    setIsCollapsed: Dispatch<SetStateAction<boolean>>;
    navOpened: boolean;
    setNavOpened: Dispatch<SetStateAction<boolean>>;
}

export const SidebarContext = createContext<SidebarContextContextProps>({
    currentContent: null,
    setCurrentContent: () => null,
    isCollapsed: false,
    setIsCollapsed: () => false,
    navOpened: false,
    setNavOpened: () => false,
});

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [currentContent, setCurrentContent] = useState<SideLink | null>({
        title: 'Info',
        label: '',
        icon: <InfoIcon className='stroke-foreground' />,
        component: Info,
        componentPath: 'src/components/sidebar/info.tsx',
    });
    const [isCollapsed, setIsCollapsed] = useLocalStorage({
        key: 'collapsed-sidebar',
        defaultValue: false,
    })
    const [navOpened, setNavOpened] = useState<boolean>(false);

    return (
        <SidebarContext.Provider value={{ currentContent, setCurrentContent, isCollapsed, setIsCollapsed, navOpened, setNavOpened }}>
            {children}
        </SidebarContext.Provider>
    );
};