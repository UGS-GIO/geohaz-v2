import {
  CalciteBlock,
  CalciteButton,
  CalciteIcon,
  CalciteLabel,
  CalciteLink,
  CalciteNotice,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
  CalciteSlider,
} from '@esri/calcite-components-react'


function MapConfigurations() {
  return (
    <div>

      <CalciteBlock open heading="Layer effects" description="Adjust blur, highlight, and more">
        <CalciteIcon scale="s" slot="icon" icon="effects" />
        <CalciteLabel>
          Effect type
          <CalciteSegmentedControl width="full">
            <CalciteSegmentedControlItem value="Blur" />
            <CalciteSegmentedControlItem checked value="Highlight" />
          </CalciteSegmentedControl>
        </CalciteLabel>
        <CalciteLabel>
          Effect intensity
          <CalciteSlider />
        </CalciteLabel>
      </CalciteBlock>
    </div>
  )
}

export default MapConfigurations
