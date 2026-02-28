import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const PhotoModal = ({ photo, onClose, photos = [], onNavigate, onSelectFilter }) => {
    const [zoomed, setZoomed] = useState(false);
    const zoomedRef = useRef(false);

    // Keep ref in sync with state
    useEffect(() => { zoomedRef.current = zoomed; }, [zoomed]);

    // Reset zoom and lock scroll when photo changes
    useEffect(() => {
        if (!photo) return;
        setZoomed(false);
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, [photo]);

    // Keyboard handler — never re-registers due to zoomed changes
    useEffect(() => {
        if (!photo) return;
        const handleKeyDown = (e) => {
            const currentIndex = photos.findIndex(p => p.id === photo.id);
            if (e.key === 'Escape') {
                if (zoomedRef.current) setZoomed(false);
                else onClose();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                onNavigate(photos[currentIndex - 1]);
            } else if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) {
                onNavigate(photos[currentIndex + 1]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [photo, photos, onClose, onNavigate]);

    if (!photo) return null;

    const currentIndex = photos.findIndex(p => p.id === photo.id);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < photos.length - 1;

    if (zoomed) {
        return (
            <div className="modal-zoom-overlay" onClick={() => setZoomed(false)}>
                <button className="modal-close-btn" onClick={() => setZoomed(false)}>
                    <X size={32} />
                </button>
                <img
                    src={photo.url}
                    alt={`${photo.what} at ${photo.where}`}
                    className="modal-zoom-photo"
                />
            </div>
        );
    }

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
                <div className="modal-photo-wrapper" onClick={() => setZoomed(true)}>
                    <img
                        src={photo.url}
                        alt={`${photo.what} at ${photo.where}`}
                        className="modal-photo"
                    />
                </div>
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
                </div>
            </div>
        </div>
    );
};

export default PhotoModal;
