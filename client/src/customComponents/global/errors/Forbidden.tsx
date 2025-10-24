import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ForbiddenIllustration from '../../../assets/403_illustration.svg';

interface ForbiddenProps {
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
}

const Forbidden: React.FC<ForbiddenProps> = ({
  message = "You don't have permission to access this resource.",
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
            src={ForbiddenIllustration}
            alt="403 Forbidden"
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
            className="inline-flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/20 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{backButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Forbidden;
