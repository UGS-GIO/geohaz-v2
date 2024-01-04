import {
  CalciteBlock,
  CalciteIcon,
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
      <CalciteBlock open heading="Layer effects" description="Adjust blur, highlight, and more">
        <CalciteIcon scale="s" slot="icon" icon="effects" />
        <CalciteLabel>
          Effect type
          <CalciteSegmentedControl width="full">
            <CalciteSegmentedControlItem value="Decimal Degrees" />
            <CalciteSegmentedControlItem checked value="Degrees, Minutes, Seconds" />
          </CalciteSegmentedControl>
        </CalciteLabel>
        <CalciteLabel>
          Toggle Vertical Exageration
          <CalciteLabel layout='inline'>
            <CalciteCheckbox />
            3D View Only
          </CalciteLabel>
        </CalciteLabel>
        <CalciteLabel layout='inline'>
          <CalciteCheckbox />
          Toggle Basemap Blending
        </CalciteLabel>
        <CalciteLabel>
          <div className='text-start mt-3 my-1 mx-2'>
            <Link text='Reload map in 2D mode' href='https://google.com/' />
            <p className='md:text-gray-400 my-2 text-sm'>
              For faster load times
            </p>
          </div>
        </CalciteLabel>
      </CalciteBlock>
    </CalcitePanel>
  )
}

export default MapConfigurations
