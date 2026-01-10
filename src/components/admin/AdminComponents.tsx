// components/admin/AdminComponents.tsx - Enhanced with better UI/UX
import React, { forwardRef } from 'react';
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Upload,
  Plus,
  Eye,
  EyeOff,
  ImageIcon,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';



interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  className?: string;
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  className = '',
  children,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          className={`
            block w-full rounded-lg border appearance-none bg-white px-3 py-2 pr-10
            text-gray-900 placeholder-gray-500
            focus:outline-none focus:ring-2 transition-colors
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-[#1A403D] focus:ring-[#1A403D]/20'
            }
            ${props.disabled
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed'
              : 'hover:border-gray-400'
            }
            ${className}
          `}
          {...props}
        >
          {children}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDown className={`h-4 w-4 ${
            error
              ? 'text-red-400'
              : 'text-gray-400'
          }`} />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 flex items-center mt-1">
          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1">
          {helperText}
        </p>
      )}
    </div>
  );
};


// ============================================================================
// ENHANCED LOADING COMPONENTS
// ============================================================================

export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string;
  text?: string;
}> = ({ size = 'md', className = '', text }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-[#1A403D]`} />
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

export const LoadingOverlay: React.FC<{
  children: React.ReactNode;
  loading: boolean;
  text?: string;
}> = ({ children, loading, text = 'Loading...' }) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
          <LoadingSpinner size="lg" text={text} />
        </div>
      )}
    </div>
  );
};

