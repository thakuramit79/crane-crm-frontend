import React from 'react';
import { createRoot } from 'react-dom/client';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }[type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50`}>
      <span>{message}</span>
      <button onClick={onClose} className="hover:opacity-80">
        <X size={18} />
      </button>
    </div>
  );
};

export const showToast = (message: string, type: ToastProps['type']) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  const root = createRoot(container);
  
  const removeToast = () => {
    root.unmount();
    document.body.removeChild(container);
  };

  root.render(
    <Toast
      message={message}
      type={type}
      onClose={removeToast}
    />
  );

  // Automatically remove after 3 seconds
  setTimeout(removeToast, 3000);
};

export default Toast;

export { Toast }