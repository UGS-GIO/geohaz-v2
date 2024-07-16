import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../@/components/ui/dialog';
import { Button } from '../@/components/ui/button';
import { Link } from '../shared';
import { useNavigation } from '../../contexts/NavigationContext';
import { ReadMore } from '../shared/ReadMore';

function Info() {
  type ModalType = 'references' | 'disclaimer' | 'acknowledgements' | ''
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType | ''>('')
  const { setCurrentActionName } = useNavigation();

  const handleOpenModal = (type: ModalType) => {
    setModalType(type)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setModalType('')
  }

  return (
    <div className="relative h-full flex flex-col">
      <div className="p-4 overflow-y-auto flex-grow max-h-[calc(100vh-120px)]"> {/* Adjust max height as needed */}
        <ReadMore>
          <>
            <div className="mb-4">
              <div className="text-lg font-semibold">Map Details</div>
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

            <div className="mb-4">
              <div className="text-lg font-semibold">Data Sources</div>
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
            <div>
              <Link text='Contact Webmaster' href='https://geology.utah.gov/about-us/contact-webmaster/' />
            </div>

            <div className="flex flex-wrap justify-between my-4 mx-2 gap-4 md:gap-8 mb-8">
              <Button onClick={() => handleOpenModal('references')}>
                References
              </Button>
              <Button onClick={() => handleOpenModal('acknowledgements')}>
                Acknowledgements
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
                        Beukelman, G.S., Erickson, B.E., and Giraud, R.E., 2015, Landslide inventory map of the Sixmile Canyon and North Hollow area, Sanpete County, Utah: Utah Geological Survey Map 273DM, scale 1:24,000, &nbsp;<a href="https://doi.org/10.34191/M-273DM" target='_blank' rel='noopener noreferrer' className="text-blue-600 underline">M-273DM</a>.
                      </p>
                      <p className="mb-2">
                        Castleton, J.J., Elliott, A.H., and McDonald, G.N., 2011, Geologic hazards of the Magna quadrangle, Salt Lake County, Utah: Utah Geological Survey Special Study 137, 73 p., 10 plates, scale 1:24,000, &nbsp;<a href="https://doi.org/10.34191/SS-137" target='_blank' rel='noopener noreferrer' className="text-blue-600 underline">SS-137</a>.
                      </p>
                      <p className="mb-2">
                        Castleton, J.J., Elliott, A.H., and McDonald, G.N., 2014, Geologic hazards of the Copperton quadrangle, Salt Lake County, Utah: Utah Geological Survey Special Study 152, 24 p., 3 plates, scale 1:24,000, &nbsp;<a href="https://doi.org/10.34191/SS-152" target='_blank' rel='noopener noreferrer' className="text-blue-600 underline">SS-152</a>.
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
                        The Utah Geological Survey acknowledges the following individuals and organizations for their contributions to the Utah Geologic Hazards Database and Portal:
                      </p>
                      <ul className="mb-2 list-disc list-inside">
                        <li>John Doe - Utah Geological Survey</li>
                        <li>Jane Smith - Utah Geological Survey</li>
                        <li>Utah Department of Natural Resources</li>
                        <li>U.S. Geological Survey</li>
                      </ul>
                      <Button onClick={handleCloseModal}>Close</Button>
                    </DialogDescription>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </>
        </ReadMore>
      </div>
      <div className="flex flex-wrap justify-between my-4 mx-2 gap-4 md:gap-8 mb-8 border-t border-secondary pt-4"> {/* Add mb-8 or adjust as needed */}
        <Button
          onClick={() => setCurrentActionName('Layers')}
          className="mb-2 md:mb-0"
        >
          Start Exploring
        </Button>
        <Button
          variant="secondary"
          onClick={() => handleOpenModal('disclaimer')}
        >
          Open Data Disclaimer
        </Button>
      </div>
    </div>
  );
}

export default Info;
