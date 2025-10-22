
import React, { useState, useEffect } from 'react';
import type { Axis } from '../types';
import Modal from './common/Modal';
import { generateRandomColor } from '../utils/colorUtils';

interface AxisEditorModalProps {
    axis: Axis;
    onSave: (axis: Axis) => void;
    onClose: () => void;
}

const AxisEditorModal: React.FC<AxisEditorModalProps> = ({ axis, onSave, onClose }) => {
    const [formData, setFormData] = useState<Axis>(axis);

    useEffect(() => {
        if (!axis.color) {
            setFormData(prev => ({...prev, color: generateRandomColor()}))
        }
    }, [axis]);
    
    useEffect(() => {
        setFormData(axis);
    }, [axis]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700">Save Axis</button>
        </div>
    );
    
    return (
        <Modal title={axis.id ? 'Edit Axis' : 'Create Axis'} onClose={onClose} footer={footer}>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Axis Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Color</label>
                     <div className="flex items-center space-x-2 mt-1">
                        <input
                            type="color"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="p-1 h-10 w-10 block bg-gray-700 border-gray-600 cursor-pointer rounded-md"
                        />
                         <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleInputChange}
                            className="block w-full bg-gray-700 border border-gray-600 rounded-md p-2"
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
};

export default AxisEditorModal;
