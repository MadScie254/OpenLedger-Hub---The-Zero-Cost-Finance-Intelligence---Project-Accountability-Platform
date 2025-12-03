'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType, duration: number = 4000) => {
        const id = Math.random().toString(36).substring(7);
        const newToast: Toast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);
    }, []);

    const getToastStyles = (type: ToastType) => {
        const baseStyles = "backdrop-blur-xl border shadow-2xl";
        switch (type) {
            case 'success':
                return `${baseStyles} bg-emerald-500/20 border-emerald-400/50 text-emerald-100`;
            case 'error':
                return `${baseStyles} bg-red-500/20 border-red-400/50 text-red-100`;
            case 'warning':
                return `${baseStyles} bg-amber-500/20 border-amber-400/50 text-amber-100`;
            case 'info':
                return `${baseStyles} bg-blue-500/20 border-blue-400/50 text-blue-100`;
        }
    };

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.8 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 100, scale: 0.8 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25
                            }}
                            className={`${getToastStyles(toast.type)} px-6 py-4 rounded-xl min-w-[300px] max-w-[400px] pointer-events-auto relative overflow-hidden`}
                        >
                            <div className="flex items-start gap-3">
                                <div className="text-2xl flex-shrink-0 mt-0.5">
                                    {getIcon(toast.type)}
                                </div>
                                <p className="text-sm font-medium leading-relaxed flex-1">
                                    {toast.message}
                                </p>
                            </div>

                            {/* Progress bar */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-1 bg-white/30"
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: (toast.duration || 4000) / 1000, ease: 'linear' }}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
