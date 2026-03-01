import { useState } from 'react';

// Generic gallery showing one representative image per unique value of `field`.
// Props:
//   allPhotos  - full photo array
//   field      - key on photo object to group by, e.g. 'writer', 'what', 'where'
//   values     - sorted array of unique values for that field
//   onSelect   - called with the chosen value when a card is clicked

const GalleryCard = ({ value, photo, onSelect }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <button
            className="gallery-item"
            onClick={() => onSelect(value)}
            aria-label={`Filter by ${value}`}
        >
            <div className="gallery-item-inner">
                <img
                    src={photo.url}
                    alt={value}
                    loading="lazy"
                    decoding="async"
                    className={loaded ? 'gallery-img--loaded' : ''}
                    onLoad={() => setLoaded(true)}
                />
                <div className="gallery-item-overlay" aria-hidden="true">
                    <p className="gallery-item-label">{value}</p>
                </div>
            </div>
        </button>
    );
};

const AllGallery = ({ allPhotos, field, values, onSelect }) => {
    const cards = values.map(value => ({
        value,
        photo: field === 'writer'
            ? allPhotos.find(p => p.writers.includes(value))
            : allPhotos.find(p => p[field] === value),
    })).filter(c => c.photo);

    return (
        <div className="allgallery-wrapper">
            <div className="allgallery-grid" role="list" aria-label="Gallery categories">
                {cards.map(({ value, photo }) => (
                    <div key={value} role="listitem">
                        <GalleryCard
                            value={value}
                            photo={photo}
                            onSelect={onSelect}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AllGallery;
