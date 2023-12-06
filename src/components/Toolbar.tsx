import React, { useState } from 'react'
import {
  CalciteShellPanel,
  CalciteActionBar,
  CalciteActionGroup,
  CalciteAction,
  CalciteBlock,
  CalciteIcon,
  CalciteLabel,
  CalciteNotice,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
  CalciteSlider,
} from '@esri/calcite-components-react'
import { useTheme } from '../contexts/ThemeProvider'
import InfoSidebar from './InfoSidebar'
import LayersSidebar from './LayersSidebar'

type SidebarComponents = 'Info' | 'Layers'
// | 'Map Configurations'
// | 'Geological Unit Search'

function Toolbar() {
  const [panelClosed, setPanelClosed] = useState(true)
  const [shellPanelCollapsed, setShellPanelCollapsed] = useState(true)
  const [panelHeading, setPanelHeading] = useState('Layers')
  const [activeComponent, setActiveComponent] = useState<SidebarComponents>()

  const { setTheme, theme } = useTheme()

  const handleActionClick = (text: string) => {
    if (text === panelHeading) {
      setPanelClosed(!panelClosed)
      setShellPanelCollapsed(!shellPanelCollapsed)
    } else {
      setPanelClosed(false)
      setShellPanelCollapsed(false)
    }
    setPanelHeading(text)
    setActiveComponent(text as SidebarComponents)
  }

  const componentMap: Record<SidebarComponents, JSX.Element> = {
    Info: (
      <InfoSidebar
        setPanelClosed={setPanelClosed}
        setShellPanelCollapsed={setShellPanelCollapsed}
        panelHeading={panelHeading}
        panelClosed={panelClosed}
      />
    ),
    Layers: <LayersSidebar />,
    // 'Map Configurations': <MapConfigurationsSidebar />,
    // 'Geological Unit Search': <GeologicalUnitSearchSidebar />,
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
            onClick={() => handleActionClick('Info')}
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
            icon='sliders-horizontal'
            onClick={() => handleActionClick('Undo')}
          />
          <CalciteAction
            text='Redo'
            indicator
            icon='data-magnifying-glass'
            onClick={() => handleActionClick('Redo')}
          />
          <CalciteAction
            icon={theme === 'dark' ? 'brightness' : 'moon'}
            text='Toggle theme'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </CalciteActionGroup>
      </CalciteActionBar>
      {/* <ExpandedSidebar
        setPanelClosed={setPanelClosed}
        setShellPanelCollapsed={setShellPanelCollapsed}
        panelHeading={panelHeading}
        panelClosed={panelClosed}
      /> */}
      {activeComponent && componentMap[activeComponent]}
      {/* <CalciteBlock
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
      </CalciteBlock> */}
    </CalciteShellPanel>
  )
}

export default Toolbar
