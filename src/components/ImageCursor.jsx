import { useState, useCallback } from 'react';

// Renders the custom crosshair cursor inside an image card.
// Usage: wrap card content with a relative-positioned container and
// attach the handlers from useCursor() to that container.

export function useCursor() {
    const [state, setState] = useState({ x: 0, y: 0, visible: false });

    const onMouseMove = useCallback((e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setState(s => ({ ...s, x: e.clientX - rect.left, y: e.clientY - rect.top }));
    }, []);

    const onMouseEnter = useCallback(() => setState(s => ({ ...s, visible: true })), []);
    const onMouseLeave = useCallback(() => setState(s => ({ ...s, visible: false })), []);

    return { cursorState: state, onMouseMove, onMouseEnter, onMouseLeave };
}

const ImageCursor = ({ x, y, visible }) => (
    <div
        className={`img-cursor${visible ? ' img-cursor--visible' : ''}`}
        style={{ left: x, top: y }}
    >
        <svg width="50" height="50" viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="23" />
        </svg>
    </div>
);

export default ImageCursor;
