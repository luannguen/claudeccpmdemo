import { Loader2, CheckCircle, AlertCircle, AlertTriangle, Info, Ban, Bell, Send, Plus, Minus, Trash, Edit, Save, X, Copy, Download, Upload } from 'lucide-react';

export const Icon = {
    Spinner: ({ className, ...props }) => <Loader2 className={`animate-spin ${className}`} {...props} />,
    CheckCircle: ({ className, ...props }) => <CheckCircle className={`text-green-500 ${className}`} {...props} />,
    AlertCircle: ({ className, ...props }) => <AlertCircle className={`text-red-500 ${className}`} {...props} />,
    AlertTriangle: ({ className, ...props }) => <AlertTriangle className={`text-yellow-500 ${className}`} {...props} />,
    Info: ({ className, ...props }) => <Info className={`text-blue-500 ${className}`} {...props} />,
    Ban: ({ className, ...props }) => <Ban className={`text-gray-500 ${className}`} {...props} />,
    Bell, Send, Plus, Minus, Trash, Edit, Save, X, Copy, Download, Upload
};
