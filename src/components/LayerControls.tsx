import { CalciteLink, CalciteSlider, CalciteSwitch, CalciteTooltip } from '@esri/calcite-components-react';
import { CalciteSliderCustomEvent, CalciteSwitchCustomEvent } from "@esri/calcite-components";
import { Info } from '@phosphor-icons/react';
import DOMPurify from 'dompurify';


interface LayerControlsProps {
    layerVisibility: boolean | undefined;
    handleVisibilityToggle: (event: CalciteSwitchCustomEvent<void>) => void | undefined;
    layerOpacity: number;
    handleOpacityChange: (e: CalciteSliderCustomEvent<void>) => void;
    title: string;
    description: string;
}

const LayerControls: React.FC<LayerControlsProps> = ({ layerVisibility, handleVisibilityToggle, layerOpacity, handleOpacityChange, description, title }) => {

    // Sanitize the description
    const cleanDescription = DOMPurify.sanitize(description, { USE_PROFILES: { html: true } });

    return (
        <div className="flex flex-row justify-between items-center mb-4 w-full">
            <div className="flex flex-col items-start mr-4">
                <CalciteSwitch
                    scale='l'
                    className='mt-2'
                    onCalciteSwitchChange={handleVisibilityToggle}
                    checked={layerVisibility}
                />
            </div>

            <div className="flex flex-col items-start flex-grow">
                <CalciteSlider
                    className="mt-2 w-full"
                    onCalciteSliderChange={(e) => handleOpacityChange(e)}
                    value={layerOpacity * 100}
                />
            </div>
            <div className='ml-4 mt-2 items-center'>
                <CalciteLink id={`tooltip-button-${title}`}><Info weight='fill' color={'#9f9f9f'} size={24} /></CalciteLink>
                <CalciteTooltip reference-element={`tooltip-button-${title}`}>
                    <div className='custom-tooltip' dangerouslySetInnerHTML={{ __html: cleanDescription }} />
                </CalciteTooltip>
            </div>
        </div>
    )
};

export default LayerControls;