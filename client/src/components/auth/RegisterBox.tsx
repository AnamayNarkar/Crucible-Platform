import React, { useState } from 'react';

interface RegisterBoxProps {
  onToggle: () => void;
}

const RegisterBox: React.FC<RegisterBoxProps> = ({ onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate loading
    setTimeout(() => setIsLoading(false), 2000);
    console.log('Register clicked', formData);
  };

  const isPasswordMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <div className="relative w-full max-w-xl mx-auto pointer-events-none">
      {/* Main container with enhanced glassmorphism */}
      <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/5 via-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl p-8 overflow-hidden">
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/10 via-transparent to-blue-600/10 opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-blue-400/5 to-transparent animate-pulse"></div>
        
        {/* Floating particles effect */}
        <div className="absolute top-8 right-12 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-24 left-16 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-16 right-20 w-1.5 h-1.5 bg-blue-300/20 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-gray-400 text-sm">Join us and start your adventure</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                Username
              </label>
              <div className="relative">
                <input
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="pointer-events-auto w-full px-4 py-3 bg-black/20 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-500/50"
                  placeholder="Choose a username"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Email Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pointer-events-auto w-full px-4 py-3 bg-black/20 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-500/50"
                  placeholder="Enter your email"
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
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pointer-events-auto w-full px-4 py-3 bg-black/20 border border-gray-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-gray-500/50"
                  placeholder="Create a password"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`pointer-events-auto w-full px-4 py-3 bg-black/20 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 hover:border-gray-500/50 ${
                    formData.confirmPassword && !isPasswordMatch 
                      ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                      : 'border-gray-600/30 focus:ring-blue-500/50 focus:border-blue-500/50'
                  }`}
                  placeholder="Confirm your password"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none"></div>
                
                {/* Password match indicator */}
                {formData.confirmPassword && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {isPasswordMatch ? (
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {formData.confirmPassword && !isPasswordMatch && (
                <p className="text-red-400 text-xs mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Terms checkbox */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                className="pointer-events-auto mt-1 w-4 h-4 text-blue-600 bg-black/20 border border-gray-600/30 rounded focus:ring-blue-500/50 focus:ring-2"
              />
              <label htmlFor="terms" className="text-sm text-gray-400">
                I agree to the{' '}
                <button type="button" className="pointer-events-auto text-blue-400 hover:text-blue-300 transition-colors">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="pointer-events-auto text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isPasswordMatch}
              className="pointer-events-auto group relative w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
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
                Already have an account?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <button
              onClick={onToggle}
              className="pointer-events-auto group inline-flex items-center text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <svg className="mr-1 w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Sign in instead
            </button>
          </div>
        </div>

        {/* Border glow effect */}
        <div className="absolute inset-0 rounded-2xl border border-gradient-to-r from-blue-500/20 via-transparent to-blue-500/20 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default RegisterBox;