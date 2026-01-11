import {
    Loader2, CheckCircle, AlertCircle, AlertTriangle, Info, Ban,
    Bell, Send, Plus, Minus, Trash, Edit, Save, X, Copy, Download, Upload,
    ShoppingCart, ShieldCheck, LayoutGrid, Lock, Users, Building, Shield, Globe
} from 'lucide-react';
import type { ComponentProps } from 'react';

type IconProps = ComponentProps<'svg'>;

export const Icon = {
    Spinner: ({ className, ...props }: IconProps) => <Loader2 className={`animate-spin ${className}`} {...props} />,
    CheckCircle: ({ className, ...props }: IconProps) => <CheckCircle className={`text-green-500 ${className}`} {...props} />,
    AlertCircle: ({ className, ...props }: IconProps) => <AlertCircle className={`text-red-500 ${className}`} {...props} />,
    AlertTriangle: ({ className, ...props }: IconProps) => <AlertTriangle className={`text-yellow-500 ${className}`} {...props} />,
    Info: ({ className, ...props }: IconProps) => <Info className={`text-blue-500 ${className}`} {...props} />,
    Ban: ({ className, ...props }: IconProps) => <Ban className={`text-gray-500 ${className}`} {...props} />,

    // Logic / UI Icons
    Bell, Send, Plus, Minus, Trash, Edit, Save, X, Copy, Download, Upload,
    ShoppingCart, ShieldCheck, LayoutGrid, Lock, Users, Building, Shield, Globe, Loader2
};
