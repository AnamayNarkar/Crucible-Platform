import serverDownImage from '../assets/server-down.webp';
import { checkHealth } from '../services/api/global';

const ServerDownPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        <div className="mb-8">
          <img 
            src={serverDownImage} 
            alt="Server Down" 
            className="w-64 h-64 mx-auto object-contain"
          />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Server Unavailable
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          We're having trouble connecting to the server. Please check your internet connection and try again.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={async () => {
              const result = await checkHealth();
              if (result && !result.isServerDown) {
                window.location.href = '/';
              }
            }}
            className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerDownPage;
