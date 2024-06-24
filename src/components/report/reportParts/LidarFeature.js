import React from 'react';
import './LidarFeature.scss';
import { getLidarFeatureName } from '../helpers';


export default props => {
  return (
    <>
      <div className="lidar-feature-header">
        { getLidarFeatureName(props.ProjectName, props.AreaName) }
      </div>
      { // some values have multiple URLs separated by commas...
        props.DataAccessURL && props.DataAccessURL.split(',').map((url, index) =>
          <div key={index}>
            <a href={url}>{url}</a>
          </div>
        )
      }
    </>
  );
}
