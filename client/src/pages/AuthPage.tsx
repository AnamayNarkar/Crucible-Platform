import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../services/state/slice/auth';
import type { AppDispatch, RootState } from '../services/state/store';
import { register } from '../services/api/auth';
import { cn } from '../lib/utils';
import { OrbitingCircles } from '../components/ui/orbiting-circles';
import { InteractiveGridPattern } from '../customComponents/auth/InteractiveGridPattern';
import linuxLogo from '../assets/languages/linux.svg';
import reactLogo from '../assets/languages/react.svg';
import javaLogo from '../assets/languages/java.svg';
import goLogo from '../assets/languages/go-logo.svg';
import cLogo from '../assets/languages/c.svg';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      try {
        const resultAction = await dispatch(login({ emailOrUsername: formData.email, password: formData.password }));
        if (login.fulfilled.match(resultAction)) {
          navigate('/');
        }
      } catch (err) {
        console.error("An unexpected error occurred:", err);
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        console.error("Passwords don't match");
        return;
      }
      try {
        await register(formData.name, formData.email, formData.password);
        const resultAction = await dispatch(login({ emailOrUsername: formData.email, password: formData.password }));
        if (login.fulfilled.match(resultAction)) {
          navigate('/');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 text-gray-900 overflow-hidden relative flex">
      {/* Left Side - Auth Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 via-blue-400 to-blue-500 bg-clip-text text-transparent">
              Crucible
            </h1>
            <p className="text-gray-600 mt-2">Welcome to the future</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-gray-300/50 relative">
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg transition-transform duration-300",
              isLogin ? "translate-x-0" : "translate-x-full"
            )}></div>
            <button
              onClick={() => { setIsLogin(true); resetForm(); }}
              className={cn(
                "w-1/2 py-2.5 rounded-lg text-center font-semibold transition-colors duration-300 relative z-10 cursor-pointer",
                isLogin ? "text-white" : "text-gray-600 hover:text-gray-800"
              )}
            >
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); resetForm(); }}
              className={cn(
                "w-1/2 py-2.5 rounded-lg text-center font-semibold transition-colors duration-300 relative z-10 cursor-pointer",
                !isLogin ? "text-white" : "text-gray-600 hover:text-gray-800"
              )}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {!isLogin && (
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </button>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </form>

          {/* Additional Options */}
          <div className="text-center space-y-4">
            {isLogin && (
              <button className="text-blue-600 hover:text-blue-700 text-sm transition-colors cursor-pointer">
                Forgot your password?
              </button>
            )}
            
            <div className="flex items-center justify-center space-x-4">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-gray-600 text-sm">or continue with</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <div className="flex space-x-4">
              <button className="flex-1 py-3 px-4 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 hover:bg-gray-100/50 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>
              <button className="flex-1 py-3 px-4 rounded-lg bg-white/50 backdrop-blur-sm border border-gray-300/50 hover:bg-gray-100/50 transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.056-4.869-4.991-4.869-3.398 0-5.393 2.549-5.393 5.184 0 1.027.395 2.127.889 2.726a.36.36 0 0 1 .083.343c-.091.378-.293 1.189-.332 1.355-.053.218-.173.265-.402.159-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Orbiting Circles with Background */}
      <div className="hidden lg:flex lg:items-center lg:justify-center lg:w-1/2 relative overflow-hidden min-h-screen">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0">
          <InteractiveGridPattern 
            className="opacity-30"
            squaresClassName="stroke-blue-500/50 hover:fill-blue-500/20"
          />
        </div>

        {/* Centered Orbiting Circles */}
        <div className="relative w-[600px] h-[600px] flex items-center justify-center">
          {/* Center Linux Logo */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-24 h-24 bg-blue-200/30 rounded-full blur-sm absolute"></div>
            <img src={linuxLogo} alt="Linux" className="w-20 h-20 drop-shadow-lg relative z-10" />
          </div>
          
          <OrbitingCircles radius={120} iconSize={70}>
            <img src={reactLogo} alt="React" className=" drop-shadow-md" />
            <img src={javaLogo} alt="Java" className="drop-shadow-md" />
            <img src={goLogo} alt="Go" className="drop-shadow-md" />
          </OrbitingCircles>
          <OrbitingCircles radius={200} reverse iconSize={70}>
            <img src={cLogo} alt="C" className="drop-shadow-md" />
            <img src={reactLogo} alt="React" className="drop-shadow-md" />
            <img src={javaLogo} alt="Java" className="drop-shadow-md" />
            <img src={goLogo} alt="Go" className="drop-shadow-md" />
          </OrbitingCircles>
        </div>
      </div>

      {/* Mobile-responsive overlay for all screens */}
      <div className="lg:hidden absolute inset-0 opacity-20 pointer-events-none">
        <InteractiveGridPattern 
          className="opacity-30"
          squaresClassName="stroke-blue-500/50"
        />
      </div>
    </div>
  );
};

export default AuthPage;