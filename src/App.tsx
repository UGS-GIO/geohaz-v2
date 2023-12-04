import arcgisDarkCss from '@arcgis/core/assets/esri/themes/dark/main.css?inline'
import arcgisLightCss from '@arcgis/core/assets/esri/themes/light/main.css?inline'
import { CalciteShell } from '@esri/calcite-components-react'
import { useEffect } from 'react'
import { useTheme } from './contexts/ThemeProvider'
import FullScreenMap from './components/FullScreenMap'
import Header from './components/Header'
import Toolbar from './components/Toolbar'

export function App() {
  const { theme } = useTheme()

  // Set the ArcGIS theme on the document head
  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = theme === 'dark' ? arcgisDarkCss : arcgisLightCss
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [theme])

  return (
    <div style={{ colorScheme: theme }} className={`${theme}`}>
      <CalciteShell className={`calcite-mode-${theme} bg-dotted`}>
        <Toolbar />
        <Header />
        <FullScreenMap />
      </CalciteShell>
    </div>
  )
}
