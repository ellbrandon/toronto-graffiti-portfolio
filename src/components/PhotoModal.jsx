import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoModal = ({ photo, onClose, photos = [], onNavigate, onSelectFilter }) => {
    useEffect(() => {
        if (!photo) return;

        const handleKeyDown = (e) => {
            const currentIndex = photos.findIndex(p => p.id === photo.id);

            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                onNavigate(photos[currentIndex - 1]);
            } else if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) {
                onNavigate(photos[currentIndex + 1]);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [photo, photos, onClose, onNavigate]);

    if (!photo) return null;

    const currentIndex = photos.findIndex(p => p.id === photo.id);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < photos.length - 1;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <button className="modal-close-btn" onClick={onClose}>
                <X size={32} />
            </button>

            {hasPrevious && (
                <button
                    className="modal-nav-btn modal-nav-btn--prev"
                    onClick={(e) => { e.stopPropagation(); onNavigate(photos[currentIndex - 1]); }}
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {hasNext && (
                <button
                    className="modal-nav-btn modal-nav-btn--next"
                    onClick={(e) => { e.stopPropagation(); onNavigate(photos[currentIndex + 1]); }}
                >
                    <ChevronRight size={32} />
                </button>
            )}

            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <img
                    src={photo.url}
                    alt={`${photo.what} at ${photo.where}`}
                    className="modal-photo"
                />
                <div className="modal-tags">
                    {photo.writers.map(writer => (
                        <button
                            key={writer}
                            className="btn-ghost"
                            onClick={() => { onSelectFilter('writer', writer); onClose(); }}
                        >
                            {writer}
                        </button>
                    ))}
                    {[
                        { field: 'what',  value: photo.what },
                        { field: 'where', value: photo.where },
                    ].filter(({ value }) => value).map(({ field, value }) => (
                        <button
                            key={field}
                            className="btn-ghost"
                            onClick={() => { onSelectFilter(field, value); onClose(); }}
                        >
                            {value}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PhotoModal;
