import { useContext, useEffect, useRef, useState } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/custom/button';
import { MapContext } from '@/context/map-provider';
import { useSidebar } from '@/hooks/use-sidebar';
import { cn } from '@/lib/utils';

const PopupDrawer = ({ container }: { container: HTMLDivElement | null }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    // consider making a usePopupContent hook
    const drawerTriggerRef = useRef<HTMLButtonElement>(null);
    const { view } = useContext(MapContext);
    const { isCollapsed } = useSidebar();


    const triggerBtn = (
        <button ref={drawerTriggerRef} className="hidden">
            Open Dialog
        </button>
    );

    // a non working stab at the queryVisibleLayers function

    // Function to query visible layers and create custom popup
    // function queryVisibleLayers(view: __esri.View, point: __esri.Point) {
    //     const visibleLayers = view.map.layers.filter(layer => layer.visible);
    //     const promises = [];



    //     visibleLayers.forEach(layer => {
    //         if (layer.type === 'feature') {
    //             // Query FeatureLayer
    //             const query = layer.createQuery();
    //             query.geometry = point;
    //             query.spatialRelationship = 'intersects';
    //             promises.push(layer.queryFeatures(query));
    //         } else if (layer.type === 'wms') {
    //             // Query WMSLayer using GetFeatureInfo
    //             const url = `${layer.url}?service=WMS&version=1.1.1&request=GetFeatureInfo&layers=${layer.layers}&query_layers=${layer.layers}&info_format=text/html&x=${point.x}&y=${point.y}&srs=EPSG:4326&bbox=${mapView.extent.xmin},${mapView.extent.ymin},${mapView.extent.xmax},${mapView.extent.ymax}&width=${mapView.width}&height=${mapView.height}`;
    //             promises.push(fetch(url).then(response => response.text()));
    //         }
    //     });

    //     Promise.all(promises).then(results => {
    //         let popupContent = '';

    //         results.forEach(result => {
    //             if (result.features) {
    //                 // Process FeatureLayer results
    //                 result.features.forEach(feature => {
    //                     popupContent += `<div>${JSON.stringify(feature.attributes)}</div>`;
    //                 });
    //             } else {
    //                 // Process WMSLayer results
    //                 popupContent += `<div>${result}</div>`;
    //             }
    //         });

    //         // Display custom popup
    //         <a href="http://mapView.popup.open" target="_blank" rel="noopener noreferrer">mapView.popup.open</a>({
    //             location: point,
    //             content: popupContent
    //         });
    //     });
    // }

    // Example usage
    // mapView.on('click', event => {
    //     queryVisibleLayers(mapView, event.mapPoint);
    // });



    useEffect(() => {

        view?.when(() => {
            view?.on("click", (event) => {
                console.log('clicked', event);
                setIsOpen(true);
            });
        });

    }, [view]);



    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div>
            <div className="h-0" onClick={handleToggle}>
                {triggerBtn}
            </div>

            <Drawer modal={false} noBodyStyles open={isOpen} onClose={() => setIsOpen(false)} container={container}>
                <DrawerContent
                    onInteractOutside={(e) => {
                        e.preventDefault();
                    }}
                    className={cn(isCollapsed ? 'md:ml-14' : 'md:ml-[36rem]')}
                >
                    <DrawerHeader>
                        <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                        <DrawerDescription>the popupcontent will go here, maybe embed the popup or assign by container id</DrawerDescription>
                    </DrawerHeader>
                    <DrawerFooter>
                        <Button>Submit</Button>
                        <DrawerClose>
                            <Button variant="outline">Cancel</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div >
    );
};

export { PopupDrawer };