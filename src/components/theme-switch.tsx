import arcgisDarkCss from '@arcgis/core/assets/esri/themes/dark/main.css?inline'
import arcgisLightCss from '@arcgis/core/assets/esri/themes/light/main.css?inline'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/theme-provider'
import { Button } from './custom/button'
import { useEffect } from 'react'

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

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
    <Button
      size='icon'
      variant='ghost'
      className='rounded-full'
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </Button>
  )
}
