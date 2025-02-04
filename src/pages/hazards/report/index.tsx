import { Suspense, useEffect, useState } from 'react'
import ReportApp from '@/pages/hazards/report/report/ReportApp'
import { Aoi } from '@/pages/hazards/report/report/types/types';
import { useTheme } from '@/context/theme-provider';

export default function Report() {

    const [aoi, setAoi] = useState<Aoi | null>(null);
    const { setOverrideTheme } = useTheme()

    useEffect(() => {
        const aoiData = localStorage.getItem('aoi');
        if (!aoiData) {
            import('@/pages/hazards/report/report/testData.json').then((data) => {
                setAoi(data.default);
            });
        } else {
            setAoi(JSON.parse(aoiData));
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
            <ReportApp {...aoi} />
        </Suspense>
    )

}