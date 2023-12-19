import {
  CalciteBlock,
  CalciteButton,
  CalciteLink,
  CalciteModal,
  CalcitePanel,
} from '@esri/calcite-components-react'
import React from 'react'

const MapConfigurationsSidebar: React.FC = () => {
  return (
    <div>
      {/* <CalcitePanel heading='Map Configurations'> */}
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
          onClick={() => console.log('nkl,agnakl')}
        >
          Open Data Disclaimer
        </CalciteButton>
      </div>

      <div className='text-start mt-3 my-1 mx-2 '>
        <CalciteLink href='https://google.com/' target='_blank'>
          Google
        </CalciteLink>
      </div>
      {/* </CalcitePanel> */}
    </div>
  )
}

export default MapConfigurationsSidebar
