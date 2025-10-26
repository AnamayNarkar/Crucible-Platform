import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './services/state/store';
import { getMe } from './services/state/slice/auth';
import AuthPage from './pages/AuthPage';
import ServerDownPage from './pages/ServerDownPage';
import DashboardLayout from './customComponents/global/DashboardLayout';
import Contests from './customComponents/home/Contests';
import Problems from './customComponents/home/Problems';
import Leaderboard from './customComponents/home/Leaderboard';
import CreateContest from './customComponents/home/CreateContest';
import ProtectedRoute from './utils/ProtectedRoute';
import ManageContest from './customComponents/home/ManageContest';

import { useNavigate } from 'react-router-dom';
import { setNavigator } from './services/navigationService';
import NotFound from './customComponents/global/errors/NotFound';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Hydrate user info on app load
    dispatch(getMe());
    return () => {}; // Cleanup if needed
  }, [dispatch]);

  const navigate = useNavigate(); 

    useEffect(() => {
        // 4. Set the external reference 
        setNavigator(navigate);
    }, [navigate]); // Re-run if 'navigate' somehow changes (though rare)

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout children={<Contests />} />} />
      <Route path="/contests" element={<DashboardLayout children={<Contests />} />} />
      <Route path="/problems" element={<DashboardLayout children={<Problems />} />} />
      <Route path="/leaderboard" element={<DashboardLayout children={<Leaderboard />} />} />
      <Route path="/contests/create" element={<ProtectedRoute element={<DashboardLayout children={<CreateContest />} />} />} />
      <Route path="/contests/manage/:contestId" element={<ProtectedRoute element={<DashboardLayout children={<ManageContest />} />} />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/server-down" element={<ServerDownPage />} />
      <Route path="*" element={<DashboardLayout children={<NotFound />} />} />
    </Routes>
  );
}
export default App;
