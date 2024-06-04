import { useState, useEffect, useCallback, useMemo } from 'react';
import { CalciteAction } from '@esri/calcite-components-react';
import { useNavigation } from '../contexts/NavigationContext';

export type ActionItem = {
  name: string;
  icon: string;
  component: React.LazyExoticComponent<() => JSX.Element>;
};

type UseCalciteActionBarProps = {
  currentAction?: ActionItem;
  actions: JSX.Element[];
  shellPanelCollapsed: boolean;
};

export function useCalciteActionBar(
  items: ActionItem[],
  defaultValue: ActionItem['name']
): UseCalciteActionBarProps {
  const { currentActionName, setCurrentActionName } = useNavigation();
  const [shellPanelCollapsed, setShellPanelCollapsed] = useState<boolean>(true);
  const [isFirstRender, setIsFirstRender] = useState<boolean>(true);

  // Initialize the current action name with the default value if not already set
  useEffect(() => {
    if (isFirstRender && !currentActionName && defaultValue) {
      setCurrentActionName(defaultValue);
      setShellPanelCollapsed(false);
      setIsFirstRender(false);
    }
  }, [isFirstRender, currentActionName, defaultValue, setCurrentActionName]);

  // Handle the click event for the action buttons
  const handleClick = useCallback((item: ActionItem) => {
    const isActive = currentActionName === item.name;
    setShellPanelCollapsed(isActive);
    setCurrentActionName(isActive ? undefined : item.name);
  }, [currentActionName, setShellPanelCollapsed, setCurrentActionName]);

  // Determine which action is currently active
  const currentAction = useMemo(
    () => items.find((example) => example.name === currentActionName),
    [currentActionName, items]
  );

  // Dynamically create the action buttons
  const actions = useMemo(
    () =>
      items.map((item) => (
        <CalciteAction
          key={item.name}
          text={item.name}
          icon={item.icon}
          onClick={() => handleClick(item)}
          active={currentActionName === item.name ? true : undefined}
        />
      )),
    [currentActionName, items, handleClick]
  );

  return {
    currentAction,
    actions,
    shellPanelCollapsed,
  };
}