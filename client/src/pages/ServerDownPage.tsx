import serverDownImage from '../assets/server-down.webp';
import { checkHealth } from '../services/api/global';

const ServerDownPage = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <img 
            src={serverDownImage} 
            alt="Server Down" 
            className="w-48 h-48 mx-auto object-contain opacity-90"
          />
        </div>
        
        <h1 className="text-3xl font-semibold text-gray-900 mb-3">
          Server Unavailable
        </h1>
        
        <p className="text-base text-gray-500 mb-8 leading-relaxed">
          We're having trouble connecting to the server. Please check your internet connection and try again.
        </p>
        
        <button
          onClick={async () => {
            const result = await checkHealth();
            if (result && !result.isServerDown) {
              window.location.href = '/';
            }
          }}
          className="px-8 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

export default ServerDownPage;