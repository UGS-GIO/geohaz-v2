import { useState, useEffect } from "react";
import { useGetCurrentPage } from "./use-get-current-page";
import { SideLink } from "@/lib/types/sidelink-types";

const useGetSidebarLinks = () => {
    const currentPage = useGetCurrentPage();
    const [sidebarLinks, setSidebarLinks] = useState<SideLink[] | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                // Dynamically import the config file based on the page
                const links = await import(`@/pages/${currentPage}/data/sidelinks.tsx`);
                setSidebarLinks(links.sidelinks);
            } catch (error) {
                console.error('Error loading sidebar configuration:', error);
                setSidebarLinks(null);
            }
        };

        loadConfig();
    }, [currentPage]);

    return sidebarLinks;
};

export { useGetSidebarLinks };