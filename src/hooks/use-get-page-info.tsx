import { useState, useEffect } from "react";
import { useGetCurrentPage } from "@/hooks/use-get-current-page";

interface WebsiteInfo {
    references: React.ReactNode;
    acknowledgements: React.ReactNode;
    dataDisclaimer: React.ReactNode;
    mapDetails: React.ReactNode;
    mapDetailsShortened: React.ReactNode;
    dataSources: React.ReactNode;
    dataSourcesShortened: React.ReactNode;
    appTitle: string;
}

const useGetPageInfo = () => {
    const currentPage = useGetCurrentPage();
    const [info, setInfo] = useState<WebsiteInfo | null>(null);

    useEffect(() => {
        const loadPageInfo = async () => {
            try {
                // Dynamically import the config file based on the page
                const websiteInfo = await import(`@/pages/${currentPage}/data/page-info.tsx`);
                setInfo(websiteInfo);
            } catch (error) {
                console.error('Error loading sidebar configuration:', error);
                setInfo(null);
            }
        };

        loadPageInfo();
    }, [currentPage]);

    return info;
};

export { useGetPageInfo };