import React, { useEffect, useRef, useState, useCallback } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

const PhotoGrid = ({ photos, onPhotoClick, colorMode }) => {
    const gridRef = useRef(null);
    const masonryRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!gridRef.current) return;

        // Initialize Masonry only once
        if (!masonryRef.current) {
            masonryRef.current = new Masonry(gridRef.current, {
                itemSelector: '.grid-item',
                columnWidth: '.grid-sizer',
                percentPosition: true,
                gutter: 20,
                transitionDuration: 0 // Disable animation for performance/sync
            });
        }

        // 1. Tell Masonry about new DOM elements immediately
        masonryRef.current.reloadItems();
        masonryRef.current.layout();

        // 2. Monitor image loading within the grid
        const imgLoad = imagesLoaded(gridRef.current);

        // Fix: Only call layout() on progress, not reloadItems()
        imgLoad.on('progress', () => {
            if (masonryRef.current) {
                masonryRef.current.layout();
            }
        });

        imgLoad.on('always', () => {
            if (masonryRef.current) {
                masonryRef.current.layout();
                setIsReady(true);
            }
        });

        // 3. Safety timeout for edge cases (cached images, slow render)
        const timeoutId = setTimeout(() => {
            if (masonryRef.current) {
                masonryRef.current.layout();
            }
        }, 500);

        return () => {
            imgLoad.off('progress');
            imgLoad.off('always');
            clearTimeout(timeoutId);
        };
    }, [photos]);

    // Cleanup on unmount only
    useEffect(() => {
        return () => {
            if (masonryRef.current) {
                masonryRef.current.destroy();
                masonryRef.current = null;
            }
        };
    }, []);

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div
                ref={gridRef}
                style={{
                    opacity: 1,
                    transition: 'none'
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
                            cursor: 'none', // Managed by MagicCursor
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={() => onPhotoClick(photo)}
                    >
                        <div className="img-wrapper" style={{ position: 'relative' }}>
                            <img
                                src={photo.url}
                                alt={`${photo.style} at ${photo.location}`}
                                className={`photo-img ${colorMode ? 'color-mode' : 'grayscale-mode'}`}
                                // loading="lazy"
                                // decoding="async"
                                style={{
                                    width: '100%',
                                    display: 'block',
                                    transformOrigin: 'center'
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
        /* Image fade-in effect */
        .photo-img {
          opacity: 1;
          filter: grayscale(100%) contrast(110%);
          transition: filter 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        /* Grayscale mode (default) */
        .grayscale-mode {
          filter: grayscale(100%) contrast(110%);
        }

        .grayscale-mode:hover {
          filter: grayscale(0%) contrast(100%) brightness(1.1);
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }

        /* Color mode */
        .color-mode {
          filter: grayscale(0%) contrast(100%);
        }

        .color-mode:hover {
          filter: grayscale(100%) contrast(110%);
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
        }

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
