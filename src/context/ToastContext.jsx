import { createContext, useContext, useState, useEffect } from "react";

const ToastContext = createContext(null);

// Global subscriber set so `toast.success(...)` can be called from anywhere
const listeners = new Set();

export const toast = (message, type = "info") => {
  listeners.forEach((listener) => listener(message, type));
};

toast.success = (msg) => toast(msg, "success");
toast.error = (msg) => toast(msg, "error");
toast.info = (msg) => toast(msg, "info");
toast.warning = (msg) => toast(msg, "warning");

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNewToast = (message, type) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    listeners.add(handleNewToast);
    return () => listeners.delete(handleNewToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Toast Container (top-right) */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          let bgClass = "bg-white border-blue-500 text-slate-800";
          let icon = (
            <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          );

          if (t.type === "success") {
            bgClass = "bg-white border-emerald-500 text-slate-800";
            icon = (
              <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            );
          } else if (t.type === "error") {
            bgClass = "bg-white border-rose-500 text-slate-800";
            icon = (
              <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            );
          } else if (t.type === "warning") {
            bgClass = "bg-white border-amber-500 text-slate-800";
            icon = (
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            );
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto border-l-4 shadow-xl rounded-xl p-4 flex items-start justify-between gap-3 transition-all duration-300 ease-out transform translate-y-0 opacity-100 ${bgClass}`}
              style={{
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
              }}
            >
              <div className="flex items-start gap-3">
                {icon}
                <div className="text-sm font-medium leading-relaxed pr-2">
                  {t.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-600 transition shrink-0 p-0.5 rounded"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { toast };
  }
  return context;
}
