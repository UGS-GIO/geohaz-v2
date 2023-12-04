import {
  CalciteAccordion,
  CalciteAccordionItem,
  CalciteBlock,
  CalciteIcon,
  CalciteLabel,
  CalciteNotice,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
  CalciteSlider,
} from '@esri/calcite-components-react'

const LayersSidebar = () => {
  return (
    // <CalciteAccordion scale='l' selection-mode='multi'>
    //   {Array.from({ length: 5 }, (_, i) => (
    //     <CalciteAccordionItem item-title={`Layer ${i + 1}`} key={i}>
    //       <p>Content for Layer {i + 1}</p>
    //     </CalciteAccordionItem>
    //   ))}
    // </CalciteAccordion>

    <>
      <CalciteBlock
        collapsible
        heading='Layer effects'
        description='Adjust blur, highlight, and more'
      >
        <CalciteIcon scale='s' slot='icon' icon='effects' />
        <CalciteLabel>
          Effect type
          <CalciteSegmentedControl width='full'>
            <CalciteSegmentedControlItem value='Blur' />
            <CalciteSegmentedControlItem checked value='Highlight' />
            <CalciteSegmentedControlItem value='Party mode' />
          </CalciteSegmentedControl>
        </CalciteLabel>
        <CalciteLabel>
          Effect intensity
          <CalciteSlider />
        </CalciteLabel>
      </CalciteBlock>
      <CalciteBlock
        collapsible
        heading='Symbology'
        description='Select type, color, and transparency'
      >
        <CalciteIcon scale='s' slot='icon' icon='map-pin' />
        <CalciteNotice open>
          <div slot='message'>The viewers are going to love this</div>
        </CalciteNotice>
      </CalciteBlock>
    </>
  )
}

export default LayersSidebar
