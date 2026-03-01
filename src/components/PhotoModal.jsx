import { useEffect, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const photoAlt = (photo) => {
    const parts = [
        photo.writers?.length ? photo.writers.join(', ') : null,
        photo.what  || null,
        photo.where ? `in ${photo.where}` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Graffiti photo';
};

const PhotoModal = ({ photo, onClose, photos = [], onNavigate, onSelectFilter }) => {
    const [zoomed, setZoomed] = useState(false);
    const zoomedRef = useRef(false);
    const closeRef = useRef(null);

    // Keep ref in sync with state
    useEffect(() => { zoomedRef.current = zoomed; }, [zoomed]);

    // Reset zoom, lock scroll, and focus close button when photo changes
    useEffect(() => {
        if (!photo) return;
        setZoomed(false);
        document.body.style.overflow = 'hidden';
        // Move focus into the modal
        const t = setTimeout(() => { closeRef.current?.focus(); }, 50);
        return () => { document.body.style.overflow = 'unset'; clearTimeout(t); };
    }, [photo]);

    // Keyboard handler
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
    const alt = photoAlt(photo);

    if (zoomed) {
        return (
            <div
                className="modal-zoom-overlay"
                role="dialog"
                aria-modal="true"
                aria-label="Zoomed photo"
                onClick={() => setZoomed(false)}
            >
                <button
                    className="modal-close-btn"
                    onClick={() => setZoomed(false)}
                    aria-label="Close zoomed view"
                    ref={closeRef}
                >
                    <X size={32} aria-hidden="true" />
                </button>
                <img
                    src={photo.url}
                    alt={alt}
                    className="modal-zoom-photo"
                />
            </div>
        );
    }

    return (
        <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={onClose}
        >
            <button
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Close photo"
                ref={closeRef}
            >
                <X size={32} aria-hidden="true" />
            </button>

            {hasPrevious && (
                <button
                    className="modal-nav-btn modal-nav-btn--prev"
                    onClick={(e) => { e.stopPropagation(); onNavigate(photos[currentIndex - 1]); }}
                    aria-label="Previous photo"
                >
                    <ChevronLeft size={32} aria-hidden="true" />
                </button>
            )}

            {hasNext && (
                <button
                    className="modal-nav-btn modal-nav-btn--next"
                    onClick={(e) => { e.stopPropagation(); onNavigate(photos[currentIndex + 1]); }}
                    aria-label="Next photo"
                >
                    <ChevronRight size={32} aria-hidden="true" />
                </button>
            )}

            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button
                    className="modal-photo-wrapper"
                    onClick={() => setZoomed(true)}
                    aria-label="Zoom photo"
                >
                    <img
                        src={photo.url}
                        alt={alt}
                        className="modal-photo"
                    />
                </button>
                <div className="modal-tags" role="group" aria-label="Filter by writer">
                    {photo.writers.map(writer => (
                        <button
                            key={writer}
                            className="btn-ghost"
                            onClick={() => { onSelectFilter('writer', writer); onClose(); }}
                            aria-label={`Filter by writer: ${writer}`}
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
