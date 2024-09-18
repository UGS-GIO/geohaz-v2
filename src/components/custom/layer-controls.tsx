import { Info, Shrink, TableOfContents } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/custom/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LegendAccordion } from '@/components/custom/legend-accordion';
import { useRef } from 'react';
import { Toggle } from '@/components/ui/toggle';

interface LayerControlsProps {
    handleZoomToLayer: () => void;
    layerOpacity: number;
    handleOpacityChange: (e: number) => void;
    title: string;
    description: string;
    layerId: string;
    url: string;
}

const LayerControls: React.FC<LayerControlsProps> = ({
    handleZoomToLayer,
    layerOpacity,
    handleOpacityChange,
    description,
    title,
    layerId,
    url
}) => {
    // const [labelsVisible, setLabelsVisible] = useState(false);
    const cleanDescription = DOMPurify.sanitize(description, { USE_PROFILES: { html: true } });
    const triggerButtonRef = useRef<HTMLButtonElement>(null)

    const handleToggleLegend = () => {
        if (triggerButtonRef.current != null) {
            triggerButtonRef.current.click()
        }
    }

    return (
        <div className="flex flex-col gap-y-4 mx-8">
            <div className="flex flex-col justify-between items-center w-full gap-y-4">
                <div className="flex flex-row items-center justify-around gap-x-2 mt-2 w-full mx-auto">
                    <Label htmlFor={`${title}-opacity`}>
                        Opacity
                    </Label>
                    <Slider
                        className="flex-grow"
                        defaultValue={[layerOpacity * 100]}
                        onValueChange={(e) => handleOpacityChange(e[0])}
                    />
                </div>
                <div className="flex flex-col sm:flex-row justify-around items-center w-full gap-y-4 sm:gap-y-0">
                    <div className="flex flex-wrap justify-start items-center gap-y-2 sm:gap-y-0 sm:gap-x-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="stacked"
                                    className="flex flex-col sm:flex-row items-center p-2"
                                >
                                    <Info className="h-5 w-5" />
                                    <span className='mt-1 sm:ml-2 sm:mt-0'>Info</span> {/* Stacked on mobile */}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>{title}</DialogTitle>
                                </DialogHeader>
                                <DialogDescription className="text-sm text-muted-foreground">
                                    This is a placeholder to show that a muted description can be added to the dialog.
                                </DialogDescription>
                                <div className="custom-tooltip" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
                            </DialogContent>
                        </Dialog>

                        <Button
                            variant="ghost"
                            size="stacked"
                            className="flex flex-col sm:flex-row items-center p-2"
                            onClick={handleZoomToLayer}
                        >
                            <Shrink className="h-5 w-5" />
                            <span className='mt-1 sm:ml-2 sm:mt-0'>Zoom to</span> {/* Stacked on mobile */}
                        </Button>

                        <Toggle
                            ref={triggerButtonRef}
                            className='flex flex-col sm:flex-row items-center p-2'
                            aria-label="Toggle Legend"
                            // className="p-2"
                            size="stacked" // Use the new size variant for stacked behavior
                            onClick={handleToggleLegend}
                        >
                            <TableOfContents className="h-5 w-5" />
                            <span className='mt-1 sm:ml-2 sm:mt-0'>Legend</span> {/* Stacked on mobile, side-by-side on desktop */}
                        </Toggle>
                    </div>
                </div>

                {/* TODO: Implement label visibility */}
                {/* <div className="flex items-center justify-between gap-x-2 w-full">
                <Label htmlFor={`${title}-label-visibility`} className="mx-auto">
                    Turn Labels {labelsVisible ? 'Off' : 'On'} (in progress)
                </Label>
                <Switch
                    id={`${title}-label-visibility`}
                    className="ml-auto"
                    checked={labelsVisible}
                    onCheckedChange={() => setLabelsVisible(!labelsVisible)}
                />
            </div> */}
            </div>
            <LegendAccordion
                layerId={layerId}
                url={url}
                triggerBtn={<button ref={triggerButtonRef} style={{ display: 'none' }}>Open Dialog</button>} // Hidden button as trigger
            />
        </div >
    );
};

export default LayerControls;