export const SkeletonLoader: React.FC<{
  className?: string;
  lines?: number;
}> = ({ className = '', lines = 1 }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`bg-gray-200 rounded ${i > 0 ? 'mt-2' : ''} ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}>
          <div className="h-4 rounded"></div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// ENHANCED ALERT COMPONENTS
// ============================================================================

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode; // Add this to allow children
}

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onClose,
  className = '',
  actions
}) => {
  const styles = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  };

  const Icon = icons[type];

  return (
    <div className={`border rounded-lg p-4 ${styles[type]} ${className} animate-in slide-in-from-top-2 duration-300`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-semibold mb-1">{title}</h3>
          )}
          <p className="text-sm leading-relaxed">{message}</p>
          {actions && (
            <div className="mt-3 flex space-x-2">
              {actions}
            </div>
          )}
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-lg p-1.5 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Toast notifications for better UX
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
  }>>([]);

  const addToast = React.useCallback((toast: Omit<typeof toasts[0], 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};

// ============================================================================
// ENHANCED FORM COMPONENTS
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {
  const hasError = Boolean(error);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-4 w-4 text-gray-400">{leftIcon}</div>
          </div>
        )}
        <input
          ref={ref}
          className={`
            block w-full rounded-lg border transition-all duration-200
            ${leftIcon ? 'pl-10' : 'pl-4'}
            ${rightIcon ? 'pr-10' : 'pr-4'}
            py-2.5 text-sm
            ${hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-[#1A403D] focus:ring-[#1A403D]/20'
            }
            bg-white
            text-gray-900
            placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-opacity-20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="h-4 w-4 text-gray-400">{rightIcon}</div>
          </div>
        )}
      </div>
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  label,
  error,
  hint,
  className = '',
  ...props
}, ref) => {
  const hasError = Boolean(error);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        className={`
          block w-full rounded-lg border px-4 py-2.5 text-sm transition-all duration-200 resize-none
          ${hasError
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-[#1A403D] focus:ring-[#1A403D]/20'
          }
          bg-white
          text-gray-900
          placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-opacity-20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-600 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

// ============================================================================
// ENHANCED ACTION COMPONENTS
// ============================================================================




interface ActionButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode; // Make children optional with '?'
  className?: string;
  fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  className = '',
  fullWidth = false
}) => {
  const variants = {
    primary: 'bg-[#1A403D] hover:bg-[#1A403D]/90 focus:ring-[#1A403D] text-white shadow-sm',
    secondary: 'bg-white hover:bg-gray-50 focus:ring-gray-500 text-gray-700 border border-gray-300',
    success: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 text-white shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white shadow-sm',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white shadow-sm'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${sizes[size]} 
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'transform-none' : 'hover:scale-105 active:scale-95'}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

// ============================================================================
// IMAGE UPLOAD COMPONENT
// ============================================================================

interface ImageUploadProps {
  onUpload: (files: FileList) => void;
  loading?: boolean;
  error?: string;
  accept?: string;
  multiple?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onUpload,
  loading = false,
  error,
  accept = "image/*",
  multiple = true,
  className = '',
  children
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files);
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
        disabled={loading}
      />
      
      <div
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-[#1A403D] hover:bg-[#1A403D]/5'
          }
          ${loading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {loading ? (
          <LoadingSpinner size="lg" text="Uploading..." />
        ) : children ? (
          children
        ) : (
          <div>
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div>
              <ActionButton
                onClick={() => {}} // This will be overridden by the div's onClick
                variant="secondary"
                icon={<Upload className="h-4 w-4" />}
              >
                Upload Images
              </ActionButton>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, GIF, WebP up to 10MB each
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// IMAGE PREVIEW COMPONENT
// ============================================================================

interface ImagePreviewProps {
  images: Array<{
    url?: string;
    preview?: string;
    isMain: boolean;
    file?: File;
  }>;
  onRemove: (index: number) => void;
  onSetMain: (index: number) => void;
  onView?: (url: string) => void;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onRemove,
  onSetMain,
  onView,
  className = ''
}) => {
  if (images.length === 0) return null;

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <img
              src={image.preview || image.url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => onView && (image.preview || image.url) && onView(image.preview || image.url!)}
            />
          </div>
          
          {/* Overlay buttons */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
            {onView && (
              <button
                onClick={() => onView(image.preview || image.url!)}
                className="p-2 bg-white rounded-full shadow-lg mr-2 hover:bg-gray-100 transition-colors"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </button>
            )}
          </div>

          {/* Remove button */}
          <button
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-90 group-hover:scale-100"
          >
            <X className="h-3 w-3" />
          </button>

          {/* Main image toggle */}
          <button
            onClick={() => onSetMain(index)}
            className={`
              absolute bottom-2 left-2 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 shadow-lg
              ${image.isMain 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100'
              }
            `}
          >
            {image.isMain ? '★ Main' : 'Set Main'}
          </button>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// ENHANCED CARD COMPONENT
// ============================================================================

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  actions,
  className = '',
  loading = false,
  error
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {actions && <div className="flex items-center space-x-2">{actions}</div>}
          </div>
        </div>
      )}
      
      <LoadingOverlay loading={loading}>
        <div className="p-6">
          {error ? (
            <Alert type="error" message={error} />
          ) : (
            children
          )}
        </div>
      </LoadingOverlay>
    </div>
  );
};

// ============================================================================
// ENHANCED SEARCH COMPONENT
// ============================================================================

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
  loading?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  onClear,
  loading = false
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-[#1A403D]" />
        ) : (
          <Search className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1A403D]/20 focus:border-[#1A403D] transition-all duration-200"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

interface StatusBadgeProps {
  status: string | undefined | null; // Allow undefined or null
  variant?: 'default' | 'small';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  className = ''
}) => {
  const getStatusColor = (status: string | undefined | null) => {
    const normalizedStatus = status?.toUpperCase() ?? 'UNKNOWN';
    switch (normalizedStatus) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const sizeClasses = variant === 'small' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-sm';

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full font-medium border ${getStatusColor(status)} ${className}`}>
      {status ?? 'Unknown'}
    </span>
  );
};

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer, 
  size = 'md',
  closeOnOverlayClick = true 
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 animate-in fade-in duration-200">
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full ${sizes[size]} animate-in slide-in-from-bottom-4 duration-300`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">{children}</div>

          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                {footer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <ActionButton
          onClick={action.onClick}
          variant={action.variant || 'primary'}
          icon={action.icon}
        >
          {action.label}
        </ActionButton>
      )}
    </div>
  );
};