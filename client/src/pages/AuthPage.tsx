import { useState, lazy, Suspense } from 'react';
import LoginBox from '../components/auth/LoginBox';
import RegisterBox from '../components/auth/RegisterBox';
import authPageSuspense from '../assets/authPageSuspense.png';
const Spline = lazy(() => import('@splinetool/react-spline'));

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<img src={authPageSuspense} alt="Loading..." className="w-full h-full object-cover" />}>
          <Spline
            scene="https://prod.spline.design/BM9pMnyl7DnNoLfW/scene.splinecode"
          />
        </Suspense>
      </div>
      <div className="relative z-10 w-full px-4 py-8 pointer-events-none">
        {isLogin ? <LoginBox onToggle={toggleMode} /> : <RegisterBox onToggle={toggleMode} />}
      </div>
    </div>
  );  
};

export default AuthPage;