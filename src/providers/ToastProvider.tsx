import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Toast, ToastType } from '../components/common/Toast';
import { registerGlobalToastHandler } from '../services/error/errorHandler.service';

interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    title?: string,
    duration?: number
  ) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toastState, setToastState] = useState<{
    visible: boolean;
    message: string;
    title?: string;
    type: ToastType;
  }>({
    visible: false,
    message: '',
    title: undefined,
    type: 'info',
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToastState((prev) => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      title?: string,
      duration = 4000
    ) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToastState({
        visible: true,
        message,
        title,
        type,
      });

      if (duration > 0) {
        timerRef.current = setTimeout(() => {
          hideToast();
        }, duration);
      }
    },
    [hideToast]
  );

  // Register with ErrorHandler for global non-component access
  useEffect(() => {
    registerGlobalToastHandler((msg, type, title) => {
      showToast(msg, type || 'warning', title);
    });

    return () => {
      registerGlobalToastHandler(null);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={toastState.visible}
        message={toastState.message}
        title={toastState.title}
        type={toastState.type}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
