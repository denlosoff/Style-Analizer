

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from './common/Modal';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { useTranslation } from '../i18n/i18n';

interface ImageViewerModalProps {
    images: string[];
    onClose: () => void;
    initialIndex?: number;
    generatedImageUrls?: string[];
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ images, onClose, initialIndex = 0, generatedImageUrls = [] }) => {
    const { t } = useTranslation();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const thumbnailContainerRef = useRef<HTMLDivElement>(null);

    const goToPrevious = useCallback(() => {
        setCurrentIndex(prevIndex => {
            const isFirstImage = prevIndex === 0;
            return isFirstImage ? images.length - 1 : prevIndex - 1;
        });
    }, [images.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex(prevIndex => {
            const isLastImage = prevIndex === images.length - 1;
            return isLastImage ? 0 : prevIndex + 1;
        });
    }, [images.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [goToPrevious, goToNext, onClose]);

    useEffect(() => {
        // Scroll thumbnail into view
        if (thumbnailContainerRef.current) {
            const activeThumbnail = thumbnailContainerRef.current.children[currentIndex] as HTMLElement;
            if (activeThumbnail) {
                activeThumbnail.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        }
    }, [currentIndex]);

    const isAiGenerated = generatedImageUrls.includes(images[currentIndex]);

    return (
        <Modal title={t('imageViewerModal.title', { current: currentIndex + 1, total: images.length })} onClose={onClose} size="xl">
            <div className="flex flex-col h-[80vh]">
                <div className="relative flex-grow flex items-center justify-center bg-black/20 rounded-md">
                    <img 
                        src={images[currentIndex]} 
                        alt={`Style image ${currentIndex + 1}`} 
                        className="max-h-full max-w-full object-contain"
                    />
                     {isAiGenerated && (
                        <div className="absolute bottom-2 right-2 bg-purple-600 text-white text-sm font-bold px-2 py-1 rounded pointer-events-none">
                            AI
                        </div>
                    )}
                     {images.length > 1 && (
                        <>
                            <button onClick={goToPrevious} className="absolute top-1/2 left-4 -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 text-white transition-opacity focus:outline-none focus:ring-2 focus:ring-white">
                                <ChevronLeftIcon />
                            </button>
                            <button onClick={goToNext} className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 text-white transition-opacity focus:outline-none focus:ring-2 focus:ring-white">
                                <ChevronRightIcon />
                            </button>
                        </>
                    )}
                </div>
                 {images.length > 1 && (
                    <div className="flex-shrink-0 pt-4">
                        <div ref={thumbnailContainerRef} className="flex p-2 space-x-2 bg-gray-900 rounded-md overflow-x-auto">
                           {images.map((img, index) => {
                                const isThumbAiGenerated = generatedImageUrls.includes(img);
                                return (
                                    <div key={index} className="relative flex-shrink-0">
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition-all ${currentIndex === index ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-500'}`}
                                            onClick={() => setCurrentIndex(index)}
                                        />
                                        {isThumbAiGenerated && (
                                            <div className="absolute bottom-1 right-1 bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded pointer-events-none">
                                                AI
                                            </div>
                                        )}
                                    </div>
                                );
                           })}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImageViewerModal;