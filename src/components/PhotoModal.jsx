import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const photoAlt = (photo) => {
    const parts = [
        photo.writers?.length ? photo.writers.join(', ') : null,
        photo.what  || null,
        photo.where ? `in ${photo.where}` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Graffiti photo';
};

const isTouch = () => window.matchMedia('(hover: none) and (pointer: coarse)').matches;

const TouchZoom = ({ photo, alt, onClose, closeRef }) => {
    const scale = useRef(1);
    const origin = useRef({ x: 0, y: 0 }); // pan offset
    const pointers = useRef([]);
    const lastDist = useRef(null);
    const lastMid = useRef(null);
    const imgRef = useRef(null);

    const applyTransform = useCallback(() => {
        if (imgRef.current) {
            imgRef.current.style.transform =
                `translate(${origin.current.x}px, ${origin.current.y}px) scale(${scale.current})`;
        }
    }, []);

    const onPointerDown = useCallback((e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        pointers.current.push({ id: e.pointerId, x: e.clientX, y: e.clientY });
    }, []);

    const onPointerMove = useCallback((e) => {
        const idx = pointers.current.findIndex(p => p.id === e.pointerId);
        if (idx === -1) return;
        pointers.current[idx] = { id: e.pointerId, x: e.clientX, y: e.clientY };

        if (pointers.current.length === 2) {
            const [a, b] = pointers.current;
            const dist = Math.hypot(b.x - a.x, b.y - a.y);
            const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };

            if (lastDist.current !== null) {
                const delta = dist / lastDist.current;
                scale.current = Math.min(Math.max(scale.current * delta, 1), 6);

                // Pan with midpoint movement
                if (lastMid.current) {
                    origin.current.x += mid.x - lastMid.current.x;
                    origin.current.y += mid.y - lastMid.current.y;
                }
            }
            lastDist.current = dist;
            lastMid.current = mid;
        } else if (pointers.current.length === 1 && scale.current > 1) {
            // Single-finger pan when zoomed in
            const prev = pointers.current[idx];
            // prev is already updated, use e.movementX/Y
            origin.current.x += e.movementX;
            origin.current.y += e.movementY;
        }
        applyTransform();
    }, [applyTransform]);

    const onPointerUp = useCallback((e) => {
        pointers.current = pointers.current.filter(p => p.id !== e.pointerId);
        if (pointers.current.length < 2) {
            lastDist.current = null;
            lastMid.current = null;
        }
        // Reset to fit if scale went below 1
        if (scale.current < 1) {
            scale.current = 1;
            origin.current = { x: 0, y: 0 };
            applyTransform();
        }
    }, [applyTransform]);

    return (
        <>
            <div
                className="modal-zoom-overlay modal-zoom-overlay--touch"
                role="dialog"
                aria-modal="true"
                aria-label="Zoomed photo"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ touchAction: 'none', overflow: 'hidden' }}
            >
                <div className="modal-zoom-photo-wrapper">
                    <img
                        ref={imgRef}
                        src={photo.url}
                        alt={alt}
                        className="modal-zoom-photo"
                        style={{ transformOrigin: 'center center', willChange: 'transform', transition: 'none' }}
                        draggable={false}
                    />
                </div>
            </div>
            {createPortal(
                <button
                    className="modal-close-btn modal-zoom-close-btn"
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    aria-label="Close zoomed view"
                    ref={closeRef}
                >
                    <X size={32} aria-hidden="true" />
                </button>,
                document.body
            )}
        </>
    );
};

const PhotoModal = ({ photo, onClose, photos = [], onNavigate, onSelectFilter }) => {
    const [zoomed, setZoomed] = useState(false);
    const zoomedRef = useRef(false);
    const closeRef = useRef(null);
    const zoomOverlayRef = useRef(null);

    // Keep ref in sync with state
    useEffect(() => { zoomedRef.current = zoomed; }, [zoomed]);

    // Reset zoom and focus close button when photo changes
    useEffect(() => {
        if (!photo) return;
        setZoomed(false);
        const t = setTimeout(() => { closeRef.current?.focus({ preventScroll: true }); }, 50);
        return () => clearTimeout(t);
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
        // Touch devices: custom pinch/pan so the close button is unaffected by zoom
        if (isTouch()) {
            return <TouchZoom photo={photo} alt={alt} onClose={() => setZoomed(false)} closeRef={closeRef} />;
        }

        // Desktop: full-resolution scrollable zoom
        return (
            <div
                ref={zoomOverlayRef}
                className="modal-zoom-overlay modal-zoom-overlay--desktop"
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
                <div className="modal-zoom-photo-wrapper">
                    <img
                        src={photo.url}
                        alt={alt}
                        className="modal-zoom-photo"
                        onLoad={() => {
                            const el = zoomOverlayRef.current;
                            if (el) el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
                        }}
                    />
                </div>
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
