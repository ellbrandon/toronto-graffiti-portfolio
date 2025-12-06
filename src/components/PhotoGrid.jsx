import React, { useEffect, useRef, useState, useCallback } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

const PhotoGrid = ({ photos, onPhotoClick, colorMode, layoutMode }) => {
    const gridRef = useRef(null);
    const masonryRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    // Initial load/Layout change effect
    useEffect(() => {
        if (!gridRef.current) return;

        // Cleanup function for Masonry
        const cleanupMasonry = () => {
            if (masonryRef.current) {
                masonryRef.current.destroy();
                masonryRef.current = null;
            }
        };

        if (layoutMode === 'masonry') {
            // Initialize Masonry
            if (!masonryRef.current) {
                masonryRef.current = new Masonry(gridRef.current, {
                    itemSelector: '.grid-item',
                    columnWidth: '.grid-sizer',
                    percentPosition: true,
                    gutter: 20,
                    transitionDuration: 0
                });
            }

            masonryRef.current.reloadItems();
            masonryRef.current.layout();

            const imgLoad = imagesLoaded(gridRef.current);
            imgLoad.on('progress', () => {
                if (masonryRef.current) {
                    masonryRef.current.layout();
                }
            });

            // Safety timeout
            const timeoutId = setTimeout(() => {
                if (masonryRef.current) {
                    masonryRef.current.layout();
                }
            }, 500);

            return () => {
                imgLoad.off('progress');
                clearTimeout(timeoutId);
                // We don't destroy masonry here to allow for smooth updates, 
                // but we will if layoutMode changes in the next run due to dependency
            };

        } else {
            // Not masonry mode, ensure masonry is destroyed so CSS Grid/Flex works
            cleanupMasonry();
            // Reset inline styles left by Masonry
            const items = gridRef.current.querySelectorAll('.grid-item');
            items.forEach(item => {
                item.style.position = '';
                item.style.left = '';
                item.style.top = '';
            });
            gridRef.current.style.height = ''; // Reset container height set by Masonry
        }
    }, [photos, layoutMode]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (masonryRef.current) {
                masonryRef.current.destroy();
                masonryRef.current = null;
            }
        };
    }, []);

    const getGridStyle = () => {
        if (layoutMode === 'grid') {
            return {
                display: 'grid',
                // gridTemplateColumns handled by CSS class for responsiveness
                gap: '20px',
            };
        }
        if (layoutMode === 'single') {
            return {
                display: 'flex',
                flexDirection: 'column',
                gap: '40px',
                maxWidth: '800px', // Constrain width for single column
                margin: '0 auto'
            };
        }
        if (layoutMode === 'full') {
            return {
                display: 'flex',
                flexDirection: 'column',
                gap: '40px',
                width: '100%',
                margin: '0'
            };
        }
        return {
            opacity: 1,
            transition: 'none'
        }; // Masonry default style
    };

    const getItemStyle = () => {
        if (layoutMode === 'grid') {
            return {
                width: '100%',
                marginBottom: 0,
                position: 'relative',
                aspectRatio: '1 / 1', // Square aspect ratio
                overflow: 'hidden'
            };
        }
        if (layoutMode === 'single') {
            return {
                width: '100%',
                marginBottom: 0,
                position: 'relative',
            };
        }
        if (layoutMode === 'full') {
            return {
                width: '100%',
                marginBottom: 0,
                position: 'relative',
            };
        }
        return {
            width: 'calc(33.333% - 14px)',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden'
        };
    };

    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div
                ref={gridRef}
                className={layoutMode === 'grid' ? 'layout-grid-active' : ''}
                style={getGridStyle()}
            >
                {/* Grid sizer for column width (only needed for Masonry) */}
                {layoutMode === 'masonry' && <div className="grid-sizer" style={{ width: 'calc(33.333% - 14px)' }}></div>}

                {photos.map((photo, index) => (
                    <div
                        key={photo.id}
                        className="grid-item"
                        style={getItemStyle()}
                        onClick={() => onPhotoClick(photo)}
                    >
                        <div className="img-wrapper" style={{ position: 'relative', width: '100%', height: '100%' }}>
                            <img
                                src={photo.url}
                                alt={`${photo.style} at ${photo.location}`}
                                className={`photo-img ${colorMode ? 'color-mode' : 'grayscale-mode'}`}
                                style={{
                                    width: '100%',
                                    height: '100%', // Fill container
                                    objectFit: layoutMode === 'grid' ? 'cover' : 'block', // Cover for square grid
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

        /* Grid Layout (Responsive) */
        .layout-grid-active {
            grid-template-columns: repeat(3, 1fr);
        }

        @media (max-width: 1024px) {
          .grid-sizer,
          .grid-item {
             /* Only override if in masonry mode */
            ${layoutMode === 'masonry' ? 'width: calc(50% - 10px) !important;' : ''}
          }
        }

        @media (max-width: 768px) {
          .layout-grid-active {
              grid-template-columns: repeat(2, 1fr);
          }

          .grid-sizer,
          .grid-item {
             /* Only override if in masonry mode */
            ${layoutMode === 'masonry' ? 'width: calc(50% - 10px) !important;' : ''}
          }
        }
      `}</style>
        </div>
    );
};

export default PhotoGrid;
