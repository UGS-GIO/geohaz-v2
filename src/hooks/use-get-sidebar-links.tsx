// src/hooks/use-get-sidebar-links.ts
import { useQuery } from '@tanstack/react-query';
import { useGetCurrentPage } from "./use-get-current-page";
import { SideLink } from "@/lib/types/sidelink-types";

/**
 * Fetches the sidebar links for the current page using TanStack Query.
 */
export const useGetSidebarLinks = () => {
    const currentPage = useGetCurrentPage();

    return useQuery<SideLink[], Error>({
        queryKey: ['sidebar-links', currentPage],

        // The function that performs the async data fetching.
        queryFn: async () => {
            const module = await import(`@/pages/${currentPage}/data/sidelinks.tsx`);
            return module.sidelinks || [];
        },
        enabled: !!currentPage,
        staleTime: Infinity,    // These links are static, so we can cache them forever.
    });
};