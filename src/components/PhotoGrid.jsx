import React, { useEffect, useRef, useState } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

const PhotoGrid = ({ photos, onPhotoClick, colorMode }) => {
    const gridRef = useRef(null);
    const masonryRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!gridRef.current) return;

        // Initialize Masonry
        masonryRef.current = new Masonry(gridRef.current, {
            itemSelector: '.grid-item',
            columnWidth: '.grid-sizer',
            percentPosition: true,
            gutter: 20,
            transitionDuration: 0 // Disable animation on initial layout
        });

        // Wait for all images to load before showing
        const imgLoad = imagesLoaded(gridRef.current);

        imgLoad.on('progress', () => {
            masonryRef.current.layout();
        });

        imgLoad.on('done', () => {
            masonryRef.current.layout();
            // Small delay to ensure layout is completely stable
            setTimeout(() => {
                setIsReady(true);
            }, 100);
        });

        return () => {
            if (masonryRef.current) {
                masonryRef.current.destroy();
            }
        };
    }, [photos]);

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div
                ref={gridRef}
                style={{
                    opacity: isReady ? 1 : 0,
                    transition: 'opacity 0.5s ease-in'
                }}
            >
                {/* Grid sizer for column width */}
                <div className="grid-sizer" style={{ width: 'calc(33.333% - 14px)' }}></div>

                {photos.map((photo, index) => (
                    <div
                        key={photo.id}
                        className="grid-item"
                        style={{
                            width: 'calc(33.333% - 14px)',
                            marginBottom: '20px',
                            cursor: 'zoom-in',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={() => onPhotoClick(photo)}
                    >
                        <div className="img-wrapper" style={{ position: 'relative' }}>
                            <img
                                src={photo.url}
                                alt={`${photo.style} at ${photo.location}`}
                                style={{
                                    width: '100%',
                                    display: 'block',
                                    filter: colorMode
                                        ? 'grayscale(0%) contrast(100%)'
                                        : 'grayscale(100%) contrast(110%)',
                                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transformOrigin: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    if (colorMode) {
                                        // Color default: hover to grayscale
                                        e.currentTarget.style.filter = 'grayscale(100%) contrast(110%)';
                                    } else {
                                        // Grayscale default: hover to color
                                        e.currentTarget.style.filter = 'grayscale(0%) contrast(100%) brightness(1.1)';
                                    }
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 255, 255, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    if (colorMode) {
                                        // Return to color
                                        e.currentTarget.style.filter = 'grayscale(0%) contrast(100%)';
                                    } else {
                                        // Return to grayscale
                                        e.currentTarget.style.filter = 'grayscale(100%) contrast(110%)';
                                    }
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                            <div className="overlay" style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '20px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                pointerEvents: 'none'
                            }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{photo.location}</p>
                                <p style={{ fontSize: '0.8rem', color: '#ccc' }}>{photo.author}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
        .img-wrapper:hover .overlay {
          opacity: 1;
        }

        @media (max-width: 1024px) {
          .grid-sizer,
          .grid-item {
            width: calc(50% - 10px) !important;
          }
        }

        @media (max-width: 768px) {
          .grid-sizer,
          .grid-item {
            width: calc(50% - 10px) !important;
          }
        }
      `}</style>
        </div>
    );
};

export default PhotoGrid;
