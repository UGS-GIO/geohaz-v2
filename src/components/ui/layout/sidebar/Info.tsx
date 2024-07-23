import React, { useState, useRef } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionHeader, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useNavigation } from '@/contexts/NavigationContext';
import { ExternalLink } from 'lucide-react';


function Info() {
  type ModalType = 'references' | 'disclaimer' | 'acknowledgements' | ''
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType | ''>('')
  const { setCurrentActionName } = useNavigation();
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

  return (
    <div className="relative h-full flex flex-col scroll-smooth">
      <div className={`p-4 overflow-y-auto flex-grow`} ref={contentRef}>
        <div className='mr-2 my-2' key={`map-details-accordion`}>
          <Accordion type="single" collapsible>
            <AccordionItem value="map-details-accordion-item">
              <AccordionHeader >
                <AccordionTrigger onChange={() => setExpandedItem(expandedItem === 'map-details-accordion-item-1' ? null : 'map-details-accordion-item-1')}>
                  <div className="flex flex-col mx-2 items-start">
                    <h3 className="font-medium text-left text-lg">Map Details</h3>

                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <div className='mx-2'>
                  <p className="mb-2">
                    This Portal is a compilation of data from the Utah Geologic Hazards Database, and contains post-2008 UGS geologic hazard map data and data from other sources for parts of Utah. These data address earthquake, flood, landslide, and problem soil and rock hazards. This web mapping application is intended to provide planners, local government officials, property owners, developers, engineers, geologists, design professionals, and the public with information on the type, location, and relative susceptibility of geologic hazards that may impact existing and future infrastructure and development. The data also provide information that may be used for emergency response and recovery planning and community risk assessment for existing development and infrastructure.
                  </p>
                  <p className="mb-2">
                    Areas with comprehensive geologic hazard map data are shown with red polygons. Statewide data for hazardous (Quaternary age) faults, and a legacy compilation of landslides are also available. Limited, comprehensive geologic hazard map data are available for the remaining hazards listed in the Legend. Hazard map layers can be enabled in the Legend by clicking on the eye symbol. Map layer units describing the hazard relative susceptibility are also shown in the Legend. The absence of data does not imply that no geologic hazard or hazards exist. Additional geologic hazard mapping is on-going and will be added to the database as it is finalized.
                  </p>
                  <p className="mb-2">
                    Database Updated May 2020
                  </p>
                  <p className="mb-2 font-bold">
                    Related Information
                  </p>
                  <p className="mb-2">
                    For more information, see <a href="https://geology.utah.gov/hazards/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://geology.utah.gov/hazards/</a> or contact the UGS.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
          {expandedItem !== 'map-details-accordion-item-1' && (
            <p className='text-left text-sm mx-2 font-normal'>
              This Portal is a compilation of data from the Utah Geologic Hazards Database, and contains post-2008 UGS geologic hazard map data and data from other sources for parts of Utah...
            </p>
          )}
        </div>

        <div className='mr-2 my-2 ' key={`data-sources-accordion`}>
          <Accordion type="single" collapsible>
            <AccordionItem value="data-sources-accordion-item-1">
              <AccordionHeader onClick={() => setExpandedItem(expandedItem === 'data-sources-accordion-item-1' ? null : 'data-sources-accordion-item-1')}>
                <AccordionTrigger >
                  <div className="flex flex-col mx-2 items-start">
                    <h3 className="font-medium text-left text-lg">Data Sources</h3>
                  </div>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <div className='mx-2'>
                  <p className="mb-2">
                    The database for the Utah Geologic Hazards Portal contains geologic hazard information and data from the Utah Geological Survey (UGS) and other sources. The database is periodically updated to incorporate the results of new mapping. Detailed geologic hazard mapping is available for limited areas and for specific hazards in Utah and additional mapping is ongoing.
                  </p>
                  <p className="mb-2">
                    The data exists as an attributed geographic information system (GIS) feature class available for download:
                    &nbsp;<a href="https://geology.utah.gov/docs/zip/Geologic_Hazards_Geodatabase.gdb.zip" className="text-blue-600 underline">GIS Data</a>
                  </p>
                  <p className="mb-2">
                    Additionally, users can access full data reports for individual hazards by clicking on the report link in the pop-up window. These reports are not a substitute for a site-specific geologic hazards and geotechnical engineering investigation by a qualified, Utah-licensed consultant. These investigations provide valuable information on the site geologic conditions that may affect or be affected by development, as well as the type and relative susceptibility of geologic hazards at a site and recommend solutions to mitigate the effects and costs of the hazards, both at the time of construction and over the life of the development. See your local city or county building department for details on these investigations and &nbsp;<a href='https://ugspub.nr.utah.gov/publications/circular/c-122.pdf' className="text-blue-600 underline">UGS Circular 122</a> for more information.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {expandedItem !== 'data-sources-accordion-item-1' && (
            <p className='text-left text-sm mx-2 font-normal'>
              The database for the Utah Geologic Hazards Portal contains geologic hazard information and data from the Utah Geological Survey (UGS) and other sources....
            </p>
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
                  <p className="mb-2">
                    Although this product represents the work of professional scientists, the Utah Department of Natural Resources, Utah Geological Survey, makes no warranty, expressed or implied, regarding its suitability for a particular use. The Utah Department of Natural Resources, Utah Geological Survey, shall not be liable under any circumstances for any direct, indirect, special, incidental, or consequential damages with respect to claims by users of this product. The Utah Geological Survey does not guarantee accuracy or completeness of the data.
                  </p>
                  <p className="mb-2">
                    The Utah Geologic Hazards Database contains geologic hazard information and data from the Utah Geological Survey (UGS) and other sources for the area of interest shown on the interactive map and can be used to identify mapped geologic hazards in an area, understand what the hazards are, and some potential ways to mitigate them.
                  </p>
                  <p className="mb-2">
                    The database is periodically updated to incorporate the results of new mapping and/or updated mapping due to updated data and/or methodology; however, more-detailed fault traces and paleoseismic information may be available in recently published geologic maps and reports, so the database should not be considered exhaustive.
                  </p>
                  <p className="mb-2">
                    Locations of mapped geologic hazards should always be considered approximate.
                  </p>
                  <p className="mb-2">
                    The locational accuracy of hazards on the maps vary, and spatial error can be substantial when viewing structures at high zoom levels that were originally mapped at small scales. Therefore, the locations of hazards on the map should be considered approximate. Depending on the ultimate needs of the user, a site-specific investigation by a qualified Utah-licensed Professional Geologist may be required to accurately characterize the hazards at a particular site.
                  </p>
                  <Button onClick={handleCloseModal}>Close</Button>
                </DialogDescription>
              </>
            )}
            {modalType === 'references' && (
              <>
                <DialogHeader>
                  <DialogTitle>References</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  <p className="mb-2">
                    Beukelman, G.S., Erickson, B.E., and Giraud, R.E., 2010, Geologic hazards of the Fillmore quadrangle, Millard County, Utah: Utah Geological Survey Special Study 131, 31 p., 2 plates, scale 1:24,000, CD.
                  </p>
                  <p className="mb-2">
                    Christensen, E.J., and Clark, D.L., 2009, Geologic hazards and adverse construction conditions, Wasatch Range frontal fault zone, Weber and Davis Counties, Utah: Utah Geological Survey Open-File Report 547, 75 p., CD.
                  </p>
                  <p className="mb-2">
                    Clark, D.L., and Giraud, R.E., 2007, Geologic hazards of the Ogden 7.5′ quadrangle, Weber and Davis Counties, Utah: Utah Geological Survey Special Study 122, 103 p., 1 plate, scale 1:24,000, CD.
                  </p>
                  <p className="mb-2">
                    Giraud, R.E., 2005, Reconnaissance of geologic hazards in the South Weber and Kaysville quadrangles, Davis and Weber Counties, Utah: Utah Geological Survey Special Study 115, 53 p., 1 plate, scale 1:24,000, CD.
                  </p>
                  <p className="mb-2">
                    Giraud, R.E., and Shaw, L.M., 2007, Geologic hazards and adverse construction conditions, western Mapleton, Utah County, Utah: Utah Geological Survey Open-File Report 512, 26 p., 1 plate, scale 1:14,000.
                  </p>
                  <Button onClick={handleCloseModal}>Close</Button>
                </DialogDescription>
              </>
            )}
            {modalType === 'acknowledgements' && (
              <>
                <DialogHeader>
                  <DialogTitle>Acknowledgements</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  <p className="mb-2">
                    This web application was created in collaboration with the Utah Geological Survey (UGS) and Utah Automated Geographic Reference Center (AGRC). AGRC provided GIS data and web services support. UGS provided geologic hazard mapping and analysis. Additional data and support were provided by the Utah Division of Emergency Management, FEMA, and local governments.
                  </p>
                  <Button onClick={handleCloseModal}>Close</Button>
                </DialogDescription>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <div className="flex flex-wrap justify-center mx-2 gap-4 md:gap-4 border-t border-secondary py-4">
          <Button
            onClick={() => setCurrentActionName('Layers')}
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
    </div >
  );
}

export default Info;
