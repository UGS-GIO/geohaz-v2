import Info from '@/components/sidebar/info';
import useLocalStorage from '@/hooks/use-local-storage';
import { SideLink } from '@/lib/types/sidelink-types';
import { useGetSidebarLinks } from '@/hooks/use-get-sidebar-links';
import { InfoIcon } from 'lucide-react';
import React, { createContext, useState, ReactNode, Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';

interface SidebarContextProps {
    currentContent: SideLink | null;
    setCurrentContent: (content: SideLink | null) => void;
    isCollapsed: boolean;
    setIsCollapsed: Dispatch<SetStateAction<boolean>>;
    navOpened: boolean;
    setNavOpened: Dispatch<SetStateAction<boolean>>;
}

export const SidebarContext = createContext<SidebarContextProps>({
    currentContent: null,
    setCurrentContent: () => null,
    isCollapsed: false,
    setIsCollapsed: () => false,
    navOpened: false,
    setNavOpened: () => false,
});

const defaultInfoLink: SideLink = {
    title: 'Info',
    label: '',
    icon: <InfoIcon className='stroke-foreground' />,
    component: Info,
    componentPath: 'src/components/sidebar/info.tsx',
};

// --- Provider Component (Updated Logic) ---
export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const search = useSearch({ from: '__root__' });

    const { data: dynamicLinks } = useGetSidebarLinks();

    const [isCollapsed, setIsCollapsed] = useLocalStorage({
        key: 'collapsed-sidebar',
        defaultValue: false,
    });
    const [navOpened, setNavOpened] = useState<boolean>(false);

    const allAvailableLinks = useMemo(() => {
        // Now `dynamicLinks` is correctly either an array or undefined.
        return dynamicLinks ? [defaultInfoLink, ...dynamicLinks] : [defaultInfoLink];
    }, [dynamicLinks]);

    const currentTab = search.tab;
    const currentContent =
        // 1. If the tab is 'home', explicitly set content to `null` to show the link list.
        currentTab === 'home'
            ? null
            // 2. Otherwise, find the link that matches the tab.
            : allAvailableLinks.find(
                (link) => link.title.toLowerCase() === currentTab?.toLowerCase()
            ) || null; // 3. Fallback to null (or the Home view) if the tab is invalid.

    const handleSetCurrentContent = useCallback((content: SideLink | null) => {
        // If content is null (for "Home"), `newTab` is undefined, removing it from the URL.
        // Otherwise, set the tab to the link's title (e.g., "info", "layers").
        const newTab = content ? content.title.toLowerCase() : 'home';

        navigate({
            to: '.',
            search: (prev) => ({
                ...prev,
                tab: newTab,
            }),
            replace: true,
        });
    }, [navigate]);

    return (
        <SidebarContext.Provider
            value={{
                currentContent,
                setCurrentContent: handleSetCurrentContent,
                isCollapsed,
                setIsCollapsed,
                navOpened,
                setNavOpened,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};