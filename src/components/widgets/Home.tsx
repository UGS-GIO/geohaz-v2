// widgets/Home.tsx
import { useEffect, useRef, useContext } from 'react';
import Home from '@arcgis/core/widgets/Home';
import { MapContext } from '../../contexts/MapProvider';

const HomeWidget: React.FC = () => {
    const homeRef = useRef<HTMLDivElement>(null);
    const { view } = useContext(MapContext);

    useEffect(() => {
        if (homeRef.current && view) {
            const home = new Home({
                view,
                container: homeRef.current
            });

            view.ui.add(home, 'top-left');
            return () => {
                view.ui.remove(home);
            }
        }
    }, [view]);

    return <div ref={homeRef} />;
};

export default HomeWidget;