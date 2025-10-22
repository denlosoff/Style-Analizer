
import React from 'react';
import type { SpaceData } from '../types';
import { PlusIcon, TrashIcon, EditIcon, FileDownIcon, FileUpIcon, ListIcon, ListTree } from './icons';

interface SidebarProps {
    spaceData: SpaceData;
    dimension: 1 | 2 | 3;
    setDimension: (dim: 1 | 2 | 3) => void;
    activeAxisIds: (string | null)[];
    setActiveAxisIds: (ids: (string | null)[]) => void;
    selectedStyleId: string | null;
    setSelectedStyleId: (id: string | null) => void;
    onOpenStyleModal: (styleId: string | null) => void;
    onOpenAxisModal: (axisId: string | null) => void;
    onDeleteStyle: (styleId: string) => void;
    onDeleteAxis: (axisId: string) => void;
    onSaveProject: () => void;
    onLoadProject: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    spaceData,
    dimension,
    setDimension,
    activeAxisIds,
    setActiveAxisIds,
    selectedStyleId,
    setSelectedStyleId,
    onOpenStyleModal,
    onOpenAxisModal,
    onDeleteStyle,
    onDeleteAxis,
    onSaveProject,
    onLoadProject,
}) => {
    const handleAxisChange = (index: number, value: string) => {
        const newAxisIds = [...activeAxisIds];
        newAxisIds[index] = value === 'none' ? null : value;
        setActiveAxisIds(newAxisIds);
    };

    const renderAxisSelector = (index: number, label: string) => {
        const availableAxes = spaceData.axes.filter(ax => !activeAxisIds.includes(ax.id) || activeAxisIds[index] === ax.id);
        return (
            <div key={index} className="flex flex-col">
                <label className="text-sm font-medium text-gray-400 mb-1">{label} Axis</label>
                <select
                    value={activeAxisIds[index] || 'none'}
                    onChange={(e) => handleAxisChange(index, e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="none">-- None --</option>
                    {availableAxes.map(axis => (
                        <option key={axis.id} value={axis.id}>{axis.name}</option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <aside className="w-80 bg-gray-800 p-4 flex flex-col space-y-4 overflow-y-auto">
            <h1 className="text-2xl font-bold text-center">Style Visualizer</h1>
            
            {/* Project Controls */}
            <div className="bg-gray-700 p-3 rounded-lg">
                <h2 className="text-lg font-semibold mb-2 flex items-center"><ListIcon className="mr-2" /> Project</h2>
                <div className="flex space-x-2">
                    <button onClick={onLoadProject} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center">
                        <FileUpIcon className="mr-1" /> Load
                    </button>
                    <button onClick={onSaveProject} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-md text-sm flex items-center justify-center">
                        <FileDownIcon className="mr-1" /> Save
                    </button>
                </div>
            </div>

            {/* Visualization Controls */}
            <div className="bg-gray-700 p-3 rounded-lg space-y-3">
                <h2 className="text-lg font-semibold flex items-center"><ListTree className="mr-2" /> View Controls</h2>
                <div>
                    <label className="text-sm font-medium text-gray-400 mb-1 block">Dimension</label>
                    <div className="flex space-x-2">
                        <button onClick={() => setDimension(1)} className={`flex-1 py-2 rounded-md ${dimension === 1 ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>1D</button>
                        <button onClick={() => setDimension(2)} className={`flex-1 py-2 rounded-md ${dimension === 2 ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>2D</button>
                        <button onClick={() => setDimension(3)} className={`flex-1 py-2 rounded-md ${dimension === 3 ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}>3D</button>
                    </div>
                </div>
                {renderAxisSelector(0, 'X')}
                {dimension >= 2 && renderAxisSelector(1, 'Y')}
                {dimension === 3 && renderAxisSelector(2, 'Z')}
            </div>

            {/* Axes List */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Axes ({spaceData.axes.length})</h2>
                    <button onClick={() => onOpenAxisModal(null)} className="p-1 rounded-md bg-blue-600 hover:bg-blue-700"><PlusIcon /></button>
                </div>
                <ul className="space-y-1 overflow-y-auto flex-1">
                    {spaceData.axes.map(axis => (
                        <li key={axis.id} className="flex items-center justify-between p-2 rounded-md bg-gray-800 hover:bg-gray-600">
                            <span className="flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: axis.color }}></span>
                                {axis.name}
                            </span>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => onOpenAxisModal(axis.id)} className="p-1 text-gray-400 hover:text-white"><EditIcon /></button>
                                <button onClick={() => onDeleteAxis(axis.id)} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Styles List */}
            <div className="bg-gray-700 p-3 rounded-lg flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-semibold">Styles ({spaceData.styles.length})</h2>
                    <button onClick={() => onOpenStyleModal(null)} className="p-1 rounded-md bg-blue-600 hover:bg-blue-700"><PlusIcon /></button>
                </div>
                <ul className="space-y-1 overflow-y-auto flex-1">
                    {spaceData.styles.map(style => (
                        <li 
                            key={style.id}
                            onClick={() => setSelectedStyleId(style.id)}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${selectedStyleId === style.id ? 'bg-blue-800' : 'bg-gray-800 hover:bg-gray-600'}`}
                        >
                            <span>{style.name}</span>
                            <div className="flex items-center space-x-2">
                                <button onClick={(e) => { e.stopPropagation(); onOpenStyleModal(style.id); }} className="p-1 text-gray-400 hover:text-white"><EditIcon /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDeleteStyle(style.id); }} className="p-1 text-gray-400 hover:text-red-400"><TrashIcon /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
