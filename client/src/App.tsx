import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardLayout from './customComponents/global/DashboardLayout';

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout children={<div>Home Content</div>} />
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
