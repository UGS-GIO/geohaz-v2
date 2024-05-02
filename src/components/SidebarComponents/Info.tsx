import { useState } from 'react'
import {
  CalcitePanel,
  CalciteBlock,
  CalciteButton,
  CalciteModal,
} from '@esri/calcite-components-react'
import { Link } from '../shared'

function Info() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <CalcitePanel>
      <CalciteBlock open heading='Map Details'>
        <p>Check out what&apos;s new in Version 3.1! Basemap blending is turned on
          by default, the footprint layer can now be filtered by scale, and
          there is a Geologic Unit Search tool found under the Map Config
          Controls button.</p>
      </CalciteBlock>

      <CalciteBlock open heading='How To Use This Map'>
        <p>The 3D map responds to keyboard navigation keys (←↑↓→), as well as mouse wheel zooming and drag panning.</p>
      </CalciteBlock>

      <CalciteBlock open heading='Data Sources'>
        <p>The data used in this map is from the following sources: lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </CalciteBlock>
      <div className='text-start my-2 mx-2'>
        <CalciteButton
          alignment='center'
          onClick={() => setModalOpen(!modalOpen)}
        >
          Open Data Disclaimer
        </CalciteButton>
      </div>
      <Link text='Contact Webmaster' href='https://google.com/' />
      <CalciteModal
        open={modalOpen}
        onCalciteModalClose={() => setModalOpen(false)}
      >
        <h3 slot='header'>Data Disclaimer</h3>
        <p slot='content'>
          Although this product represents the work of professional scientists,
          the Utah Department of Natural Resources, Utah Geological Survey,
          makes no warranty, expressed or implied, regarding its suitability for a particular use.
          The Utah Department of Natural Resources, Utah Geological Survey, shall not be liable under any circumstances for
          any direct, indirect, special, incidental, or consequential damages with respect to claims by users of this product.
          The Utah Geological Survey does not guarantee accuracy or completeness of the data.
        </p>
        <p slot='content'>
          The Utah Geologic Hazards Database contains geologic hazard information and data from the Utah Geological Survey (UGS)
          and other sources for the area of interest shown on the interactive map and can be used to identify mapped geologic hazards in an area,
          understand what the hazards are, and some potential ways to mitigate them.
        </p>
        <p slot='content'>
          The database is periodically updated to incorporate the results of new mapping and/or updated mapping due to
          updated data and/or methodology; however, more-detailed fault traces and paleoseismic information may be available
          in recently published geologic maps and reports, so the database should not be considered exhaustive.
        </p>
        <p slot='content'>
          Locations of mapped geologic hazards should always be considered approximate.
        </p>
        <p slot='content'>
          The locational accuracy of  hazards on the maps vary, and spatial error can be substantial when viewing structures
          at high zoom levels that were originally mapped at small scales. Therefore, the locations of hazards on the map should
          be considered approximate. Depending on the ultimate needs of the user, a site-specific investigation by a qualified
          Utah-licensed Professional Geologist may be required to accurately characterize the hazards at a particular site.
        </p>
      </CalciteModal>
    </CalcitePanel>
  )
}

export default Info