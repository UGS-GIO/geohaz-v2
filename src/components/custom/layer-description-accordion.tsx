import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';

interface LayerDescriptionAccordionProps {
    description: string;
    triggerBtn: JSX.Element;
}

const LayerDescriptionAccordion = ({ description, triggerBtn }: LayerDescriptionAccordionProps) => {
    const [openItem, setOpenItem] = useState<string | undefined>(undefined);



    const handleToggle = () => {
        setOpenItem(openItem === "layer-description-accordion" ? undefined : "layer-description-accordion");
    };

    return (
        <div>
            <div className="h-0" onClick={handleToggle}>
                {triggerBtn}
            </div>
            <Accordion type='single' collapsible value={openItem} onValueChange={setOpenItem}>
                <AccordionItem value="layer-description-accordion">
                    <AccordionContent>
                        <div className="custom-tooltip pt-4 px-4" dangerouslySetInnerHTML={{ __html: description }} />

                        {/* <div className='flex items-center space-x-4 py-1'>
                            <span>{description}</span>
                        </div> */}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div >
    );
};

export { LayerDescriptionAccordion };
