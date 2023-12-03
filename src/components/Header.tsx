import React, { useState } from 'react'
import {
  CalciteLabel,
  CalciteSwitch,
  CalciteNavigation,
  CalciteNavigationLogo,
  CalciteMenu,
  CalciteMenuItem,
} from '@esri/calcite-components-react'
// import './Header.css'

function Header() {
  const [unitDescriptions, setUnitDescriptions] = useState(false)

  return (
    <CalciteNavigation slot='header'>
      <CalciteNavigationLogo
        slot='logo'
        heading='Utah Geological Survey'
        thumbnail='../../src/assets/logo_main.png'
        target='_blank'
        href='https://geology.utah.gov/'
      />
      <CalciteMenu slot='content-end' label='asdf'>
        <CalciteLabel
          className='pt-3 px-3'
          layout='inline'
          alignment='start'
          scale='l'
        >
          Unit Descriptions
          <CalciteSwitch
            scale='l'
            label='Unit Descriptions'
            onChange={() => setUnitDescriptions(!unitDescriptions)}
            onCalciteSwitchChange={(e: any) => {
              setUnitDescriptions(e.currentTarget.checked)
            }}
          />
        </CalciteLabel>

        <CalciteMenuItem
          text='Map Downloads'
          iconStart='license'
          label='asdf'
          target='_blank'
          href='https://google.com'
        />
      </CalciteMenu>
    </CalciteNavigation>
  )
}

export default Header
