import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './ui/AnimatedIcon';

interface EnhancedModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
    showControls?: boolean;
}

export default function EnhancedModal({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = '2xl',
    showControls = true
}: EnhancedModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        full: 'max-w-full m-4',
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                ref={modalRef}
                className={`
                    relative w-full ${maxWidthClasses[maxWidth]} 
                    bg-white dark:bg-gray-800 
                    rounded-xl shadow-2xl 
                    flex flex-col 
                    max-h-[90vh]
                    transform transition-all animate-in zoom-in-95 duration-200
                `}
            >
                {/* Header */}
                {(title || showControls) && (
                    <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        <div className="flex items-center gap-2">
                            {showControls && (
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-500 transition-colors"
                                >
                                    <Icon.X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
