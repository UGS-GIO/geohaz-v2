import {
  CalciteBlock,
  CalciteLabel,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
  CalciteCheckbox,
  CalcitePanel
} from '@esri/calcite-components-react'
import { Link } from '../shared'

function MapConfigurations() {
  return (
    <CalcitePanel>
      <CalciteBlock open heading="Map Configurations" description="" />
      <CalciteBlock open heading="Location Coordinate Format" description="Decimal Degrees, Degrees, Minutes, Seconds">
        <CalciteSegmentedControl width="full">
          <CalciteSegmentedControlItem value="Decimal Degrees" />
          <CalciteSegmentedControlItem checked value="Degrees, Minutes, Seconds" />
        </CalciteSegmentedControl>
      </CalciteBlock>
      <CalciteBlock className='pt-1' open heading="">
        <CalciteLabel layout='inline' >
          <CalciteCheckbox />
          Toggle Vertical Exaggeration
        </CalciteLabel>
        <CalciteLabel>
          <span className='text-gray-400 ml-6'>
            3D view only
          </span>
        </CalciteLabel>
        <CalciteLabel className='mt-2' layout='inline'>
          <CalciteCheckbox />
          Toggle Basemap Labels
        </CalciteLabel>
      </CalciteBlock>
      <CalciteBlock open heading="">
        <Link text='Reload map in 2D mode' href='https://google.com/' />
        <p className='text-gray-400 ml-2 text-sm'>
          3D view only
        </p>
      </CalciteBlock>
    </CalcitePanel>
  )
}

export default MapConfigurations