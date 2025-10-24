import Forbidden from './Forbidden';
import ServerError from './ServerError';
import NotFound from './NotFound';

export type ErrorType = '403' | '404' | '500' | 'forbidden' | 'not-found' | 'server-error';

interface ErrorComponentProps {
  type: ErrorType;
  title?: string;
  message?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonPath?: string;
}

/**
 * A unified error component that displays different error types based on the `type` prop.
 * 
 * @example
 * ```tsx
 * <ErrorComponent type="403" />
 * <ErrorComponent type="not-found" message="Custom message" />
 * <ErrorComponent type="500" backButtonPath="/home" />
 * ```
 */
const ErrorComponent: React.FC<ErrorComponentProps> = ({ type, ...props }) => {
  const normalizedType = type.toLowerCase();

  switch (normalizedType) {
    case '403':
    case 'forbidden':
      return <Forbidden {...props} />;
    
    case '500':
    case 'server-error':
      return <ServerError {...props} />;
    
    case '404':
    case 'not-found':
    default:
      return <NotFound {...props} />;
  }
};

export default ErrorComponent;

// Re-export individual components for direct use
export { Forbidden, ServerError, NotFound };
