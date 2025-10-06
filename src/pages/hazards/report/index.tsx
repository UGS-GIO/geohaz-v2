import { Suspense, useEffect, useState } from 'react'
import ReportApp from '@/pages/hazards/report/report/ReportApp'
import { useTheme } from '@/context/theme-provider';
import { Route } from '@/routes/_report/hazards.report.$aoi.lazy';

export default function Report() {

    const { aoi } = Route.useParams();
    const [aoiState, setAoiState] = useState<{ rings: number[][][]; spatialReference: { wkid: number; }; } | null>(null);  // Initially null
    const { setOverrideTheme } = useTheme()

    useEffect(() => {
        if (!aoiState) {
            import('@/pages/hazards/report/report/testData.json').then((data) => {
                setAoiState(data.default);
            });
        } else {
            setAoiState(aoi as unknown as { rings: number[][][]; spatialReference: { wkid: number; }; });
        }
    }, []);

    // always override the theme to light for this page
    useEffect(() => {
        setOverrideTheme('light');
        // Cleanup function to remove the override when the component is unmounted
        return () => setOverrideTheme(null);
    }, [setOverrideTheme]);

    if (!aoi) {
        return <div>Loading...</div>;
    }

    // return (
    //     <Layout>
    //         <Layout.Header>
    //             <div className='ml-auto flex items-center space-x-4'>
    //                 Asnagkladgnkla
    //             </div>
    //         </Layout.Header>

    //         <Layout.Body>
    //             <Suspense fallback={<div>Loading Report...</div>}>
    //                 <ReportApp {...aoi} />

    //             </Suspense>
    //         </Layout.Body>
    //     </Layout>
    // )

    return (
        <Suspense fallback={<div>Loading Report...</div>}>
            <ReportApp polygon={aoi} />
        </Suspense>
    )

}