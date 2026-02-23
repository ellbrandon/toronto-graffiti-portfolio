import React from 'react';
import { Frown } from 'lucide-react';
import { useLayout } from '../hooks/useLayout';

const PhotoGrid = ({ photos, onPhotoClick, colorMode, layoutMode, onClearFilters }) => {
    const gridRef = useLayout('.grid-item', '.grid-sizer', [photos, layoutMode]);

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
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="overlay">
                                {photo.where || photo.writer ? (
                                    <>
                                        <p className="overlay-title">{photo.where}</p>
                                        <p className="overlay-subtitle">{photo.writer}</p>
                                    </>
                                ) : photo.description ? (
                                    <p className="overlay-title">{photo.description}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PhotoGrid;
