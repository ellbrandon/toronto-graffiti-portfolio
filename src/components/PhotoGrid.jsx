import React from 'react';

const PhotoGrid = ({ photos, onPhotoClick }) => {
    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            <div style={{
                columnCount: 3,
                columnGap: '20px',
                // Responsive column count handled via media queries in CSS if needed, 
                // but inline styles are tricky for media queries. 
                // We'll add a class for responsiveness in index.css later.
            }} className="masonry-grid">
                {photos.map((photo, index) => (
                    <div
                        key={photo.id}
                        className="fade-in"
                        style={{
                            breakInside: 'avoid',
                            marginBottom: '20px',
                            cursor: 'zoom-in',
                            position: 'relative',
                            overflow: 'hidden',
                            animationDelay: `${index * 0.05}s` // Staggered animation
                        }}
                        onClick={() => onPhotoClick(photo)}
                    >
                        <div className="img-wrapper" style={{ position: 'relative' }}>
                            <img
                                src={photo.url}
                                alt={`${photo.style} at ${photo.location}`}
                                style={{
                                    width: '100%',
                                    display: 'block',
                                    filter: 'grayscale(100%) contrast(110%)',
                                    transition: 'all 0.5s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.filter = 'grayscale(0%) contrast(100%)';
                                    e.currentTarget.style.transform = 'scale(1.02)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.filter = 'grayscale(100%) contrast(110%)';
                                    e.currentTarget.style.transform = 'scale(1)';
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
        .img-wrapper:hover .overlay {
          opacity: 1;
        }
        @media (max-width: 1024px) {
          .masonry-grid { column-count: 2 !important; }
        }
        @media (max-width: 600px) {
          .masonry-grid { column-count: 1 !important; }
        }
      `}</style>
        </div>
    );
};

export default PhotoGrid;
