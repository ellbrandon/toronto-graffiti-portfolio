import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const PhotoModal = ({ photo, onClose }) => {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    if (!photo) return null;

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
                    zIndex: 1001
                }}
            >
                <X size={32} />
            </button>

            <div
                style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
            >
                <img
                    src={photo.url}
                    alt={`${photo.style} at ${photo.location}`}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '85vh',
                        objectFit: 'contain',
                        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                    }}
                />
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{photo.location}</h2>
                    <p style={{ color: '#888' }}>
                        <span style={{ color: '#fff' }}>{photo.author}</span> • {photo.style}
                    </p>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {photo.tags.map(tag => (
                            <span key={tag} style={{
                                fontSize: '0.8rem',
                                padding: '4px 8px',
                                border: '1px solid #333',
                                borderRadius: '4px',
                                color: '#888'
                            }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhotoModal;
