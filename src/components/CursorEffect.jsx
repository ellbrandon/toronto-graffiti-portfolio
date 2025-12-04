import React, { useEffect, useState } from 'react';

const CursorEffect = () => {
    const [particles, setParticles] = useState([]);
    const rainbowColors = ['#ff0080', '#ff8c00', '#ffff00', '#00ff00', '#00ffff', '#0080ff', '#8000ff'];

    useEffect(() => {
        let particleId = 0;

        const handleMouseMove = (e) => {
            // Create multiple particles per movement
            const newParticles = [];
            for (let i = 0; i < 3; i++) {
                newParticles.push({
                    id: particleId++,
                    x: e.clientX + (Math.random() - 0.5) * 10,
                    y: e.clientY + (Math.random() - 0.5) * 10,
                    size: Math.random() * 4 + 2,
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: Math.random() * 2 + 1,
                    life: 1,
                    color: rainbowColors[Math.floor(Math.random() * rainbowColors.length)]
                });
            }

            setParticles(prev => [...prev, ...newParticles].slice(-50)); // Keep last 50 particles
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animate particles
        const interval = setInterval(() => {
            setParticles(prev =>
                prev
                    .map(p => ({
                        ...p,
                        y: p.y + p.speedY,
                        x: p.x + p.speedX,
                        life: p.life - 0.02
                    }))
                    .filter(p => p.life > 0)
            );
        }, 16);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            {/* Custom cursor */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: 9998
                }}
            >
                {particles.map(particle => (
                    <div
                        key={particle.id}
                        style={{
                            position: 'absolute',
                            left: particle.x,
                            top: particle.y,
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.color,
                            borderRadius: '50%',
                            opacity: particle.life,
                            transform: 'translate(-50%, -50%)',
                            boxShadow: `0 0 ${particle.size * 3}px ${particle.color}`
                        }}
                    />
                ))}
            </div>

            {/* Custom cursor styles */}
            <style>{`
        * {
          cursor: none !important;
        }
        
        body::after {
          content: '';
          position: fixed;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          animation: cursorPulse 1.5s ease-in-out infinite;
          left: var(--mouse-x, 0);
          top: var(--mouse-y, 0);
          transition: width 0.2s, height 0.2s;
        }
        
        @keyframes cursorPulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.4;
          }
        }
      `}</style>
        </>
    );
};

export default CursorEffect;
