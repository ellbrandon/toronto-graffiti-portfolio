import { useLayout } from '../hooks/useLayout';
import ImageCursor, { useCursor } from './ImageCursor';

// Generic gallery showing one representative image per unique value of `field`.
// Props:
//   allPhotos  - full photo array
//   field      - key on photo object to group by, e.g. 'writer', 'what', 'where'
//   values     - sorted array of unique values for that field
//   onSelect   - called with the chosen value when a card is clicked
//   layoutMode - 'masonry' | 'grid' | 'single' | 'full'

const GalleryCard = ({ value, photo, onSelect }) => {
    const { cursorState, onMouseMove, onMouseEnter, onMouseLeave } = useCursor();
    return (
        <div
            className="gallery-item"
            onClick={() => onSelect(value)}
            onMouseMove={onMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className="gallery-item-inner">
                <img src={photo.url} alt={value} loading="lazy" decoding="async" />
                <div className="gallery-item-overlay">
                    <p className="gallery-item-label">{value}</p>
                </div>
                <ImageCursor x={cursorState.x} y={cursorState.y} visible={cursorState.visible} />
            </div>
        </div>
    );
};

const AllGallery = ({ allPhotos, field, values, onSelect, layoutMode }) => {
    const cards = values.map(value => ({
        value,
        photo: allPhotos.find(p => p[field] === value),
    })).filter(c => c.photo);

    // Include the first value in deps so reordering (alpha/random) triggers a re-layout
    const gridRef = useLayout('.gallery-item', '.gallery-sizer', [cards.length, cards[0]?.value, layoutMode]);

    return (
        <div className="allgallery-wrapper">
            <div
                ref={gridRef}
                className={`layout-${layoutMode}`}
            >
                {layoutMode === 'masonry' && <div className="gallery-sizer" />}

                {cards.map(({ value, photo }) => (
                    <GalleryCard
                        key={value}
                        value={value}
                        photo={photo}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
};

export default AllGallery;
