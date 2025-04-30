'use client';

import { useState, useEffect } from 'react';

// 토스트 타입 정의
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

/**
 * 토스트 알림 훅
 * @returns {Object} { toast, dismissToast }
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  // 토스트 추가
  const toast = ({ type = TOAST_TYPES.INFO, title, description, duration = 5000 }) => {
    const id = Date.now().toString();
    
    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        title,
        description,
        duration,
      },
    ]);

    // 자동 제거
    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  };

  // 토스트 제거
  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    toast,
    dismissToast,
  };
}

// 토스트 컨텍스트 및 프로바이더
export function ToastProvider({ children }) {
  const { toasts, toast, dismissToast } = useToast();

  return (
    <>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-md shadow-md p-4 min-w-[300px] max-w-md animate-in fade-in slide-in-from-bottom-5 ${
              toast.type === TOAST_TYPES.SUCCESS
                ? 'bg-green-50 border-l-4 border-green-500'
                : toast.type === TOAST_TYPES.ERROR
                ? 'bg-red-50 border-l-4 border-red-500'
                : toast.type === TOAST_TYPES.WARNING
                ? 'bg-amber-50 border-l-4 border-amber-500'
                : 'bg-blue-50 border-l-4 border-blue-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                {toast.title && (
                  <h3
                    className={`font-medium ${
                      toast.type === TOAST_TYPES.SUCCESS
                        ? 'text-green-800'
                        : toast.type === TOAST_TYPES.ERROR
                        ? 'text-red-800'
                        : toast.type === TOAST_TYPES.WARNING
                        ? 'text-amber-800'
                        : 'text-blue-800'
                    }`}
                  >
                    {toast.title}
                  </h3>
                )}
                {toast.description && (
                  <p
                    className={`text-sm mt-1 ${
                      toast.type === TOAST_TYPES.SUCCESS
                        ? 'text-green-700'
                        : toast.type === TOAST_TYPES.ERROR
                        ? 'text-red-700'
                        : toast.type === TOAST_TYPES.WARNING
                        ? 'text-amber-700'
                        : 'text-blue-700'
                    }`}
                  >
                    {toast.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">닫기</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default useToast;
