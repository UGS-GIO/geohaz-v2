import React, { useState } from 'react'
import {
  CalciteShellPanel,
  CalciteActionBar,
  CalciteActionGroup,
  CalciteAction,
  CalcitePanel,
  CalciteBlock,
  CalciteIcon,
  CalciteLabel,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
  CalciteSlider,
  CalciteNotice,
} from '@esri/calcite-components-react'

function Toolbar({
  setTheme,
  theme,
}: {
  setTheme: (theme: any) => void
  theme: any
}) {
  const [panelClosed, setPanelClosed] = useState(true)
  const [shellPanelCollapsed, setShellPanelCollapsed] = useState(true)
  const [panelHeading, setPanelHeading] = useState('Layers')

  const handleActionClick = (text: string) => {
    console.log(text)

    setPanelClosed(!panelClosed)
    setShellPanelCollapsed(!shellPanelCollapsed)
    setPanelHeading(text)
  }

  const handlePanelClose = () => {
    setPanelClosed(true)
    setShellPanelCollapsed(true)
  }

  return (
    <CalciteShellPanel
      widthScale='l'
      slot='panel-start'
      position='start'
      collapsed={shellPanelCollapsed}
    >
      <CalciteActionBar slot='action-bar'>
        <CalciteActionGroup>
          <CalciteAction
            text='Add'
            icon='information-f'
            onClick={() => handleActionClick('info')}
          />
          <CalciteAction
            active={!panelClosed}
            text='Layers'
            indicator
            icon='layers'
            onClick={() => handleActionClick('Layers')}
          />
        </CalciteActionGroup>
        <CalciteActionGroup>
          <CalciteAction
            text='Undo'
            icon='undo'
            onClick={() => handleActionClick('Undo')}
          />
          <CalciteAction
            text='Redo'
            indicator
            icon='redo'
            onClick={() => handleActionClick('Redo')}
          />
          <CalciteAction
            text='Save'
            disabled
            icon='save'
            onClick={() => handleActionClick('Save')}
          />
          <CalciteAction
            icon={theme === 'dark' ? 'brightness' : 'moon'}
            text='Toggle theme'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </CalciteActionGroup>
      </CalciteActionBar>
      <CalcitePanel
        heading={panelHeading}
        closed={panelClosed}
        onCalcitePanelClose={handlePanelClose}
      >
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
      </CalcitePanel>
    </CalciteShellPanel>
  )
}

export default Toolbar
