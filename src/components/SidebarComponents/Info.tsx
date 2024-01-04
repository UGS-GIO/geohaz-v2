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
      <CalciteBlock
        className='text-start my-1'
        // collapsible
        heading='Map Details'
        description='Check out what’s new in Version 3.1! Basemap blending is turned on
          by default, the footprint layer can now be filtered by scale, and
          there is a Geologic Unit Search tool found under the Map Config
          Controls button.'
      />

      <CalciteBlock
        className='text-start my-1'
        heading='How To Use This Map'
        description='The 3D map responds to keyboard navigation keys (←↑↓→), as well as mouse wheel zooming and drag panning.'
      />

      <CalciteBlock
        className='text-start my-1'
        heading='Data Sources'
        description='The data used in this map is from the following sources: lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
      />
      <div className='text-start mt-3 my-1 mx-2'>
        <CalciteButton
          alignment='center'
          onClick={() => setModalOpen(!modalOpen)}
        >
          Open Data Disclaimer
        </CalciteButton>
      </div>
      <div className='text-start mt-3 my-1 mx-2'>
        <Link text='Contact Webmaster' href='https://google.com/' />
      </div>

      <CalciteModal
        open={modalOpen}
        onCalciteModalClose={() => setModalOpen(false)}
      >
        <h3 slot='header'>Data Disclaimer</h3>
        <p slot='content'>
          lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur.
        </p>
      </CalciteModal>
    </CalcitePanel>
  )
}

export default Info