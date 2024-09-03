import { useContext, useEffect } from 'react';
import { SidebarContext } from '@/context/sidebar-provider';

// Custom hook to provide the sidebar context data
export function useSidebar() {
    const context = useContext(SidebarContext);

    // Ensure the hook is used within the SidebarContextProvider
    if (!context) {
        throw new Error(
            'useSidebar must be used within the scope of SidebarContextProvider'
        );
    }

    const { isCollapsed, setIsCollapsed } = context;

    useEffect(() => {
        const handleResize = () => {
            // Update isCollapsed based on window.innerWidth
            setIsCollapsed(window.innerWidth < 768 ? false : isCollapsed);
        };

        // Initial setup
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isCollapsed, setIsCollapsed]);

    return context;
}
