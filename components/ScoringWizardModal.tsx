import React, { useState } from 'react';
import type { Axis, Style } from '../types';
import Modal from './common/Modal';
import { AXIS_SCORE_MIN, AXIS_SCORE_MAX } from '../constants';
import { useTranslation } from '../i18n/i18n';
import { CameraIcon } from './icons';

interface ScoringWizardModalProps {
    axis: Axis;
    styles: Style[];
    onComplete: (updatedStyles: Style[]) => void;
    onClose: () => void;
    onViewImages: (images: string[], startIndex: number, generatedImageUrls?: string[]) => void;
}

const ScoringWizardModal: React.FC<ScoringWizardModalProps> = ({ axis, styles, onComplete, onClose, onViewImages }) => {
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
        // Allow empty input without setting score
        if (value === '') {
            setScores(prev => ({...prev, [styleId]: 5})); // Or some default
            return;
        }
        if (!isNaN(newScore)) {
            // Clamp value
            const clampedScore = Math.max(AXIS_SCORE_MIN, Math.min(AXIS_SCORE_MAX, newScore));
            setScores(prev => ({...prev, [styleId]: clampedScore}));
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
        <Modal title={t('scoringWizardModal.title', { axisName: axis.name })} onClose={onClose} footer={footer} size="lg">
            <p className="mb-4 text-gray-400">{t('scoringWizardModal.description', { min: AXIS_SCORE_MIN, max: AXIS_SCORE_MAX })}</p>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {styles.map(style => {
                    const coverImageUrl = style.images[style.coverImageIndex ?? 0];
                    const isAiGenerated = style.generatedImageUrls?.includes(coverImageUrl);
                    return (
                        <div key={style.id} className="grid grid-cols-[52px_1fr_auto] items-center gap-x-4 p-2 rounded-md hover:bg-gray-700/50">
                            {/* Column 1: Image */}
                            <div className="relative">
                                {style.images.length > 0 ? (
                                    <>
                                        <img
                                            src={coverImageUrl}
                                            alt={style.name}
                                            className="w-12 h-12 object-cover rounded-md cursor-pointer"
                                            onClick={() => onViewImages(style.images, style.coverImageIndex ?? 0, style.generatedImageUrls)}
                                            title={t('scoringWizardModal.viewImagesTooltip', { styleName: style.name })}
                                        />
                                        {isAiGenerated && (
                                            <div className="absolute bottom-1 right-1 bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded pointer-events-none">
                                                AI
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-12 h-12 bg-gray-900 rounded-md flex items-center justify-center text-gray-500" title={t('scoringWizardModal.noImagesTooltip')}>
                                        <CameraIcon className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            {/* Column 2: Name and Slider */}
                            <div className="w-full">
                                <label className="font-medium truncate block mb-1" title={style.name}>{style.name}</label>
                                <input
                                    type="range"
                                    min={AXIS_SCORE_MIN}
                                    max={AXIS_SCORE_MAX}
                                    step="0.1"
                                    value={scores[style.id]}
                                    onChange={(e) => handleScoreChange(style.id, e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            {/* Column 3: Number input */}
                            <div className="pt-5"> {/* align with slider */}
                                <input
                                    type="number"
                                    min={AXIS_SCORE_MIN}
                                    max={AXIS_SCORE_MAX}
                                    step="0.1"
                                    value={scores[style.id]}
                                    onChange={(e) => handleScoreChange(style.id, e.target.value)}
                                    className="w-20 bg-gray-900 border border-gray-600 rounded-md p-1 text-center"
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </Modal>
    );
};

export default ScoringWizardModal;