import { CalciteSlider, CalciteSwitch } from '@esri/calcite-components-react';
import { CalciteSliderCustomEvent, CalciteSwitchCustomEvent } from "@esri/calcite-components";

interface LayerControlsProps {
    layerVisibility: boolean | undefined;
    handleVisibilityToggle: (event: CalciteSwitchCustomEvent<void>) => void | undefined;
    layerOpacity: number;
    handleOpacityChange: (e: CalciteSliderCustomEvent<void>) => void;
}

const LayerControls: React.FC<LayerControlsProps> = ({ layerVisibility, handleVisibilityToggle, layerOpacity, handleOpacityChange }) => (
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
    </div>
);

export default LayerControls;