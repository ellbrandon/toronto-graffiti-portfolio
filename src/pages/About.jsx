import React from 'react';
import aboutImage from '../assets/about.jpg';
import { Link } from 'react-router-dom';

const About = ({ darkMode, colorMode }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column', // Mobile first default, overrides in media query
            height: '100%',
            width: '100%',
            backgroundColor: darkMode ? '#000000' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
            transition: 'background-color 0.3s, color 0.3s',
            overflow: 'hidden' // Prevent scroll on container if possible
        }} className="about-container">

            {/* Desktop Layout: Flex Row */}
            <div className="about-content" style={{
                display: 'flex',
                flexDirection: 'row',
                height: '100%',
                width: '100%'
            }}>

                {/* Left Column: Image */}
                <div style={{
                    flex: '1',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: darkMode ? '#111' : '#f0f0f0'
                }} className="about-image-section">
                    <img
                        src={aboutImage}
                        alt="Photographer with camera"
                        className={colorMode ? 'img-color' : 'img-grayscale'}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                </div>

                {/* Right Column: Text */}
                <div style={{
                    flex: '1',
                    padding: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    maxWidth: '800px' // Prevent text from stretching too wide on huge screens
                }} className="about-text-section">

                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                        lineHeight: '1.2'
                    }}>
                        flownCanary<br />
                        Photography
                    </h1>

                    <p style={{
                        fontSize: '1.2rem',
                        lineHeight: '1.6',
                        color: darkMode ? '#cccccc' : '#555555',
                        marginBottom: '40px',
                        maxWidth: '500px'
                    }}>
                        I specialize in recording the street art culture of Toronto since 2010.
                    </p>

                    <Link to="/" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '12px 24px',
                        border: `1px solid ${darkMode ? '#ffffff' : '#000000'}`,
                        backgroundColor: 'transparent',
                        color: darkMode ? '#ffffff' : '#000000',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.1em',
                        transition: 'all 0.3s',
                        textTransform: 'uppercase'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = darkMode ? '#ffffff' : '#000000';
                            e.currentTarget.style.color = darkMode ? '#000000' : '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = darkMode ? '#ffffff' : '#000000';
                        }}
                    >
                        See My Portfolio
                    </Link>

                </div>
            </div>

            <style>{`
        @media (max-width: 968px) {
          .about-content {
            flex-direction: column !important;
            overflow-y: auto !important; /* Allow scroll on mobile */
          }
          .about-image-section {
            height: 50vh !important;
            flex: none !important;
          }
          .about-text-section {
            padding: 30px !important;
            flex: none !important;
            height: auto !important;
            justify-content: flex-start !important;
          }
           h1 {
            fontSize: 2rem !important;
           }
        }
      `}</style>
        </div>
    );
};

export default About;
