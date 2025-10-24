
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface AlertPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
}

export const AlertPopup: React.FC<AlertPopupProps> = ({ 
  isOpen, 
  onClose, 
  title = 'Error', 
  message,
  type = 'error'
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-900',
      text: 'text-red-800',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-900',
      text: 'text-yellow-800',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-900',
      text: 'text-blue-800',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-900',
      text: 'text-green-800',
      button: 'bg-green-600 hover:bg-green-700'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md mx-4">
        <div className={`${styles.bg} ${styles.border} border-2 rounded-lg shadow-lg p-6`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
              <AlertCircle size={24} />
            </div>
            
            <div className="flex-1">
              <h3 className={`${styles.title} text-lg font-semibold mb-2`}>
                {title}
              </h3>
              <p className={`${styles.text} text-sm leading-relaxed`}>
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className={`${styles.button} text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};