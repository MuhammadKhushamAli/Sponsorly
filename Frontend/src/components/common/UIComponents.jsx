import React from 'react';

// Button Component
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-brand text-white hover:shadow-brand focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-500',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
    ghost: 'text-primary-600 hover:bg-primary-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Component
export const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 p-6 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// Input Component
export const Input = ({
  label,
  error,
  className = '',
  ...props
}) => (
  <div className="flex flex-col gap-2">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      className={`px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none transition-colors ${
        error ? 'border-error' : ''
      } ${className}`}
      {...props}
    />
    {error && <span className="text-sm text-error">{error}</span>}
  </div>
);

// Badge Component
export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    accent: 'bg-accent-100 text-accent-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Loading Spinner
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary-500 ${sizes[size]} ${className}`} />
  );
};

// Modal Component
export const Modal = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className={`max-w-md w-full ${className}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        {children}
      </Card>
    </div>
  );
};

// Alert Component
export const Alert = ({ type = 'info', message, onClose, className = '' }) => {
  const types = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`border-l-4 p-4 rounded ${types[type]} ${className}`}>
      <div className="flex justify-between items-center">
        <p>{message}</p>
        {onClose && (
          <button onClick={onClose} className="text-2xl leading-none">
            ×
          </button>
        )}
      </div>
    </div>
  );
};
