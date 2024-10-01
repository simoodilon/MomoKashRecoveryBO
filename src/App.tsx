
import './App.css';

import { RouterProvider } from 'react-router-dom';
import NavigationApp from './routes/NavigationApp';
import ErrorBoundary from './ErrorBoundary';



function App() {
  return (
    <div>

      {/* <ErrorBoundary>
        <RouterProvider router={NavigationApp} />
      </ErrorBoundary> */}
      <RouterProvider router={NavigationApp} />
    </div>
  );
}

export default App;
