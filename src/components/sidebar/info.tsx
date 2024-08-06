import { useState, useRef } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, Layers as LayersIcon } from 'lucide-react';
import { Button } from '../custom/button';
import { useSidebar } from '@/hooks/use-sidebar';
import Layers from '@/components/sidebar/layers';
import { acknowledgements, dataDisclaimer, dataSources, dataSourcesShortened, mapDetails, mapDetailsShortened, references } from '@/data/website-info';

function Info() {
  type ModalType = 'references' | 'disclaimer' | 'acknowledgements' | ''
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType | ''>('')
  const { setCurrentContent } = useSidebar();
  const contentRef = useRef<HTMLDivElement>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const handleOpenModal = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalType('');
  };

  const handleAccordionToggle = (id: string) => {
    setExpandedItem(expandedItem === id ? null : id);
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-grow ml-2 overflow-y-auto"
        ref={contentRef}
      >
        <div className='mr-2' key={`map-details-accordion`}>
          <Accordion type="single" collapsible>
            <AccordionItem value="map-details-accordion-item-1">
              <AccordionHeader onClick={() => handleAccordionToggle('map-details-accordion-item-1')} >
                <AccordionTrigger >
                  <div className="flex flex-col mx-2 items-start">
                    <h3 className="font-large text-left text-lg">Map Details</h3>

                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                {mapDetails}
              </AccordionContent>
            </AccordionItem>

          </Accordion>
          {expandedItem !== 'map-details-accordion-item-1' && (
            <>
              {mapDetailsShortened}
            </>
          )}
        </div>

        <div className='mr-2 my-2 ' key={`data-sources-accordion`}>
          <Accordion type="single" collapsible>
            <AccordionItem value="data-sources-accordion-item-1">
              <AccordionHeader onClick={() => handleAccordionToggle('data-sources-accordion-item-1')} >
                <AccordionTrigger >
                  <div className="flex flex-col mx-2 items-start">
                    <h3 className="font-large text-left text-lg">Data Sources</h3>
                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                {dataSources}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {expandedItem !== 'data-sources-accordion-item-1' && (
            <>
              {dataSourcesShortened}
            </>

          )}
        </div>

        <div className="flex flex-wrap justify-center mx-2">
          <Button variant={'link'} onClick={() => handleOpenModal('references')}>
            References
          </Button>
          <Button variant={'link'} onClick={() => handleOpenModal('acknowledgements')}>
            Acknowledgements
          </Button>
          <Button variant={'link'} onClick={() => window.open('https://geology.utah.gov/about-us/contact-webmaster/', '_blank')}>
            Contact Webmaster&nbsp;<ExternalLink size={16} />
          </Button>
        </div>

        <Dialog open={modalOpen} onOpenChange={handleCloseModal}>
          <DialogTrigger asChild>
            <div className="hidden"></div>
          </DialogTrigger>
          <DialogContent>
            {modalType === 'disclaimer' && (
              <>
                <DialogHeader>
                  <DialogTitle>Data Disclaimer</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  {dataDisclaimer}
                </DialogDescription>
              </>
            )}
            {modalType === 'references' && (
              <>
                <DialogHeader>
                  <DialogTitle>References</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  {references}
                </DialogDescription>
              </>
            )}
            {modalType === 'acknowledgements' && (
              <>
                <DialogHeader>
                  <DialogTitle>Acknowledgements</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  {acknowledgements}
                </DialogDescription>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-none flex justify-center space-x-4 m-4 border-t border-secondary">
        <div className='p-4'>
          <Button
            onClick={() => setCurrentContent({
              title: 'Layers',
              label: '',
              icon: <LayersIcon />,
              componentPath: '/src/components/sidebar/layers',
              component: Layers
            })}
            className="mb-2 md:mb-0"
          >
            Start Exploring
          </Button>
          <Button
            className='text-foreground'
            variant="link"
            onClick={() => handleOpenModal('disclaimer')}
          >
            Open Data Disclaimer
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Info;