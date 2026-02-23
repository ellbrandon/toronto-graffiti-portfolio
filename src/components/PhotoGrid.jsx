import React, { useEffect, useRef } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import { Frown } from 'lucide-react';

const PhotoGrid = ({ photos, onPhotoClick, colorMode, layoutMode, onClearFilters }) => {
    const gridRef = useRef(null);
    const masonryRef = useRef(null);

    useEffect(() => {
        if (!gridRef.current) return;

        const cleanupMasonry = () => {
            if (masonryRef.current) {
                masonryRef.current.destroy();
                masonryRef.current = null;
            }
        };

        if (layoutMode === 'masonry') {
            if (masonryRef.current) {
                masonryRef.current.destroy();
                masonryRef.current = null;
            }

            masonryRef.current = new Masonry(gridRef.current, {
                itemSelector: '.grid-item',
                columnWidth: '.grid-sizer',
                percentPosition: true,
                gutter: 20,
                transitionDuration: 0
            });

            masonryRef.current.reloadItems();
            masonryRef.current.layout();

            const imgLoad = imagesLoaded(gridRef.current);
            imgLoad.on('progress', () => {
                if (masonryRef.current) masonryRef.current.layout();
            });

            const timeoutId = setTimeout(() => {
                if (masonryRef.current) masonryRef.current.layout();
            }, 500);

            return () => {
                imgLoad.off('progress');
                clearTimeout(timeoutId);
            };

        } else {
            cleanupMasonry();
            const items = gridRef.current.querySelectorAll('.grid-item');
            items.forEach(item => {
                item.style.position = '';
                item.style.left = '';
                item.style.top = '';
            });
            gridRef.current.style.height = '';
        }
    }, [photos, layoutMode]);

    useEffect(() => {
        return () => {
            if (masonryRef.current) {
                masonryRef.current.destroy();
                masonryRef.current = null;
            }
        };
    }, []);

    if (photos.length === 0) {
        return (
            <div className="photo-grid-empty">
                <Frown size={48} strokeWidth={1} style={{ color: 'var(--grey)' }} />
                <p className="photo-grid-empty-title">No photos found</p>
                <p className="photo-grid-empty-subtitle">
                    No images match the current filters.<br />
                    Try adjusting your search or clearing a filter.
                </p>
                <button className="btn-primary" style={{ width: 'auto' }} onClick={onClearFilters}>
                    Clear all filters
                </button>
            </div>
        );
    }

    return (
        <div className="photo-grid-wrapper">
            <div
                ref={gridRef}
                className={`layout-${layoutMode}`}
            >
                {layoutMode === 'masonry' && <div className="grid-sizer" />}

                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        className="grid-item"
                        onClick={() => onPhotoClick(photo)}
                    >
                        <div className="img-wrapper">
                            <img
                                src={photo.url}
                                alt={`${photo.what} at ${photo.where}`}
                                className={`photo-img ${colorMode ? 'color-mode' : 'grayscale-mode'}`}
                                style={{ objectFit: layoutMode === 'grid' ? 'cover' : 'initial' }}
                            />
                            <div className="overlay">
                                <p className="overlay-title">{photo.where}</p>
                                <p className="overlay-subtitle">{photo.writer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhotoGrid;
