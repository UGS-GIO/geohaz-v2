import { Info, Shrink, TableOfContents } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/custom/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LegendAccordion } from '@/components/custom/legend-accordion';
import { useRef, useState } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { LayerDescriptionAccordion } from './layer-description-accordion';

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
    const legendTriggerButtonRef = useRef<HTMLButtonElement>(null)
    const infoTriggerButtonRef = useRef<HTMLButtonElement>(null)
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [infoPressed, setInfoPressed] = useState(false);
    const [legendPressed, setLegendPressed] = useState(false);

    const handleToggleTriggers = (type: 'legend' | 'info', ref: React.RefObject<HTMLButtonElement>, turnOffRef: React.RefObject<HTMLButtonElement>) => {
        // Determine if the clicked type is already open
        const isAlreadyOpen = openAccordion === type;

        // Update accordion state
        if (isAlreadyOpen) {
            setOpenAccordion(null);
        } else {
            setOpenAccordion(type);
        }

        // Update toggle states
        if (type === 'info') {
            setInfoPressed(!isAlreadyOpen);
            setLegendPressed(false); // Ensure legend is not active
            if (ref.current) ref.current.click();
            if (turnOffRef.current && openAccordion === 'legend') turnOffRef.current.click();
        } else if (type === 'legend') {
            setLegendPressed(!isAlreadyOpen);
            setInfoPressed(false); // Ensure info is not active
            if (ref.current) ref.current.click();
            if (turnOffRef.current && openAccordion === 'info') turnOffRef.current.click();
        }
    };


    return (
        <>
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
                            <Toggle
                                ref={infoTriggerButtonRef}
                                aria-label="Toggle info"
                                className="flex items-center"
                                onClick={() => handleToggleTriggers('info', infoTriggerButtonRef, legendTriggerButtonRef)}
                                pressed={infoPressed}
                            >
                                <Info className="h-5 w-5 mr-2" />
                                <span>Info</span>
                            </Toggle>

                            <Button variant="ghost" className="flex items-center" onClick={handleZoomToLayer}>
                                <Shrink className="h-5 w-5 mr-2" />
                                <span>Zoom to</span>
                            </Button>
                            <Toggle
                                ref={legendTriggerButtonRef}
                                aria-label="Toggle legend"
                                className="flex items-center"
                                onClick={() => handleToggleTriggers('legend', legendTriggerButtonRef, infoTriggerButtonRef)}
                                pressed={legendPressed}
                            >
                                <TableOfContents className="h-5 w-5 mr-2" />
                                <span>Legend</span>
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
            </div >

            <div>
                <LayerDescriptionAccordion description={cleanDescription} triggerBtn={<button ref={infoTriggerButtonRef} className='hidden'>Open Dialog</button>} />
                <LegendAccordion
                    layerId={layerId}
                    url={url}
                    triggerBtn={<button ref={legendTriggerButtonRef} className='hidden'>Open Dialog</button>} // Hidden button as trigger
                />
            </div>
        </>
    );
};

export default LayerControls;

