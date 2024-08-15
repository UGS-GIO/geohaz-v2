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
        console.log('toggle legend');
        console.log(triggerButtonRef.current);

        if (triggerButtonRef.current != null) {
            triggerButtonRef.current.click()
        }
    }

    return (
        <div className="flex flex-col space-y-4 mx-8">
            <div className="flex flex-col justify-between items-center w-full space-y-4">
                <div className="flex flex-col sm:flex-row justify-around items-center w-full space-y-4 sm:space-y-0">
                    <div className="flex flex-wrap justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="flex items-center">
                                    <Info className="h-5 w-5 mr-2" />
                                    <span>Info</span>
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

                        <Button variant="ghost" className="flex items-center" onClick={handleZoomToLayer}>
                            <Shrink className="h-5 w-5 mr-2" />
                            <span>Zoom to</span>
                        </Button>
                        <Button ref={triggerButtonRef} variant="ghost" className="flex items-center" onClick={handleToggleLegend}>
                            <TableOfContents className="h-5 w-5 mr-2" />
                            <span>Legend</span>
                        </Button>
                    </div>
                </div>
                <div className="flex flex-row items-center justify-around space-x-2 w-full mx-auto">
                    <Label htmlFor={`${title}-opacity`}>
                        Opacity
                    </Label>
                    <Slider
                        className="flex-grow"
                        defaultValue={[layerOpacity * 100]}
                        onValueChange={(e) => handleOpacityChange(e[0])}
                    />
                </div>
                {/* TODO: Implement label visibility */}
                {/* <div className="flex items-center justify-between space-x-2 w-full">
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

