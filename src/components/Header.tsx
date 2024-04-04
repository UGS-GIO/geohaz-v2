import { CalciteNavigation, CalciteNavigationLogo } from '@esri/calcite-components-react'

function Header() {
  return (
    <CalciteNavigation slot='header'>
      <CalciteNavigationLogo
        slot='logo'
        heading='Geologic Hazards Portal'
        description='Utah Geological Survey'
        thumbnail='../../src/assets/logo_main.png'
        target='_blank'
        href='https://geology.utah.gov/'
      />
    </CalciteNavigation>
  )
}

export default Header
