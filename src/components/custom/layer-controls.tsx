import { Info, Shrink, TableOfContents } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/custom/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LegendAccordion } from '@/components/custom/legend-accordion';
import { useRef, useState } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { LayerDescriptionAccordion } from '@/components/custom/layer-description-accordion';

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
    const cleanDescription = DOMPurify.sanitize(description, { USE_PROFILES: { html: true } });
    const legendTriggerButtonRef = useRef<HTMLButtonElement>(null);
    const infoTriggerButtonRef = useRef<HTMLButtonElement>(null);
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [infoPressed, setInfoPressed] = useState(false);
    const [legendPressed, setLegendPressed] = useState(false);

    const handleToggleTriggers = (
        type: 'legend' | 'info',
        ref: React.RefObject<HTMLButtonElement>,
        turnOffRef: React.RefObject<HTMLButtonElement>
    ) => {
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

                    <div className="flex justify-around items-stretch w-full gap-x-4">
                        <Toggle
                            ref={infoTriggerButtonRef}
                            aria-label="Toggle info"
                            size="stacked"
                            className="flex flex-col items-center p-2 flex-1"
                            onClick={() => handleToggleTriggers('info', infoTriggerButtonRef, legendTriggerButtonRef)}
                            pressed={infoPressed}
                            style={{ alignItems: 'center', flexGrow: 1 }}
                        >
                            <Info className="h-5 w-5" />
                            <span className='mt-1 sm:ml-2 sm:mt-0'>Info</span>
                        </Toggle>

                        <Button
                            variant="ghost"
                            size="stacked"
                            className="flex flex-col items-center p-2 flex-1"
                            onClick={handleZoomToLayer}
                            style={{ alignItems: 'center', flexGrow: 1 }}
                        >
                            <Shrink className="h-5 w-5" />
                            <span className='mt-1 sm:ml-2 sm:mt-0'>Zoom to</span>
                        </Button>

                        <Toggle
                            ref={legendTriggerButtonRef}
                            aria-label="Toggle legend"
                            size="stacked"
                            className="flex flex-col items-center p-2 flex-1"
                            onClick={() => handleToggleTriggers('legend', legendTriggerButtonRef, infoTriggerButtonRef)}
                            pressed={legendPressed}
                            style={{ alignItems: 'center', flexGrow: 1 }}
                        >
                            <TableOfContents className="h-5 w-5" />
                            <span className='mt-1 sm:ml-2 sm:mt-0'>Legend</span>
                        </Toggle>
                    </div>

                    {/* TODO: Implement label visibility */}
                    {/* <div className="flex items-center justify-between gap-x-2 w-full">
                        <Label htmlFor={`${title}-label-visibility`} className="mx-auto">
                            Turn Labels {labelsVisible ? 'Off' : 'On'} (in progress)
                        </Label>
                        <Toggle
                            size="stacked"
                            aria-label="Toggle labels visibility"
                            pressed={labelsVisible}
                            onCheckedChange={() => setLabelsVisible(!labelsVisible)}
                        />
                    </div> */}
                </div>
            </div>

            <div>
                <LayerDescriptionAccordion
                    description={cleanDescription}
                    triggerBtn={
                        <button ref={infoTriggerButtonRef} className="hidden">
                            Open Dialog
                        </button>
                    }
                />
                <LegendAccordion
                    layerId={layerId}
                    url={url}
                    triggerBtn={
                        <button ref={legendTriggerButtonRef} className="hidden">
                            Open Dialog
                        </button>
                    }
                />
            </div>
        </>
    );
};

export default LayerControls;
