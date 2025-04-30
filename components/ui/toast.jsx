'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const ToastProvider = React.createContext({
  toast: () => {},
  dismiss: () => {},
});

export const useToast = () => React.useContext(ToastProvider);

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
  {
    variants: {
      variant: {
        default: 'border bg-white text-neutral-950',
        destructive: 'destructive group border-red-500 bg-red-50 text-red-600',
        success: 'border-green-500 bg-green-50 text-green-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export function Toast({
  className,
  variant,
  title,
  description,
  onDismiss,
  ...props
}) {
  return (
    <div
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {onDismiss && (
        <button
          className="absolute right-2 top-2 rounded-md p-1 text-neutral-950/50 opacity-0 transition-opacity hover:text-neutral-950 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">닫기</span>
        </button>
      )}
    </div>
  );
}

export function ToastContainer({ children }) {
  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {children}
    </div>
  );
}

export function ToastProviderComponent({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const toast = React.useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((prevToasts) => [
      ...prevToasts,
      { id, title, description, variant, duration },
    ]);
    
    return id;
  }, []);

  const dismiss = React.useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  React.useEffect(() => {
    const timers = toasts.map((toast) => {
      const timer = setTimeout(() => {
        dismiss(toast.id);
      }, toast.duration);
      
      return { id: toast.id, timer };
    });
    
    return () => {
      timers.forEach((timer) => clearTimeout(timer.timer));
    };
  }, [toasts, dismiss]);

  return (
    <ToastProvider.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </ToastContainer>
    </ToastProvider.Provider>
  );
}
