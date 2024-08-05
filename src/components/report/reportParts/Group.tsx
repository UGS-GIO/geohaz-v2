import { FC, ReactNode } from 'react';
import config from '../config';
import './Group.scss';

interface GroupProps {
  name: string;
  text: string;
  children?: ReactNode;
}

const Group: FC<GroupProps> = ({ name, text, children }) => {
  return (
    <div className="page-break">
      <h1 className="group__heading" title={config.notProd ? 'HazardGroupingsTable.HazardGroup' : undefined}>{name} Hazard</h1>
      <p dangerouslySetInnerHTML={{ __html: text }} title={config.notProd ? 'HazardGroupTextTable.Text' : undefined}></p>
      {children}
    </div>
  );
};

export default Group;