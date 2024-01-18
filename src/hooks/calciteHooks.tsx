import { CalciteAction } from '@esri/calcite-components-react';
import { useCallback, useMemo, useState } from 'react';

export type ActionItem = {
  name: string;
  icon: string;
  code?: () => Promise<typeof import('*?raw')>;
  component: React.LazyExoticComponent<() => JSX.Element>;
};

export type UseCalciteActionBarProps = {
  currentAction?: ActionItem;
  actions: JSX.Element[];
  shellPanelCollapsed: boolean;
};

// This hook is used to dynamically create the action bar buttons and handle the state of the action bar
export function useCalciteActionBar(
  items: ActionItem[],
  defaultValue: ActionItem['name'] | undefined
): UseCalciteActionBarProps {
  const [currentActionName, setCurrentActionName] = useState<string | undefined>(defaultValue);
  const [shellPanelCollapsed, setShellPanelCollapsed] = useState<boolean>(true);

  // handle the click event for the action buttons
  const handleClick = useCallback((item: ActionItem) => {
    const isActive = currentActionName === item.name;
    setShellPanelCollapsed(isActive);
    setCurrentActionName(isActive ? undefined : item.name);
  }, [currentActionName, setShellPanelCollapsed, setCurrentActionName]);

  // determine which action is currently active
  const currentAction = useMemo(
    () => items.find((example) => example.name === currentActionName),
    [currentActionName, items]
  );

  // dynamically create the action buttons
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