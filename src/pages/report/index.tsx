import React, { Suspense, useEffect, useState } from 'react'
import { Layout } from '@/components/custom/layout'
import ReportApp from '@/components/report/ReportApp'
import { Aoi } from '@/components/report/types/types';

export default function Report() {

    const [aoi, setAoi] = useState<Aoi | null>(null);
    console.log('ReportAppWrapper');

    useEffect(() => {
        const aoiData = localStorage.getItem('aoi');
        if (!aoiData) {
            import('@/components/report/testData.json').then((data) => {
                setAoi(data.default);
            });
        } else {
            setAoi(JSON.parse(aoiData));
        }
    }, []);

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