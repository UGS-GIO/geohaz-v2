import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import useLegendPreview from '@/hooks/use-legend-preview';
import { ChevronDownIcon } from 'lucide-react';

interface LegendAcordionProps {
    layerId: string;
    url: string;
}

const LegendAccordion = ({ layerId, url }: LegendAcordionProps) => {
    const { preview, isLoading, error } = useLegendPreview(layerId, url);

    return (
        <Accordion type='single' collapsible className='mx-8'>
            <AccordionItem value="item-2">
                <AccordionTrigger>
                    Legend <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200 mr-2" />
                </AccordionTrigger>
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
    )
}

export { LegendAccordion };