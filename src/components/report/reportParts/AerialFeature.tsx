import { FC } from 'react';
import './AerialFeature.scss';

interface AerialFeatureProps {
  Agency: string;
  ProjectYear: number;
  ProjectCode: string;
  ProjectName: string;
  Roll: string;
  Frame: string;
  Description: string;
}

const AerialFeature: FC<AerialFeatureProps> = (props) => {
  return (
    <div className="aerial-feature">
      <div>{props.Agency}</div>
      <div>{props.ProjectYear} {props.ProjectCode} {props.ProjectName} {props.Roll} {props.Frame}</div>
      <div dangerouslySetInnerHTML={{ __html: props.Description }}></div>
    </div>
  );
};

export default AerialFeature;