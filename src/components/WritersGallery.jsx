import React, { useEffect, useRef } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

const WritersGallery = ({ allPhotos, writers, onSelectWriter, layoutMode }) => {
    const gridRef = useRef(null);
    const masonryRef = useRef(null);

    // Pick the first photo for each writer as their representative image
    const writerPhotos = writers.map(writer => ({
        writer,
        photo: allPhotos.find(p => p.writer === writer),
    })).filter(w => w.photo);

    useEffect(() => {
        if (!gridRef.current) return;

        if (layoutMode === 'masonry') {
            masonryRef.current = new Masonry(gridRef.current, {
                itemSelector: '.writer-item',
                columnWidth: '.writer-sizer',
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
            const items = gridRef.current.querySelectorAll('.writer-item');
            items.forEach(item => {
                item.style.position = 'relative'; // keep relative so absolute gradient overlay stays inside item
                item.style.left = '';
                item.style.top = '';
            });
            gridRef.current.style.height = '';
        }
    }, [writerPhotos.length, layoutMode]);

    const getGridStyle = () => {
        if (layoutMode === 'grid') {
            return {
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '20px',
            };
        }
        if (layoutMode === 'single') {
            return {
                display: 'flex',
                flexDirection: 'column',
                gap: '40px',
                maxWidth: '800px',
                margin: '0 auto',
            };
        }
        if (layoutMode === 'full') {
            return {
                display: 'flex',
                flexDirection: 'column',
                gap: '40px',
                width: '100%',
                margin: '0',
            };
        }
        // masonry
        return {};
    };

    const getItemStyle = () => {
        if (layoutMode === 'grid') {
            return {
                width: '100%',
                marginBottom: 0,
                position: 'relative',
                aspectRatio: '1 / 1',
                overflow: 'hidden',
            };
        }
        if (layoutMode === 'single' || layoutMode === 'full') {
            return {
                width: '100%',
                marginBottom: 0,
                position: 'relative',
                overflow: 'hidden',
            };
        }
        // masonry
        return {
            width: 'calc(33.333% - 14px)',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
        };
    };

    const getImageStyle = () => {
        const base = {
            display: 'block',
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        };
        if (layoutMode === 'grid') {
            // Fill the inner wrapper which fills the aspect-ratio outer item
            return { ...base, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' };
        }
        // masonry, single, full — natural image height
        return { ...base, width: '100%', height: 'auto' };
    };

    return (
        <div style={{ padding: '0 40px 100px' }}>
            <div
                ref={gridRef}
                className={layoutMode === 'grid' ? 'writers-layout-grid' : ''}
                style={getGridStyle()}
            >
                {layoutMode === 'masonry' && (
                    <div className="writer-sizer" style={{ width: 'calc(33.333% - 14px)' }} />
                )}

                {writerPhotos.map(({ writer, photo }) => (
                    <div
                        key={writer}
                        className="writer-item"
                        onClick={() => onSelectWriter(writer)}
                        style={{ ...getItemStyle(), cursor: 'pointer', borderRadius: '2px' }}
                    >
                        <div style={{ position: 'relative', width: '100%', height: layoutMode === 'grid' ? '100%' : 'auto' }}>
                            <img
                                src={photo.url}
                                alt={writer}
                                style={getImageStyle()}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: '30px 14px 14px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)',
                                pointerEvents: 'none',
                            }}>
                                <p style={{
                                    fontSize: '0.85rem',
                                    fontWeight: 'bold',
                                    color: '#fff',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}>
                                    {writer}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .writers-layout-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 600px) {
                    .writers-layout-grid { grid-template-columns: repeat(1, 1fr) !important; }
                }
            `}</style>
        </div>
    );
};

export default WritersGallery;
