import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import ServerDownPage from './pages/ServerDownPage';
import DashboardLayout from './customComponents/global/DashboardLayout';
import Contests from './customComponents/home/Contests';
import Problems from './customComponents/home/Problems';
import Leaderboard from './customComponents/home/Leaderboard';
import CreateContest from './customComponents/home/CreateContest';
import ProtectedRoute from './utils/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout children={<Contests />} />
  },
  {
    path: "/contests",
    element: <DashboardLayout children={<Contests />} />
  },
  {
    path: "/problems",
    element: <DashboardLayout children={<Problems />} />
  },
  {
    path: "/leaderboard",
    element: <DashboardLayout children={<Leaderboard />} />
  },
  {
    path: "/contests/create",
    element: <ProtectedRoute element={<DashboardLayout children={<CreateContest />} />} />
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/server-down",
    element: <ServerDownPage />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
