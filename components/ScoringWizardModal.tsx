import React, { useState } from 'react';
import type { Axis, Style } from '../types';
import Modal from './common/Modal';
import { AXIS_SCORE_MIN, AXIS_SCORE_MAX } from '../constants';
import { useTranslation } from '../i18n/i18n';

interface ScoringWizardModalProps {
    axis: Axis;
    styles: Style[];
    onComplete: (updatedStyles: Style[]) => void;
    onClose: () => void;
}

const ScoringWizardModal: React.FC<ScoringWizardModalProps> = ({ axis, styles, onComplete, onClose }) => {
    const { t } = useTranslation();
    const [scores, setScores] = useState<Record<string, number>>(() => {
        const initialScores: Record<string, number> = {};
        styles.forEach(style => {
            initialScores[style.id] = style.scores[axis.id] || 5;
        });
        return initialScores;
    });

    const handleScoreChange = (styleId: string, value: string) => {
        const newScore = parseFloat(value);
        if (!isNaN(newScore) && newScore >= AXIS_SCORE_MIN && newScore <= AXIS_SCORE_MAX) {
            setScores(prev => ({...prev, [styleId]: newScore}));
        }
    };
    
    const handleSave = () => {
        const updatedStyles = styles.map(style => ({
            ...style,
            scores: {
                ...style.scores,
                [axis.id]: scores[style.id]
            }
        }));
        onComplete(updatedStyles);
    };

    const footer = (
        <div className="space-x-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">{t('scoringWizardModal.cancelButton')}</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700">{t('scoringWizardModal.applyScoresButton')}</button>
        </div>
    );

    return (
        <Modal title={t('scoringWizardModal.title', { axisName: axis.name })} onClose={onClose} footer={footer}>
            <p className="mb-4 text-gray-400">{t('scoringWizardModal.description', { min: AXIS_SCORE_MIN, max: AXIS_SCORE_MAX })}</p>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {styles.map(style => (
                    <div key={style.id} className="grid grid-cols-3 items-center gap-4">
                        <label className="text-right font-medium">{style.name}</label>
                        <div className="col-span-2 flex items-center space-x-2">
                            <input
                                type="range"
                                min={AXIS_SCORE_MIN}
                                max={AXIS_SCORE_MAX}
                                step="0.1"
                                value={scores[style.id]}
                                onChange={(e) => handleScoreChange(style.id, e.target.value)}
                                className="w-full"
                            />
                            <input
                                type="number"
                                min={AXIS_SCORE_MIN}
                                max={AXIS_SCORE_MAX}
                                step="0.1"
                                value={scores[style.id]}
                                onChange={(e) => handleScoreChange(style.id, e.target.value)}
                                className="w-20 bg-gray-700 border border-gray-600 rounded-md p-1 text-center"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Modal>
    );
};

export default ScoringWizardModal;
