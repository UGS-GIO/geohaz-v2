import { CalciteAction } from '@esri/calcite-components-react';
import { useTheme } from '@/contexts/ThemeProvider';




function ToggleTheme() {
  const { setTheme, theme } = useTheme()


  const toggleTheme = () => {
    console.log('toggleTheme');

    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <CalciteAction
      icon={theme === 'dark' ? 'brightness' : 'moon'}
      text="Toggle theme"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    />
  );
};

export default ToggleTheme;