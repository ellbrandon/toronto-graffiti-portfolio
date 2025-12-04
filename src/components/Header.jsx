import React from 'react';

const Header = () => {
    return (
        <header style={{ padding: '40px 0', textAlign: 'center' }}>
            <div className="container">
                <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>TORONTO GRAFFITI</h1>
                <p style={{
                    fontSize: '1rem',
                    color: 'var(--hover-color)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    15 Years of Street Art
                </p>
            </div>
        </header>
    );
};

export default Header;
