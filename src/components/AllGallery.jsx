import React, { useEffect, useRef } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

// Generic gallery showing one representative image per unique value of `field`.
// Props:
//   allPhotos  - full photo array
//   field      - key on photo object to group by, e.g. 'writer', 'what', 'where'
//   values     - sorted array of unique values for that field
//   onSelect   - called with the chosen value when a card is clicked
//   layoutMode - 'masonry' | 'grid' | 'single' | 'full'
const AllGallery = ({ allPhotos, field, values, onSelect, layoutMode }) => {
    const gridRef = useRef(null);
    const masonryRef = useRef(null);

    // Build one representative card per value
    const cards = values.map(value => ({
        value,
        photo: allPhotos.find(p => p[field] === value),
    })).filter(c => c.photo);

    useEffect(() => {
        if (!gridRef.current) return;

        if (layoutMode === 'masonry') {
            if (masonryRef.current) { masonryRef.current.destroy(); masonryRef.current = null; }

            masonryRef.current = new Masonry(gridRef.current, {
                itemSelector: '.gallery-item',
                columnWidth: '.gallery-sizer',
                percentPosition: true,
                gutter: 20,
                transitionDuration: 0,
            });

            masonryRef.current.reloadItems();
            masonryRef.current.layout();

            const imgLoad = imagesLoaded(gridRef.current);
            imgLoad.on('progress', () => {
                if (masonryRef.current) masonryRef.current.layout();
            });

            const t = setTimeout(() => {
                if (masonryRef.current) masonryRef.current.layout();
            }, 500);

            return () => {
                imgLoad.off('progress');
                clearTimeout(t);
                if (masonryRef.current) { masonryRef.current.destroy(); masonryRef.current = null; }
            };
        } else {
            if (masonryRef.current) { masonryRef.current.destroy(); masonryRef.current = null; }
            const items = gridRef.current.querySelectorAll('.gallery-item');
            items.forEach(item => {
                item.style.position = '';
                item.style.left = '';
                item.style.top = '';
            });
            gridRef.current.style.height = '';
        }
    }, [cards.length, layoutMode]);

    return (
        <div className="allgallery-wrapper">
            <div
                ref={gridRef}
                className={`layout-${layoutMode}`}
            >
                {layoutMode === 'masonry' && <div className="gallery-sizer" />}

                {cards.map(({ value, photo }) => (
                    <div
                        key={value}
                        className="gallery-item"
                        onClick={() => onSelect(value)}
                    >
                        <div className="gallery-item-inner">
                            <img src={photo.url} alt={value} />
                            <div className="gallery-item-overlay">
                                <p className="gallery-item-label">{value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllGallery;
