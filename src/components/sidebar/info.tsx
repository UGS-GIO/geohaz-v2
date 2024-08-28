import { useState, useRef } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, Layers as LayersIcon } from 'lucide-react';
import { Button } from '../custom/button';
import Layers from '@/components/sidebar/layers';
import { acknowledgements, dataDisclaimer, dataSources, dataSourcesShortened, mapDetails, mapDetailsShortened, references } from '@/data/website-info';
import { BackToMenuButton } from '../custom/back-to-menu-button';
import { useSidebar } from '@/hooks/use-sidebar';

function Info() {
  type ModalType = 'references' | 'disclaimer' | 'acknowledgements' | ''
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType | ''>('');
  const { setCurrentContent } = useSidebar();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMapDetailsExpanded, setIsMapDetailsExpanded] = useState(false);
  const [isDataSourcesExpanded, setIsDataSourcesExpanded] = useState(false);

  const toggleMapDetails = () => {
    setIsMapDetailsExpanded(!isMapDetailsExpanded);
  };

  const toggleDataSources = () => {
    setIsDataSourcesExpanded(!isDataSourcesExpanded);
  };

  const handleOpenModal = (type: ModalType) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalType('');
  };

  return (
    <div className="flex flex-col h-full">
      <BackToMenuButton />
      <div className="ml-2 overflow-y-auto flex-grow" ref={contentRef}>
        <div className="mr-2" key="map-details-accordion">
          <Accordion type="multiple">
            <AccordionItem value="map-details-accordion-item-1">
              <AccordionHeader onClick={toggleMapDetails}>
                <AccordionTrigger>
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
          {!isMapDetailsExpanded && (
            <div>
              {mapDetailsShortened}
            </div>
          )}
        </div>

        <div className="mr-2" key="data-sources-accordion">
          <Accordion type="multiple">
            <AccordionItem value="data-sources-accordion-item-1">
              <AccordionHeader onClick={toggleDataSources}>
                <AccordionTrigger>
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
          {!isDataSourcesExpanded && (
            <div>
              {dataSourcesShortened}
            </div>
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

      <div className="flex justify-center space-x-4 border-t border-secondary">
        <div className='pt-6'>
          <Button
            onClick={() => setCurrentContent({
              title: 'Layers',
              label: '',
              icon: <LayersIcon />,
              componentPath: '/src/components/sidebar/layers',
              component: Layers
            })}
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