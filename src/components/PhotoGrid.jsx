import { useState, useEffect, useRef } from 'react';
import { Frown } from 'lucide-react';
import { useLayout } from '../hooks/useLayout';

const INITIAL_COUNT = 48; // multiple of 3 columns
const INCREMENT     = 30;

const PhotoCard = ({ photo, onPhotoClick, colorMode }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className="grid-item" onClick={() => onPhotoClick(photo)}>
            <div className="img-wrapper">
                <img
                    src={photo.url}
                    alt={`${photo.what} at ${photo.where}`}
                    className={`photo-img ${colorMode ? 'color-mode' : 'grayscale-mode'}${loaded ? ' photo-img--loaded' : ''}`}
                    decoding="async"
                    onLoad={() => setLoaded(true)}
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
    const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
    const prevVisibleCount = useRef(INITIAL_COUNT);
    const sentinelRef = useRef(null);
    const { gridRef, reinit, appendItems } = useLayout('.grid-item', '.grid-sizer');

    // Reset and reinit masonry when the photo list changes (filter/sort)
    useEffect(() => {
        const scroller = document.querySelector('.main-content') ?? window;
        scroller.scrollTo({ top: 0, behavior: 'instant' });
        setVisibleCount(INITIAL_COUNT);
        prevVisibleCount.current = INITIAL_COUNT;
        // Reinit after React has flushed the new DOM and masonry has initialised
        const t = setTimeout(() => reinit(), 80);
        return () => clearTimeout(t);
    }, [photos, reinit]);

    // After each increment, appended() only the new nodes
    useEffect(() => {
        const prev = prevVisibleCount.current;
        const next = visibleCount;
        if (next <= prev) return; // reset case — reinit handles it

        // Wait for React to flush the new grid-item nodes
        const t = setTimeout(() => {
            if (!gridRef.current) return;
            const allItems = gridRef.current.querySelectorAll('.grid-item');
            const newNodes = Array.from(allItems).slice(prev);
            if (newNodes.length) appendItems(newNodes);
            prevVisibleCount.current = next;
        }, 0);
        return () => clearTimeout(t);
    }, [visibleCount, appendItems, gridRef]);

    // IntersectionObserver — append more items when sentinel enters viewport
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(c => Math.min(c + INCREMENT, photos.length));
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [photos.length]);

    const visiblePhotos = photos.slice(0, visibleCount);

    return (
        <>
            {photos.length === 0 && (
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
            )}
            <div className="photo-grid-wrapper" style={photos.length === 0 ? { display: 'none' } : undefined}>
                <div ref={gridRef} className="layout-masonry">
                    <div className="grid-sizer" />
                    {visiblePhotos.map((photo) => (
                        <PhotoCard
                            key={photo.id}
                            photo={photo}
                            onPhotoClick={onPhotoClick}
                            colorMode={colorMode}
                        />
                    ))}
                </div>
                {visibleCount < photos.length && (
                    <div ref={sentinelRef} className="photo-grid-sentinel" />
                )}
            </div>
        </>
    );
};

export default PhotoGrid;
