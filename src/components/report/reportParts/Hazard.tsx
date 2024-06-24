import { FC, ReactNode } from 'react';
import config from '../config';
import { kebabCase } from 'lodash';
import './Hazard.scss';
import MapSurround from './MapSurround';
import qffLegend from '../images/qff-legend.jpg';

interface HazardProps {
  name: string;
  group: string;
  introText: string;
  code: string;
  children?: ReactNode;
}

const Hazard: FC<HazardProps> = ({ name, group, introText, code, children }) => {
  return (
    <div className="page-break" id={kebabCase(name)}>
      <h2 className="group__heading" title={config.notProd ? "HazardGroupingsTable.HazardGroup (from parent)" : undefined}>{group} Hazard</h2>
      <h2 className="hazard__heading" title={config.notProd ? "HazardUnitTextTable.HazardName (from first unit)" : undefined}>{name}</h2>
      <p dangerouslySetInnerHTML={{ __html: introText }} title={config.notProd ? "HazardIntroTextTable.Text" : undefined}></p>
      <MapSurround mapKey={code} />
      {code === config.quaternaryFaultsHazardCode &&
        <img src={qffLegend} alt="QFF static legend" className="hazard__static-legend" />}
      {children}
    </div>
  );
};

export default Hazard;