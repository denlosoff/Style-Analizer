
import React, { useMemo, useState } from 'react';
import type { SpaceData, Axis } from '../types';
import Modal from './common/Modal';
import { useTranslation } from '../i18n/i18n';
import { calculateCorrelationMatrix } from '../utils/statistics';

interface CorrelationModalProps {
    spaceData: SpaceData;
    onClose: () => void;
}

interface CorrelatedPair {
    axis1: Axis;
    axis2: Axis;
    value: number;
}

const getBadgeColor = (value: number): string => {
    if (value >= 0.7) return 'bg-green-600 text-white';
    if (value >= 0.3) return 'bg-green-800 text-green-200';
    if (value <= -0.7) return 'bg-red-600 text-white';
    if (value <= -0.3) return 'bg-red-800 text-red-200';
    return 'bg-gray-600 text-gray-200';
};

const CorrelationModal: React.FC<CorrelationModalProps> = ({ spaceData, onClose }) => {
    const { t } = useTranslation();
    const { axes, styles } = spaceData;
    const [threshold, setThreshold] = useState(0.5);

    const correlatedPairs: CorrelatedPair[] = useMemo(() => {
        if (axes.length < 2) return [];

        const matrix = calculateCorrelationMatrix(axes, styles);
        const pairs: CorrelatedPair[] = [];

        for (let i = 0; i < axes.length; i++) {
            for (let j = i + 1; j < axes.length; j++) {
                const axis1 = axes[i];
                const axis2 = axes[j];
                const value = matrix[axis1.id]?.[axis2.id];

                if (value !== null && Math.abs(value) >= threshold) {
                    pairs.push({ axis1, axis2, value });
                }
            }
        }
        
        return pairs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    }, [axes, styles, threshold]);

    if (axes.length < 2) {
        return (
            <Modal title={t('correlationModal.title')} onClose={onClose}>
                <p>{t('correlationModal.notEnoughAxes')}</p>
            </Modal>
        );
    }
    
    return (
        <Modal title={t('correlationModal.title')} onClose={onClose} size="lg">
            <div className="space-y-4">
                <p className="text-gray-400">{t('correlationModal.descriptionList')}</p>
                
                {/* Threshold Slider */}
                <div className="space-y-2">
                    <label htmlFor="correlation-threshold" className="block text-sm font-medium text-gray-300">
                        {t('correlationModal.thresholdLabel')}: <span className="font-bold text-white">{threshold.toFixed(2)}</span>
                    </label>
                    <input
                        id="correlation-threshold"
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={threshold}
                        onChange={(e) => setThreshold(parseFloat(e.target.value))}
                        className="w-full"
                    />
                </div>

                {/* Correlated Pairs List */}
                <div className="max-h-[50vh] overflow-y-auto pr-2">
                    {correlatedPairs.length > 0 ? (
                        <ul className="space-y-3">
                            {correlatedPairs.map(({ axis1, axis2, value }) => (
                                <li key={`${axis1.id}-${axis2.id}`} className="p-3 bg-gray-900/50 rounded-lg flex items-center justify-between gap-4">
                                    <div className="flex flex-col flex-1">
                                        <span className="font-semibold truncate" title={axis1.name}>{axis1.name}</span>
                                        <span className="text-gray-400 text-xs my-0.5">vs.</span>
                                        <span className="font-semibold truncate" title={axis2.name}>{axis2.name}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full font-mono text-lg font-bold ${getBadgeColor(value)}`}>
                                        {value.toFixed(2)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            {t('correlationModal.noSignificantCorrelation', { threshold: threshold.toFixed(2) })}
                        </div>
                    )}
                </div>

                 {/* Legend */}
                 <div className="flex flex-wrap gap-x-4 gap-y-2 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2"><div className="w-5 h-5 rounded bg-green-600"></div><span>{t('correlationModal.legendStrongPositive')}</span></div>
                    <div className="flex items-center space-x-2"><div className="w-5 h-5 rounded bg-green-800"></div><span>{t('correlationModal.legendModeratePositive')}</span></div>
                    <div className="flex items-center space-x-2"><div className="w-5 h-5 rounded bg-gray-600"></div><span>{t('correlationModal.legendWeak')}</span></div>
                    <div className="flex items-center space-x-2"><div className="w-5 h-5 rounded bg-red-800"></div><span>{t('correlationModal.legendModerateNegative')}</span></div>
                    <div className="flex items-center space-x-2"><div className="w-5 h-5 rounded bg-red-600"></div><span>{t('correlationModal.legendStrongNegative')}</span></div>
                 </div>
            </div>
        </Modal>
    );
};

export default CorrelationModal;
