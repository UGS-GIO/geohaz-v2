import { CalciteAction } from '@esri/calcite-components-react';
import { useMemo, useState } from 'react';

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

export function useCalciteActionBar(
  items: ActionItem[],
  defaultValue: ActionItem['name']
): UseCalciteActionBarProps {
  const [currentActionName, setCurrentActionName] = useState<string | undefined>(defaultValue);
  const [shellPanelCollapsed, setShellPanelCollapsed] = useState<boolean>(true);

  const currentAction = useMemo(
    () => items.find((example) => example.name === currentActionName),
    [currentActionName, items]
  );

  const actions = useMemo(
    () =>
      items.map((item) => (
        <CalciteAction
          key={item.name}
          text={item.name}
          icon={item.icon}
          onClick={() => {
            const isActive = currentActionName === item.name;
            setShellPanelCollapsed(isActive);
            setCurrentActionName(isActive ? undefined : item.name);
          }}
          active={currentActionName === item.name ? true : undefined}
        />
      )),
    [currentActionName, items]
  );

  return {
    currentAction,
    actions,
    shellPanelCollapsed,
  };
}