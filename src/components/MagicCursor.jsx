import React, { useEffect, useRef, useState } from 'react';

const MagicCursor = ({ darkMode, outerSize = 30, hoverScale = 1.5 }) => {
    const cursorOuterRef = useRef(null);
    const cursorInnerRef = useRef(null);
    const requestRef = useRef(null);
    const previousTimeRef = useRef(null);

    // Mouse position state
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    // Outer cursor position state for continuous animation
    const [outerPos, setOuterPos] = useState({ x: 0, y: 0 }); // Initial pos
    // Hover state
    const [isHovering, setIsHovering] = useState(false);
    const [isSidebar, setIsSidebar] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // Hide until first movement

    useEffect(() => {
        console.log("MagicCursor: Mounted. Adding class.");
        document.body.classList.add('magic-cursor-enabled');
        return () => {
            console.log("MagicCursor: Unmounted. Removing class.");
            document.body.classList.remove('magic-cursor-enabled');
        };
    }, []);

    useEffect(() => {
        const onMouseMove = (e) => {
            if (!isVisible) setIsVisible(true);
            setMousePos({ x: e.clientX, y: e.clientY });

            // Check if hovering over clickable elements
            const target = e.target;

            // Detect if inside sidebar/header to suppress zoom effect
            const insideSidebar = target.closest('.desktop-sidebar') || target.closest('.mobile-header');
            setIsSidebar(!!insideSidebar);

            const isClickable =
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') ||
                target.closest('button') ||
                target.classList.contains('grid-item') ||
                target.closest('.grid-item');

            setIsHovering(!!isClickable);
        };

        const onMouseEnter = () => setIsVisible(true);
        const onMouseLeave = () => setIsVisible(false);

        document.addEventListener('mousemove', onMouseMove);
        document.body.addEventListener('mouseenter', onMouseEnter);
        document.body.addEventListener('mouseleave', onMouseLeave);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.body.removeEventListener('mouseenter', onMouseEnter);
            document.body.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [isVisible]);

    // Animation loop for smooth trailing effect
    const animateCursor = (time) => {
        if (previousTimeRef.current !== undefined) {
            setOuterPos(prevOuter => {
                // Lerp factor (adjust for speed/lag)
                const lerp = 0.15;
                return {
                    x: prevOuter.x + (mousePos.x - prevOuter.x) * lerp,
                    y: prevOuter.y + (mousePos.y - prevOuter.y) * lerp
                };
            });
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animateCursor);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animateCursor);
        return () => cancelAnimationFrame(requestRef.current);
    }, [mousePos]); // Re-bind not strictly necessary via refs but keeps dependency clean

    // Styling constants
    const color = darkMode ? '255, 255, 255' : '0, 0, 0';
    const innerSize = 8;
    // outerSize used from props
    // hoverScale used from props

    if (!isVisible) return null;

    return (
        <>
            {/* Inner Dot - follows directly */}
            <div
                ref={cursorInnerRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: `${innerSize}px`,
                    height: `${innerSize}px`,
                    backgroundColor: `rgba(${color}, 1)`,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    transform: `translate(${mousePos.x - innerSize / 2}px, ${mousePos.y - innerSize / 2}px)`,
                    zIndex: 9999,
                    transition: 'width 0.2s, height 0.2s, background-color 0.3s'
                }}
            />
            {/* Outer Circle - follows with lag/lerp */}
            <div
                ref={cursorOuterRef}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: `${outerSize}px`,
                    height: `${outerSize}px`,
                    border: `1.5px solid rgba(${color}, 0.5)`,
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    transform: `translate(${outerPos.x - outerSize / 2}px, ${outerPos.y - outerSize / 2}px) scale(${isHovering && !isSidebar ? hoverScale : 1})`,
                    zIndex: 9999,
                    transition: 'transform 0.1s ease-out, border-color 0.3s',
                    backgroundColor: isHovering ? `rgba(${color}, 0.1)` : 'transparent'
                }}
            />
        </>
    );
};

export default MagicCursor;
