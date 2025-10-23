
import React, { PropsWithChildren } from 'react';
import { XIcon } from '../icons';

interface ModalProps {
    title: string;
    onClose: () => void;
    footer?: React.ReactNode;
    size?: 'md' | 'lg' | 'xl';
}

const Modal: React.FC<PropsWithChildren<ModalProps>> = ({ title, onClose, footer, children, size = 'md' }) => {
    const sizeClasses = {
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        xl: 'max-w-6xl',
    };
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className={`bg-gray-800 rounded-lg shadow-xl w-full flex flex-col max-h-[90vh] ${sizeClasses[size]}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                        <XIcon />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
                {footer && (
                    <div className="flex justify-end p-4 border-t border-gray-700">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
