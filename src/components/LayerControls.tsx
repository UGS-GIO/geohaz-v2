import { ArrowsIn, Info } from '@phosphor-icons/react';
import DOMPurify from 'dompurify';
import { Button } from './@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./@/components/ui/dialog"
import { Switch } from './@/components/ui/switch';
import { Label } from './@/components/ui/label';
import { Slider } from './@/components/ui/slider';
import { useState } from 'react';



interface LayerControlsProps {
    layerVisibility: boolean | undefined;
    handleVisibilityToggle: () => void | undefined;
    layerOpacity: number;
    handleOpacityChange: (e: number) => void;
    handleZoomToLayer: () => void;
    title: string;
    description: string;
}

const LayerControls: React.FC<LayerControlsProps> = ({ layerVisibility, handleVisibilityToggle, handleZoomToLayer, layerOpacity, handleOpacityChange, description, title }) => {

    const [opacitySwitchChecked, setOpacitySwitchChecked] = useState(true);
    const [labelsVisible, setLabelsVisible] = useState(false);
    // Sanitize the description
    const cleanDescription = DOMPurify.sanitize(description, { USE_PROFILES: { html: true } });

    return (
        <div className="flex flex-col justify-between items-center w-full space-y-4">
            <div className="flex flex-row justify-around items-center w-full">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" className="flex items-center">
                            <Info className="h-5 w-5 mr-2" color="#d26e03" />
                            <span>Layer Information</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{title}</DialogTitle>
                        </DialogHeader>
                        <DialogDescription className="text-sm text-muted-foreground">This is a placeholder to show that a muted description can be added to the dialog.</DialogDescription>
                        <div className="grid gap-4 py-4">
                            <div className='custom-tooltip' dangerouslySetInnerHTML={{ __html: cleanDescription }} />
                        </div>
                    </DialogContent>
                </Dialog>

                {/* TODO: implement zoom to layer */}
                <Button variant="ghost" className="flex items-center" onClick={handleZoomToLayer}>
                    <ArrowsIn className="h-5 w-5 mr-2" color="#d26e03" />
                    <span>Zoom to Layer</span>
                </Button>
            </div>
            <div className="flex items-center justify-between space-x-2 w-full">
                <Label htmlFor={`${title}-opacity`} className={opacitySwitchChecked ? 'hidden' : 'mx-auto'}>
                    Change Opacity
                </Label>
                <Slider className={!opacitySwitchChecked ? 'hidden' : 'flex-grow'} defaultValue={[layerOpacity * 100]} onValueChange={(e) => handleOpacityChange(e[0])} />
                <Switch id={`${title}-opacity`} className='ml-auto' checked={opacitySwitchChecked} onCheckedChange={() => setOpacitySwitchChecked(!opacitySwitchChecked)} />
            </div>
            <div className="flex items-center justify-between space-x-2 w-full">
                <Label htmlFor={`${title}-label-visibility`} className='mx-auto'>
                    Turn Labels {labelsVisible ? 'Off' : 'On'} (in progress)
                </Label>
                <Switch id={`${title}-label-visibility`} className='ml-auto' checked={labelsVisible} onCheckedChange={() => setLabelsVisible(!labelsVisible)} />
            </div>
        </div>
    )
};

export default LayerControls;