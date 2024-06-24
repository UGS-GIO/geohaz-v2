import arcgisDarkCss from '@arcgis/core/assets/esri/themes/dark/main.css?inline'
import arcgisLightCss from '@arcgis/core/assets/esri/themes/light/main.css?inline'
import { CalciteShell } from '@esri/calcite-components-react'
import { useEffect } from 'react'
import { useTheme } from './contexts/ThemeProvider'
import FullScreenMap from './components/FullScreenMap'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import { Route, Routes } from 'react-router-dom'
import ReportAppWrapper from './components/report/ReportAppWrapper'

function WebApp() {
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
    <CalciteShell className={`calcite-mode-${theme} bg-dotted`}>
      <Toolbar />
      <Header />
      <FullScreenMap />
    </CalciteShell>
  )
}

const NoMatch = () => {
  return (
    <div>
      <h1>404 - Not Found</h1>
    </div>
  )
}

const Report = () => {
  return (
    <div>
      <h1>Report</h1>
    </div>
  )
}

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<WebApp />} />
        {/* <Route index element={<Home />} /> */}
        <Route path="report" element={<ReportAppWrapper />} />
        {/* <Route path="report" element={<Report />} /> */}
        {/* <Route path="dashboard" element={<Dashboard />} /> */}

        {/* Using path="*"" means "match anything", so this route
          acts like a catch-all for URLs that we don't have explicit
          routes for. */}
        <Route path="*" element={<NoMatch />} />
      </Routes>
    </div>
  )
}

export default App
