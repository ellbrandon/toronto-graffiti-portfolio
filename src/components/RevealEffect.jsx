import React, { useEffect, useRef, useState } from 'react';

const RevealEffect = ({ onDismiss }) => {
    const canvasRef = useRef(null);
    const mousePos = useRef([window.innerWidth * 0.25, window.innerHeight * 0.5]);
    const things = useRef([]);
    const animationFrameId = useRef(null);
    const [isActive, setIsActive] = useState(true);

    const cellSize = 30;
    const maxSize = 30;

    useEffect(() => {
        if (!isActive) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let numThingsX;
        let numThingsY;

        // Vector operations
        const vec2 = {
            fromValues: (x, y) => [x, y],
            set: (out, x, y) => {
                out[0] = x;
                out[1] = y;
                return out;
            },
            dist: (a, b) => {
                const dx = b[0] - a[0];
                const dy = b[1] - a[1];
                return Math.sqrt(dx * dx + dy * dy);
            }
        };

        const clamp = (value, min = 0, max = 1) => {
            return value <= min ? min : value >= max ? max : value;
        };

        const throttled = (fn) => {
            let didRequest = false;
            return (param) => {
                if (!didRequest) {
                    window.requestAnimationFrame(() => {
                        fn(param);
                        didRequest = false;
                    });
                    didRequest = true;
                }
            };
        };

        const drawThing = (thing) => {
            const { pos, radius } = thing;
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(pos[0], pos[1], radius, 0, Math.PI * 2);
            ctx.fill();
        };

        const loop = () => {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            things.current.forEach(thing => {
                const dist = vec2.dist(mousePos.current, thing.pos);
                thing.radius = clamp(dist * dist * 0.0003 - 1, 0, maxSize);
                drawThing(thing);
            });
        };

        const makeThing = (x, y) => {
            return {
                pos: vec2.fromValues(x, y),
                radius: 2,
            };
        };

        const makeThings = () => {
            things.current = [];
            for (let i = 0; i < numThingsY; i += 1) {
                for (let j = 0; j < numThingsX; j += 1) {
                    const thing = makeThing(j * cellSize + cellSize * 0.5, i * cellSize + cellSize * 0.5);
                    things.current.push(thing);
                }
            }
        };

        const sizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            const canvasRect = canvas.getBoundingClientRect();
            canvas.width = canvasRect.width * dpr;
            canvas.height = canvasRect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        const handleResize = () => {
            sizeCanvas();
            numThingsX = Math.ceil(window.innerWidth / cellSize);
            numThingsY = Math.ceil(window.innerHeight / cellSize);
            makeThings();
            loop();
        };

        const handleMouseMove = (event) => {
            vec2.set(mousePos.current, event.clientX, event.clientY);
            loop();
        };

        const handleClick = () => {
            setIsActive(false);
            if (onDismiss) {
                onDismiss();
            }
        };

        const throttledResize = throttled(handleResize);
        const throttledMouseMove = throttled(handleMouseMove);

        window.addEventListener('resize', throttledResize);
        window.addEventListener('mousemove', throttledMouseMove);
        canvas.addEventListener('click', handleClick);

        // Initialize
        handleResize();
        loop();

        return () => {
            window.removeEventListener('resize', throttledResize);
            window.removeEventListener('mousemove', throttledMouseMove);
            canvas.removeEventListener('click', handleClick);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [isActive, onDismiss]);

    if (!isActive) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            pointerEvents: 'all',
            background: 'transparent'
        }}>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    width: '100vw',
                    height: '100vh',
                    top: 0,
                    left: 0,
                    cursor: 'pointer',
                    background: 'transparent'
                }}
            />
            <h2 style={{
                color: '#00ff00',
                position: 'absolute',
                fontSize: '15vw',
                margin: 0,
                pointerEvents: 'none',
                width: '100%',
                textAlign: 'center',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)',
                fontWeight: 'bold',
                letterSpacing: '0.05em'
            }}>
                TORONTO GRAF
            </h2>
        </div>
    );
};

export default RevealEffect;
