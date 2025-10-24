import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ServerCrash } from 'lucide-react';
import ServerDownImage from '../../../assets/server-down.webp';

interface ServerErrorProps {
  message?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
}

const ServerError: React.FC<ServerErrorProps> = ({
  message = "Something went wrong on our end. We're working to fix it.",
  showBackButton = true,
  backButtonText = 'Go Back',
  backButtonPath,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <img
            src={ServerDownImage}
            alt="500 Server Error"
            className="w-full max-w-md h-auto"
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-orange-50 rounded-full">
            <ServerCrash className="w-12 h-12 text-orange-500" />
          </div>
        </div>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          {message}
        </p>

        {/* Back Button */}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-500/20"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{backButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ServerError;
