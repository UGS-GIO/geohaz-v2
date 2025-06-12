import { FC } from 'react';
import './ErrorPage.scss';

interface ErrorPageProps {
  error: boolean;
}

const ErrorPage: FC<ErrorPageProps> = ({ error }) => {
  return (
    <div className="error-page">
      <h1 className="error-page__heading">There was an error generating the report</h1>
      <p>We are not displaying the report because an error has occurred resulting in an incomplete assessment of your area of interest. In order to not provide incomplete results and imply false information, we are unable to provide the report functionality at this time.</p>
      <p>Please contact UGS with the information provided.</p>
      <pre className="error-page__error">{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
};

export default ErrorPage;