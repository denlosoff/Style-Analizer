import React, { useState } from 'react';
import Modal from './common/Modal';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface ImageViewerModalProps {
    images: string[];
    onClose: () => void;
    initialIndex?: number;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ images, onClose, initialIndex = 0 }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const goToPrevious = () => {
        const isFirstImage = currentIndex === 0;
        const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastImage = currentIndex === images.length - 1;
        const newIndex = isLastImage ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    return (
        <Modal title={`Image Viewer (${currentIndex + 1} / ${images.length})`} onClose={onClose}>
            <div className="relative h-[70vh]">
                <div className="h-full w-full flex items-center justify-center">
                    <img 
                        src={images[currentIndex]} 
                        alt={`Style image ${currentIndex + 1}`} 
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
                {images.length > 1 && (
                    <>
                        <button onClick={goToPrevious} className="absolute top-1/2 left-4 -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75">
                            <ChevronLeftIcon />
                        </button>
                        <button onClick={goToNext} className="absolute top-1/2 right-4 -translate-y-1/2 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75">
                            <ChevronRightIcon />
                        </button>
                    </>
                )}
            </div>
        </Modal>
    );
};

export default ImageViewerModal;