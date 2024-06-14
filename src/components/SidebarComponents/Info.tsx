import { useState } from 'react'
import {
  CalcitePanel,
  CalciteBlock,
  CalciteButton,
  CalciteModal,
  CalciteLink,
} from '@esri/calcite-components-react'
import { Link } from '../shared'
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

  return (
    <CalcitePanel>
      <CalciteBlock open heading='Map Details'>
        <ReadMore
          id="example"
          paragraphs={[
            {
              text: "This Portal is a compilation of data from the Utah Geologic Hazards Database, and contains post-2008 UGS geologic hazard map data and data from other sources for parts of Utah. These data address earthquake, flood, landslide, and problem soil and rock hazards. This web mapping application is intended to provide planners, local government officials, property owners, developers, engineers, geologists, design professionals, and the public with information on the type, location, and relative susceptibility of geologic hazards that may impact existing and future infrastructure and development. The data also provide information that may be used for emergency response and recovery planning and community risk assessment for existing development and infrastructure.", bold: false
            },

            { text: "Areas with comprehensive geologic hazard map data are shown with red polygons. Statewide data for hazardous (Quaternary age) faults, and a legacy compilation of landslides are also available. Limited, comprehensive geologic hazard map data are available for the remaining hazards listed in the Legend. Hazard map layers can be enabled in the Legend by clicking on the eye symbol. Map layer units describing the hazard relative susceptibility are also shown in the Legend. The absence of data does not imply that no geologic hazard or hazards exist. Additional geologic hazard mapping is on-going and will be added to the database as it is finalized.", bold: false },
            { text: "Database Updated May 2020", bold: true },
            { text: "Related Information", bold: true },
            { text: "For more information, see https://geology.utah.gov/hazards/ or contact the UGS.", bold: false },
          ]}
          amountOfWords={36}
        />
      </CalciteBlock>

      <CalciteBlock open heading='Data Sources'>
        <p className="mb-2">
          The database for the Utah Geologic Hazards Portal contains geologic hazard information and data from the Utah
          Geological Survey (UGS) and other sources. The database is periodically updated to incorporate the results of new mapping.
          Detailed geologic hazard mapping is available for limited areas and for specific hazards in Utah and additional mapping is ongoing.
        </p>
        <p className="mb-2">
          The data exists as an attributed geographic information system (GIS) feature class available for download:
          &nbsp;<CalciteLink href="https://geology.utah.gov/docs/zip/Geologic_Hazards_Geodatabase.gdb.zip">GIS Data</CalciteLink>
        </p>
        <p className="mb-2">
          Additionally, users can access full data reports for individual hazards by clicking on the report link in the pop-up window.
          These reports are not a substitute for a site-specific geologic hazards and geotechnical engineering investigation by a qualified, Utah-licensed consultant.
          These investigations provide valuable information on the site geologic conditions that may affect or be affected by development,
          as well as the type and relative susceptibility of geologic hazards at a site and recommend solutions to mitigate the effects and costs of the hazards,
          both at the time of construction and over the life of the development. See your local city or county building department for details on these
          investigations and  &nbsp;<CalciteLink href='https://ugspub.nr.utah.gov/publications/circular/c-122.pdf'>UGS Circular 122</CalciteLink> for more information.
        </p>
      </CalciteBlock>
      <div className='flex justify-between my-2 mx-2'>
        <CalciteButton
          alignment='center'
          onClick={() => setCurrentActionName('Layers')}
        >
          Start Exploring
        </CalciteButton>
        <CalciteButton
          id='data-disclaimer-button'
          alignment='center'
          onClick={() => handleOpenModal('disclaimer')}
        >
          Open Data Disclaimer
        </CalciteButton>
      </div>
      <div className='flex justify-between my-2 mx-2'>
        <CalciteButton
          alignment='center'
          onClick={() => handleOpenModal('references')}
        >
          References
        </CalciteButton>
        <CalciteButton
          alignment='center'
          onClick={() => handleOpenModal('acknowledgements')}
        >
          Acknowledgements
        </CalciteButton>
      </div>

      <Link text='Contact Webmaster' href='https://geology.utah.gov/about-us/contact-webmaster/' />

      <CalciteModal
        open={modalOpen}
        onCalciteModalClose={() => setModalOpen(false)}
      >

        {modalType === 'disclaimer' && (
          <>
            <h3 slot='header'>Data Disclaimer</h3>
            <div slot='content'>
              <p className="mb-2">
                Although this product represents the work of professional scientists,
                the Utah Department of Natural Resources, Utah Geological Survey,
                makes no warranty, expressed or implied, regarding its suitability for a particular use.
                The Utah Department of Natural Resources, Utah Geological Survey, shall not be liable under any circumstances for
                any direct, indirect, special, incidental, or consequential damages with respect to claims by users of this product.
                The Utah Geological Survey does not guarantee accuracy or completeness of the data.
              </p>
              <p className="mb-2">
                The Utah Geologic Hazards Database contains geologic hazard information and data from the Utah Geological Survey (UGS)
                and other sources for the area of interest shown on the interactive map and can be used to identify mapped geologic hazards in an area,
                understand what the hazards are, and some potential ways to mitigate them.
              </p>
              <p className="mb-2">
                The database is periodically updated to incorporate the results of new mapping and/or updated mapping due to
                updated data and/or methodology; however, more-detailed fault traces and paleoseismic information may be available
                in recently published geologic maps and reports, so the database should not be considered exhaustive.
              </p>
              <p className="mb-2">
                Locations of mapped geologic hazards should always be considered approximate.
              </p>
              <p className="mb-2">
                The locational accuracy of hazards on the maps vary, and spatial error can be substantial when viewing structures
                at high zoom levels that were originally mapped at small scales. Therefore, the locations of hazards on the map should
                be considered approximate. Depending on the ultimate needs of the user, a site-specific investigation by a qualified
                Utah-licensed Professional Geologist may be required to accurately characterize the hazards at a particular site.
              </p>
              <CalciteButton alignment='end' slot='primary' onClick={() => setModalOpen(false)}>Close</CalciteButton>
            </div>
          </>
        )}
        {modalType === 'references' && (
          <>
            <h3 slot='header'>References</h3>
            <div slot='content'>
              <p className="mb-2">
                Beukelman, G.S., Erickson, B.E., and Giraud, R.E., 2015, Landslide inventory map of the Sixmile Canyon and
                North Hollow area, Sanpete County, Utah: Utah Geological Survey Map 273DM, scale 1:24,000,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/M-273DM" target='_blank' rel='noopener noreferrer'>M-273DM</CalciteLink>.
              </p>
              <p className="mb-2">
                Castleton, J.J., Elliott, A.H., and McDonald, G.N., 2011, Geologic hazards of the Magna quadrangle,
                Salt Lake County, Utah: Utah Geological Survey Special Study 137, 73 p., 10 plates, scale 1:24,000,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/SS-137" target='_blank' rel='noopener noreferrer'>SS-137</CalciteLink>.
              </p>
              <p className="mb-2">
                Castleton, J.J., Elliott, A.H., and McDonald, G.N., 2014, Geologic hazards of the Copperton quadrangle,
                Salt Lake County, Utah: Utah Geological Survey Special Study 152, 24 p., 10 plates, scale 1:24,000,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/SS-152" target='_blank' rel='noopener noreferrer'>SS-152</CalciteLink>.
              </p>
              <p className="mb-2">
                Castleton, J.J., Erickson, B.A., and Kleber, E.J., 2018, Radon hazard potential of Davis County, Utah:
                Utah Geological Survey Open-file Report 655, 1 plate, scale 1:24,000,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/OFR-655" target='_blank' rel='noopener noreferrer'>OFR-655</CalciteLink>.
              </p>
              <p className="mb-2">
                Castleton, J. J., Erickson, B. A., and Kleber, E. J., 2018, Geologic hazards of the Moab quadrangle,
                Grand County, Utah: Utah Geological Survey Special Study 162, 33 p., 13 plates, scale 1:24,000,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/SS-162" target='_blank' rel='noopener noreferrer'>SS-162</CalciteLink>.
              </p>
              <p className="mb-2">
                Castleton, J.J., Erickson, B.A., McDonald, G.N., and Beukelman, G.S., 2018, Geologic Hazards of the Tickville Spring quadrangle,
                Salt Lake and Utah Counties, Utah: Utah Geological Survey Special Study 163, 25 p., 10 pl., scale 1:24,000,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/SS-163" target='_blank' rel='noopener noreferrer'>SS-163</CalciteLink>.
              </p>
              <p className="mb-2">
                Giraud, R.E., and McDonald, G.N., 2017, Landslide inventory map of the Ferron Creek area, Sanpete and Emery Counties, Utah:
                Utah Geological Survey Special Study 161, scale 1:24,000,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/SS-161" target='_blank' rel='noopener noreferrer'>SS-161</CalciteLink>.
              </p>
              <p className="mb-2">
                Knudsen, T.R., and Lund, W.R., 2014, Geologic hazards of the State Route 9 Corridor, La Verkin City to Town of Springdale,
                Washington County, Utah: Utah Geological Survey Special Study 148, 13 p., 9 plates, GIS data,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/SS-148" target='_blank' rel='noopener noreferrer'>SS-148</CalciteLink>.
              </p>
              <p className="mb-2">
                Lund, W.R., Knudsen, T.R., Shaw, L.M., 2008, Geologic hazards and adverse construction conditions,
                St. George metropolitan area, Washington County, Utah, Utah Geological Survey Special Study 127, 105 p,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/SS-127" target='_blank' rel='noopener noreferrer'>SS-127</CalciteLink>.
              </p>
              <p className="mb-2">
                Lund, W.R., Knudsen, T.R., and Sharrow, D.L., 2010, Geologic hazards of the Zion National Park geologic-hazard study area,
                Washington and Kane Counties, Utah: Utah Geological Survey Special Study 133, 95 p., 9 plates, GIS data,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/SS-133" target='_blank' rel='noopener noreferrer'>SS-133</CalciteLink>.
              </p>
              <p className="mb-2">
                McDonald, G.N., and Giraud, R.E., 2011, Landslide inventory map of Twelvemile Canyon, Sanpete County, Utah:
                Utah Geological Survey Map 247DM, scale 1:24,000,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/M-247DM" target='_blank' rel='noopener noreferrer'>M-247DM</CalciteLink>.
              </p>
              <p className="mb-2">
                McDonald, G.N., and Giraud, R.E., 2014, Landslide inventory map of the 2012 Seeley fire area, Carbon and Emery Counties, Utah:
                Utah Geological Survey Special Study 153, scale 1:24,000,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/SS-153" target='_blank' rel='noopener noreferrer'>SS-153</CalciteLink>.
              </p>
              <p className="mb-2">
                McDonald, G.N., and Giraud, R.E., 2015, Landslide inventory map for the Upper Muddy Creek area, Sanpete and Sevier Counties, Utah:
                Utah Geological Survey Special Study 155, scale 1:24,000,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/SS-155" target='_blank' rel='noopener noreferrer'>SS-155</CalciteLink>.
              </p>
              <p className="mb-2">
                McDonald, G.N., Kleber, E.J., Hiscock, A.I., Bennett, S.E.K., Bowman, S.D., 2020, Fault trace mapping and surface-fault-rupture
                special study zone, Utah and Idaho: Utah Geological Survey Report of Investigation 280, 23 p.,
                &nbsp;<CalciteLink href="https://doi.org/10.34191/RI-280" target='_blank' rel='noopener noreferrer'>RI-280</CalciteLink>.
              </p>
            </div>
          </>
        )}
        {modalType === 'acknowledgements' && (
          <>
            <h3 slot='header'>Background &amp; Acknowledgements</h3>
            <div slot='content'>
              <p className="mb-2">
                In 2008, the Utah Geological Survey Geologic Hazards Mapping Initiative was created with funding from the Utah Legislature
                to map geologic hazards in areas of existing and future development. This mapping is focused on identifying hazards for an entire 7.5′ quadrangle
                at 1:24,000 scale, instead of single hazard maps of large regional areas. The geologic-hazard maps address hazards associated with earthquakes, landslides,
                flooding, debris flows, indoor radon, shallow groundwater, rockfall, and problem soils and rocks. The initiative will provide planners, local officials,
                property owners, developers, engineers, geologists, design professionals, and the interested public with information on the type and location of critical
                geologic hazards that may impact existing and future development.
              </p>
              <p className="mb-2">
                Hazard mapping is a multidisciplinary cooperative collaboration. We thank Scott Davis, Nathan Kota, Steve Gourley, and Jake Adams
                with the Utah Automated Geographic Reference Center (AGRC) for assistance and programming in the creation of the online web mapping application.
                Steve Bowman and Jessica Castleton (UGS) helped develop the schema and reporting format used in the current database. Marshall Robinson,
                Jay Hill, Martha Jensen (UGS) and Corey Unger (former UGS) did web design and programming for the interactive map. UGS GIS analyst Gordon
                Douglass contributed substantially at various stages of development of the database. We thank the hazard mappers in the UGS Geologic
                Hazards Program for providing high quality hazard maps.
              </p>
            </div>
          </>
        )}

      </CalciteModal>
    </CalcitePanel>
  )
}

export default Info
