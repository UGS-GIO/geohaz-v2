import { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import useLegendPreview from '@/hooks/use-legend-preview';

interface LegendAccordionProps {
    layerId: string;
    url: string;
    triggerBtn: JSX.Element;
    openLegend?: boolean;
}

const LegendAccordion = ({ layerId, url, triggerBtn, openLegend }: LegendAccordionProps) => {
    const [openItem, setOpenItem] = useState<string | undefined>(openLegend ? "legend-accordion" : undefined);
    const { preview, isLoading, error } = useLegendPreview(layerId, url);

    // Update openItem when openLegend prop changes
    useEffect(() => {
        setOpenItem(openLegend ? "legend-accordion" : undefined);
    }, [openLegend]);

    const handleToggle = () => {
        setOpenItem(openItem === "legend-accordion" ? undefined : "legend-accordion");
    };

    return (
        <div>
            <div className="h-0" onClick={handleToggle}>
                {triggerBtn}
            </div>
            <Accordion
                type='single'
                collapsible
                value={openItem}
                onValueChange={setOpenItem}
            >
                <AccordionItem value="legend-accordion">
                    <AccordionContent>
                        <div className='pt-4 px-4'>
                            {isLoading && <div>Loading legend...</div>}
                            {error && <div>Error loading legend: {error.message}</div>}
                            {preview?.map((previewItem, index) => (
                                <div key={index} className="flex items-center space-x-2 py-1">
                                    <span
                                        className="flex items-center justify-center w-8 min-w-8"
                                        dangerouslySetInnerHTML={{ __html: previewItem?.html?.outerHTML || '' }}
                                    />
                                    <span>{previewItem?.label}</span>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export { LegendAccordion };