import { Accordion, AccordionContent, AccordionItem } from '@/components/ui/accordion';

interface LayerDescriptionAccordionProps {
    description: string;
    isOpen: boolean;
}

const LayerDescriptionAccordion = ({ description, isOpen }: LayerDescriptionAccordionProps) => {
    const accordionValue = isOpen ? "layer-description-accordion" : undefined;

    return (
        <Accordion
            type='single'
            collapsible
            value={accordionValue}
        >
            <AccordionItem value="layer-description-accordion">
                <AccordionContent>
                    <div
                        className="custom-tooltip pt-4 px-4"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export { LayerDescriptionAccordion };