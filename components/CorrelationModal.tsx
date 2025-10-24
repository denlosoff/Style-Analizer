
import React, { useMemo } from 'react';
import type { SpaceData } from '../types';
import Modal from './common/Modal';
import { useTranslation } from '../i18n/i18n';
import { calculateCorrelationMatrix, CorrelationMatrix } from '../utils/statistics';

interface CorrelationModalProps {
    spaceData: SpaceData;
    onClose: () => void;
}

const getCellColor = (value: number | null): string => {
    if (value === null) return 'bg-gray-700';
    if (value >= 0.7) return 'bg-green-800';
    if (value >= 0.3) return 'bg-green-900';
    if (value <= -0.7) return 'bg-red-800';
    if (value <= -0.3) return 'bg-red-900';
    return 'bg-gray-800';
};

const CorrelationModal: React.FC<CorrelationModalProps> = ({ spaceData, onClose }) => {
    const { t } = useTranslation();
    const { axes, styles } = spaceData;

    const correlationMatrix: CorrelationMatrix = useMemo(() => {
        return calculateCorrelationMatrix(axes, styles);
    }, [axes, styles]);

    if (axes.length < 2) {
        return (
            <Modal title={t('correlationModal.title')} onClose={onClose}>
                <p>{t('correlationModal.notEnoughAxes')}</p>
            </Modal>
        );
    }
    
    return (
        <Modal title={t('correlationModal.title')} onClose={onClose} size="xl">
            <div className="space-y-4">
                <p className="text-gray-400">{t('correlationModal.description')}</p>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm text-center">
                        <thead>
                            <tr className="bg-gray-900">
                                <th className="p-2 border border-gray-700 sticky left-0 bg-gray-900 z-10"></th>
                                {axes.map(axis => (
                                    <th key={axis.id} className="p-2 border border-gray-700 whitespace-nowrap" title={axis.name}>
                                        <div className="w-24 truncate">{axis.name}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {axes.map(rowAxis => (
                                <tr key={rowAxis.id}>
                                    <th className="p-2 border border-gray-700 whitespace-nowrap sticky left-0 bg-gray-800 z-10" title={rowAxis.name}>
                                         <div className="w-24 truncate text-left">{rowAxis.name}</div>
                                    </th>
                                    {axes.map(colAxis => {
                                        const value = correlationMatrix[rowAxis.id]?.[colAxis.id] ?? null;
                                        return (
                                            <td 
                                                key={colAxis.id} 
                                                className={`p-2 border border-gray-700 font-mono ${getCellColor(value)} ${rowAxis.id === colAxis.id ? 'bg-gray-600' : ''}`}
                                            >
                                                {value !== null ? value.toFixed(2) : 'N/A'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 <div className="flex flex-wrap gap-4 pt-4">
                    <div className="flex items-center space-x-2"><div className="w-5 h-5 rounded bg-green-800"></div><span>{t('correlationModal.legendStrongPositive')} (&gt; 0.7)</span></div>
                    <div className="flex items-center space-x-2"><div className="w-5 h-5 rounded bg-green-900"></div><span>{t('correlationModal.legendModeratePositive')} (&gt; 0.3)</span></div>
                    <div className="flex items-center space-x-2"><div className="w-5 h-5 rounded bg-gray-800"></div><span>{t('correlationModal.legendWeak')}</span></div>
                    <div className="flex items-center space-x-2"><div className="w-5 h-5 rounded bg-red-900"></div><span>{t('correlationModal.legendModerateNegative')} (&lt; -0.3)</span></div>
                    <div className="flex items-center space-x-2"><div className="w-5 h-5 rounded bg-red-800"></div><span>{t('correlationModal.legendStrongNegative')} (&lt; -0.7)</span></div>
                 </div>
            </div>
        </Modal>
    );
};

export default CorrelationModal;
