import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Icon } from './ui/AnimatedIcon';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
                            pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white transition-all transform animate-in slide-in-from-right
                            ${toast.type === 'success' ? 'bg-green-600' : ''}
                            ${toast.type === 'error' ? 'bg-red-600' : ''}
                            ${toast.type === 'warning' ? 'bg-yellow-600' : ''}
                            ${toast.type === 'info' ? 'bg-blue-600' : ''}
                        `}
                    >
                        {toast.type === 'success' && <Icon.CheckCircle className="w-5 h-5" />}
                        {toast.type === 'error' && <Icon.AlertTriangle className="w-5 h-5" />}
                        {toast.type === 'warning' && <Icon.AlertCircle className="w-5 h-5" />}
                        {toast.type === 'info' && <Icon.Info className="w-5 h-5" />}
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button onClick={() => removeToast(toast.id)} className="ml-2 hover:opacity-80">
                            <Icon.X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
