import { useEffect, useRef } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

/**
 * Manages layout for a grid container across all four layout modes:
 *   'masonry' — JS-driven Masonry layout
 *   'grid'    — CSS grid (no JS needed)
 *   'single'  — CSS flex column, constrained width
 *   'full'    — CSS flex column, full width
 *
 * @param {string} itemSelector  - CSS selector for grid items, e.g. '.grid-item'
 * @param {string} sizerSelector - CSS selector for the sizer element, e.g. '.grid-sizer'
 * @param {Array}  deps          - Extra dependencies that should trigger a re-layout (e.g. [photos])
 * @returns {React.RefObject}    - Attach this ref to the grid container element
 */
export function useLayout(itemSelector, sizerSelector, deps = []) {
    const gridRef = useRef(null);
    const masonryRef = useRef(null);

    // Extract layoutMode from deps — by convention it's always the last element
    const layoutMode = deps[deps.length - 1];

    useEffect(() => {
        if (!gridRef.current) return;

        const destroyMasonry = () => {
            if (masonryRef.current) {
                masonryRef.current.destroy();
                masonryRef.current = null;
            }
        };

        if (layoutMode === 'masonry') {
            destroyMasonry();

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
                destroyMasonry();
            };
        } else {
            // Non-masonry modes: CSS handles layout; clear any leftover inline styles
            destroyMasonry();
            gridRef.current.querySelectorAll(itemSelector).forEach(item => {
                item.style.position = '';
                item.style.left = '';
                item.style.top = '';
            });
            gridRef.current.style.height = '';
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    // Cleanup on unmount
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
