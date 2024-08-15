import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';
import useLegendPreview from '@/hooks/use-legend-preview';

interface LegendAccordionProps {
    layerId: string;
    url: string;
    triggerBtn: JSX.Element;
}

const LegendAccordion = ({ layerId, url, triggerBtn }: LegendAccordionProps) => {
    const [openItem, setOpenItem] = useState<string | undefined>(undefined);
    const { preview, isLoading, error } = useLegendPreview(layerId, url);


    const handleToggle = () => {
        setOpenItem(openItem === "legend-accordion" ? undefined : "legend-accordion");
    };

    return (
        <div>
            <div className="h-0" onClick={handleToggle}>
                {triggerBtn}
            </div>
            <Accordion type='single' collapsible value={openItem} onValueChange={setOpenItem}>
                <AccordionItem value="legend-accordion">
                    <AccordionContent>
                        <>
                            {isLoading && <div>Loading legend...</div>}
                            {error && <div>Error loading legend: {error.message}</div>}
                            {preview?.map((previewItem, index) => (
                                <div key={index} className='flex items-center space-x-4 py-1'>
                                    <span className='flex items-center' dangerouslySetInnerHTML={{ __html: previewItem.html.outerHTML || '' }} />
                                    <span>{previewItem.label}</span>
                                </div>
                            ))}
                        </>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div >
    );
};

export { LegendAccordion };
