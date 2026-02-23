import React, { useEffect, useCallback } from 'react';
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

    const handlePrevious = () => {
        if (hasPrevious) {
            onNavigate(photos[currentIndex - 1]);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            onNavigate(photos[currentIndex + 1]);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.95)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'fadeIn 0.3s ease'
            }}
            onClick={onClose}
        >
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    color: 'white',
                    padding: '10px',
                    zIndex: 1001,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                <X size={32} />
            </button>

            {/* Previous button */}
            {hasPrevious && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePrevious();
                    }}
                    style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                        padding: '10px',
                        zIndex: 1001,
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {/* Next button */}
            {hasNext && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                    }}
                    style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'white',
                        padding: '10px',
                        zIndex: 1001,
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
                >
                    <ChevronRight size={32} />
                </button>
            )}

            <div
                style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={photo.url}
                    alt={`${photo.what} at ${photo.where}`}
                    style={{
                        maxWidth: '100%',
                        maxHeight: 'calc(90vh - 120px)',
                        objectFit: 'contain',
                        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                    }}
                />
                <div style={{ textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {[
                        { field: 'writer', value: photo.writer },
                        { field: 'what',   value: photo.what },
                        { field: 'where',  value: photo.where },
                    ].map(({ field, value }) => (
                        <button
                            key={field}
                            onClick={() => { onSelectFilter(field, value); onClose(); }}
                            style={{
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '0',
                                color: '#fff',
                                fontSize: '0.8rem',
                                padding: '5px 12px',
                                cursor: 'pointer',
                                letterSpacing: '0.05em',
                                transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
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
