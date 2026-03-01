import { useEffect, useRef, useCallback } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

export function useLayout(itemSelector, sizerSelector) {
    const gridRef = useRef(null);
    const masonryRef = useRef(null);

    // Initialize masonry once on mount
    useEffect(() => {
        if (!gridRef.current) return;

        // Defer init slightly so the container has its final CSS dimensions
        const initTimer = setTimeout(() => {
            if (!gridRef.current) return;
            masonryRef.current = new Masonry(gridRef.current, {
                itemSelector,
                columnWidth: sizerSelector,
                percentPosition: true,
                gutter: 20,
                transitionDuration: 0,
                // Keep items hidden until first layout is complete to prevent CLS
                initLayout: false,
            });
            masonryRef.current.once('layoutComplete', () => {
                if (gridRef.current) gridRef.current.classList.add('masonry-ready');
            });
            masonryRef.current.layout();
        }, 50);

        return () => {
            clearTimeout(initTimer);
            if (masonryRef.current) {
                masonryRef.current.destroy();
                masonryRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Full reinit — call when the photo list is replaced (filter/sort change)
    const reinit = useCallback(() => {
        if (!gridRef.current || !masonryRef.current) return;

        // Hide items while masonry repositions, reveal on layoutComplete
        gridRef.current.classList.remove('masonry-ready');
        masonryRef.current.once('layoutComplete', () => {
            if (gridRef.current) gridRef.current.classList.add('masonry-ready');
        });

        masonryRef.current.reloadItems();
        masonryRef.current.layout();

        let debounceTimer = null;
        const scheduleLayout = () => {
            if (!masonryRef.current) return;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (masonryRef.current) masonryRef.current.layout();
            }, 80);
        };

        const imgLoad = imagesLoaded(gridRef.current);
        imgLoad.on('progress', scheduleLayout);

        const safetyTimer = setTimeout(() => {
            if (masonryRef.current) masonryRef.current.layout();
        }, 1200);

        // Return cleanup (caller handles if needed; not critical for reinit path)
        return () => {
            imgLoad.off('progress', scheduleLayout);
            clearTimeout(debounceTimer);
            clearTimeout(safetyTimer);
        };
    }, []);

    // Incremental append — call with the new DOM nodes when more items are added
    const appendItems = useCallback((newNodes) => {
        if (!masonryRef.current || !newNodes.length) return;

        masonryRef.current.appended(newNodes);

        let debounceTimer = null;
        const scheduleLayout = () => {
            if (!masonryRef.current) return;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                if (masonryRef.current) masonryRef.current.layout();
            }, 80);
        };

        // Watch only the new nodes for load events
        newNodes.forEach(node => {
            const imgs = node.querySelectorAll('img');
            imgs.forEach(img => {
                if (!img.complete) {
                    img.addEventListener('load', scheduleLayout, { once: true });
                    img.addEventListener('error', scheduleLayout, { once: true });
                }
            });
        });

        // Safety relayout
        const safetyTimer = setTimeout(() => {
            if (masonryRef.current) masonryRef.current.layout();
        }, 1200);

        return () => { clearTimeout(safetyTimer); };
    }, []);

    return { gridRef, reinit, appendItems };
}
