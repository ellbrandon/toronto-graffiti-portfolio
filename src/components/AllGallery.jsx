import { useLayout } from '../hooks/useLayout';

// Generic gallery showing one representative image per unique value of `field`.
// Props:
//   allPhotos  - full photo array
//   field      - key on photo object to group by, e.g. 'writer', 'what', 'where'
//   values     - sorted array of unique values for that field
//   onSelect   - called with the chosen value when a card is clicked
//   layoutMode - 'masonry' | 'grid' | 'single' | 'full'
const AllGallery = ({ allPhotos, field, values, onSelect, layoutMode }) => {
    const cards = values.map(value => ({
        value,
        photo: allPhotos.find(p => p[field] === value),
    })).filter(c => c.photo);

    const gridRef = useLayout('.gallery-item', '.gallery-sizer', [cards.length, layoutMode]);

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
