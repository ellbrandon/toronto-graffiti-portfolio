import { useEffect, useRef } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

export function useLayout(itemSelector, sizerSelector, deps = []) {
    const gridRef = useRef(null);
    const masonryRef = useRef(null);

    useEffect(() => {
        if (!gridRef.current) return;

        if (masonryRef.current) {
            masonryRef.current.destroy();
            masonryRef.current = null;
        }

        masonryRef.current = new Masonry(gridRef.current, {
            itemSelector,
            columnWidth: sizerSelector,
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
            if (masonryRef.current) {
                masonryRef.current.destroy();
                masonryRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        return () => {
            if (masonryRef.current) {
                masonryRef.current.destroy();
                masonryRef.current = null;
            }
        };
    }, []);

    return gridRef;
}
