import { Button } from '@/components/custom/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';

const QFaultsPopup = ({ graphic }: { graphic: __esri.Graphic }) => {
    return (
        <div className="space-y-1">
            {graphic.attributes.faultzone && (
                <>
                    <span className="font-bold">Fault Zone:</span>&nbsp;
                    <div className="relative inline-block">
                        <TooltipProvider delayDuration={0}>
                            <Tooltip delayDuration={0}>
                                <TooltipTrigger asChild>

                                    <Button variant="ghost" size="sm" className="text-sm px-0 font-medium underline transition-colors hover:text-primary text-muted-foreground"
                                    >
                                        {graphic.attributes.faultzone}
                                        <InfoIcon size={16} className='ml-1' />
                                    </Button>

                                </TooltipTrigger>
                                <TooltipContent side="right" className="bg-secondary text-secondary-foreground p-2 rounded-md max-w-xs text-sm z-tooltip">
                                    {graphic.attributes.summary}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </>
            )}
            {graphic.attributes.faultname && (
                <div>
                    <b>Fault Name: </b>{graphic.attributes.faultname}
                </div>
            )}
            {graphic.attributes.sectionname && (
                <div>
                    <b>Section Name: </b>{graphic.attributes.sectionname}
                </div>
            )}
            {graphic.attributes.strandname && (
                <div>
                    <b>Strand Name: </b>{graphic.attributes.strandname}
                </div>
            )}
            {graphic.attributes.faultnum && (
                <div>
                    <b>Structure Number: </b>{graphic.attributes.faultnum}
                </div>
            )}
            {graphic.attributes.mappedscale && (
                <div>
                    <b>Mapped Scale: </b>{graphic.attributes.mappedscale}
                </div>
            )}
            {graphic.attributes.dipdirection && (
                <div>
                    <b>Dip Direction: </b>{graphic.attributes.dipdirection}
                </div>
            )}
            {graphic.attributes.slipsense && (
                <div>
                    <b>Slip Sense: </b>{graphic.attributes.slipsense}
                </div>
            )}
            {graphic.attributes.sliprate && (
                <div>
                    <b>Slip Rate: </b>{graphic.attributes.sliprate}
                </div>
            )}
            {graphic.attributes.faultclass && (
                <div>
                    <b>Structure Class: </b>{graphic.attributes.faultclass}
                </div>
            )}
            {graphic.attributes.faultage && (
                <div>
                    <b>Structure Age: </b>{graphic.attributes.faultage}
                </div>
            )}
            {graphic.attributes.usgs_link && (
                <div>
                    <b>Detailed Report: </b>
                    <a href={graphic.attributes.usgs_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                        Opens in new tab
                    </a>
                </div>
            )}
        </div>
    );
};

export default QFaultsPopup;
