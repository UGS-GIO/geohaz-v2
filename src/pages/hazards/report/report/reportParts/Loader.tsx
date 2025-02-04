import { FC } from 'react';
import './Loader.scss';

const Loader: FC = () => {
  return (
    <div className="loader-container">
      <div className="loader">
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default Loader;