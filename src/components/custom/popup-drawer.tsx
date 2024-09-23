import { useContext, useEffect, useRef, useState } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
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

            <Drawer modal={false} open={isOpen} onClose={() => setIsOpen(false)} container={container}>
                <DrawerContent
                    showOverlay={false}
                    onInteractOutside={(e) => {
                        e.preventDefault();
                    }}
                    className={cn("pointer-events-auto", isCollapsed ? 'md:ml-14' : 'md:ml-[36rem]')}
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