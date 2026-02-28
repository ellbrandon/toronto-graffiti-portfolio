import { Frown } from 'lucide-react';
import { useLayout } from '../hooks/useLayout';

const PhotoCard = ({ photo, onPhotoClick, colorMode }) => {
    return (
        <div className="grid-item" onClick={() => onPhotoClick(photo)}>
            <div className="img-wrapper">
                <img
                    src={photo.url}
                    alt={`${photo.what} at ${photo.where}`}
                    className={`photo-img ${colorMode ? 'color-mode' : 'grayscale-mode'}`}
                    loading="lazy"
                    decoding="async"
                />
                <div className="overlay">
                    {photo.writers?.length > 0 && (
                        <p className="overlay-title">{photo.writers.join(' · ')}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const PhotoGrid = ({ photos, onPhotoClick, colorMode, onClearFilters }) => {
    const gridRef = useLayout('.grid-item', '.grid-sizer', [photos]);

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
            <div ref={gridRef} className="layout-masonry">
                <div className="grid-sizer" />
                {photos.map((photo) => (
                    <PhotoCard
                        key={photo.id}
                        photo={photo}
                        onPhotoClick={onPhotoClick}
                        colorMode={colorMode}
                    />
                ))}
            </div>
        </div>
    );
};

export default PhotoGrid;
