import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NotFoundIllustration from '../../../assets/404_Illustrations.svg';

interface NotFoundProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  message = "The page you're looking for doesn't exist.",
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
            src={NotFoundIllustration}
            alt="404 Not Found"
            className="w-full max-w-md h-auto"
          />
        </div>

        {/* Message */}
        <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
          {message}
        </p>

        {/* Back Button */}
        {showBackButton && (
          <button
            onClick={handleBack}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{backButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default NotFound;
