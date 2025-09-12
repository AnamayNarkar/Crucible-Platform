import React, { useState } from 'react';

interface LoginBoxProps {
  onToggle: () => void;
}

const LoginBox: React.FC<LoginBoxProps> = ({ onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000);
    console.log('Continue clicked');
  };

  return (
    <div className="relative w-full max-w-xl mx-auto pointer-events-none">
      {/* Main container with enhanced glassmorphism */}
      <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/5 via-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl p-8 overflow-hidden">
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-blue-600/10 opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-400/5 to-transparent animate-pulse"></div>
        
        {/* Floating particles effect */}
        <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce"></div>
        <div className="absolute top-20 right-16 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-blue-300/20 rounded-full animate-pulse"></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                Email or Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="pointer-events-auto w-full px-4 py-3 bg-black/20 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-500/50"
                  placeholder="Enter your email or username"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="pointer-events-auto w-full px-4 py-3 bg-black/20 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-500/50"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button type="button" className="pointer-events-auto text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="pointer-events-auto group relative w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </span>
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-xl"></div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-r from-transparent via-black/50 to-transparent text-gray-400">
                New here?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <button
              onClick={onToggle}
              className="pointer-events-auto group inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Create your account
              <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Border glow effect */}
        <div className="absolute inset-0 rounded-2xl border border-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default LoginBox;