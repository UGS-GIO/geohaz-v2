// import { Dispatch, SetStateAction, useContext, useEffect, useRef, useState } from 'react';
// import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
// import { Button } from '@/components/custom/button';
// import { Drawer as VaulDrawer } from 'vaul';
// import { MapContext } from '@/context/map-provider';
// import { useSidebar } from '@/hooks/use-sidebar';
// import { cn } from '@/lib/utils';
// import { useMapInteractions } from '@/hooks/use-map-interactions';

// const PopupDrawer = ({ container, drawerTriggerRef }: { container: HTMLDivElement | null, drawerTriggerRef: React.RefObject<HTMLButtonElement> }) => {
//     // consider making a usePopupContent hook
//     const { isCollapsed } = useSidebar();
//     // const { visibleLayers } = useMapInteractions();
//     const [snap, setSnap] = useState<number | string | null>(0);
//     const snapPoints = [0.2, 0.5, 0.8];



//     const triggerBtn = (
//         <button ref={drawerTriggerRef} className="hidden">
//             Open Dialog
//         </button>
//     );


//     return (

//         // <Drawer container={container} snapPoints={[0.2, 0.5, 0.8]} activeSnapPoint={snap} setActiveSnapPoint={setSnap} modal={false}>
//         <Drawer snapPoints={[0.2, 0.5, 0.8]} activeSnapPoint={snap} setActiveSnapPoint={setSnap} modal={false}>
//             <DrawerTrigger asChild>
//                 {triggerBtn}
//             </DrawerTrigger>
//             <DrawerPortal>
//                 {/* <DrawerOverlay className="fixed inset-0 bg-black/40" /> */}

//                 <DrawerContent
//                     className={cn(
//                         'inset-0',
//                         "bg-background flex flex-col rounded-t-[10px] fixed z-10 overflow-y-auto",
//                         // 'bottom-0 left-0 right-0',  // Ensure full width and bottom alignment
//                         'max-w-4xl w-full mx-auto' // Center content and limit height
//                     )}
//                 >
//                     <DrawerHeader>
//                         <DrawerTitle>Are you absolutely sure?</DrawerTitle>

//                     </DrawerHeader>
//                     <DrawerDescription>
//                         <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut accusantium deleniti, esse, facilis hic impedit incidunt deserunt quae quos eius expedita, nam at perspiciatis obcaecati tempore debitis! Hic, laudantium provident?  </p>
//                         <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut accusantium deleniti, esse, facilis hic impedit incidunt deserunt quae quos eius expedita, nam at perspiciatis obcaecati tempore debitis! Hic, laudantium provident?</p>
//                         <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut accusantium deleniti, esse, facilis hic impedit incidunt deserunt quae quos eius expedita, nam at perspiciatis obcaecati tempore debitis! Hic, laudantium provident?</p>
//                         <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut accusantium deleniti, esse, facilis hic impedit incidunt deserunt quae quos eius expedita, nam at perspiciatis obcaecati tempore debitis! Hic, laudantium provident?</p>
//                         <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut accusantium deleniti, esse, facilis hic impedit incidunt deserunt quae quos eius expedita, nam at perspiciatis obcaecati tempore debitis! Hic, laudantium provident?</p>
//                         <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut accusantium deleniti, esse, facilis hic impedit incidunt deserunt quae quos eius expedita, nam at perspiciatis obcaecati tempore debitis! Hic, laudantium provident?</p>
//                         <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut accusantium deleniti, esse, facilis hic impedit incidunt deserunt quae quos eius expedita, nam at perspiciatis obcaecati tempore debitis! Hic, laudantium provident?</p>
//                         <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Aut accusantium deleniti, esse, facilis hic impedit incidunt deserunt quae quos eius expedita, nam at perspiciatis obcaecati tempore debitis! Hic, laudantium provident?  </p>
//                     </DrawerDescription>
//                     <DrawerFooter>
//                         <Button>Submit</Button>
//                         <DrawerClose>
//                             <Button variant="outline">Cancel</Button>
//                         </DrawerClose>
//                     </DrawerFooter>
//                 </DrawerContent>
//             </DrawerPortal>
//         </Drawer >
//     );
// };

// export { PopupDrawer };