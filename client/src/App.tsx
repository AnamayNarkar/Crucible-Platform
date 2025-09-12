import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthPage from './pages/AuthPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <h1 className="text-2xl">Home</h1>,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
