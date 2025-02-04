import { FC } from 'react';
import config from '../config';

interface ReferencesProps {
  references?: string[];
}

const References: FC<ReferencesProps> = ({ references }) => {
  // console.log('References.render');
  return (
    <>
      <h3>References</h3>
      {(references && references.length > 0) ? references.map((reference, index) =>
        <p key={index} dangerouslySetInnerHTML={{ __html: reference }}
          title={config.notProd ? 'HazardReferenceTextTable.Text' : undefined}></p>)
        : <p>None</p>
      }
    </>
  );
};

export default References;