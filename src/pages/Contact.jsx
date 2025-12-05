import React, { useState } from 'react';
import aboutImage from '../assets/about.jpg'; // Using same image as requested

const Contact = ({ darkMode, colorMode }) => {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, sending, success, error

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('sending');
        // Simulate network request
        setTimeout(() => {
            setStatus('success');
            setFormState({ name: '', email: '', subject: '', message: '' });
            setTimeout(() => setStatus('idle'), 3000);
        }, 1500);
    };

    const handleChange = (e) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    const inputStyle = {
        width: '100%',
        background: 'transparent',
        border: 'none',
        borderBottom: `1px solid ${darkMode ? '#333' : '#ccc'}`,
        padding: '10px 0',
        color: darkMode ? '#fff' : '#000',
        fontSize: '0.9rem',
        marginBottom: '30px',
        outline: 'none',
        transition: 'border-color 0.3s'
    };

    const labelStyle = {
        display: 'block',
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: darkMode ? '#888' : '#666',
        marginBottom: '5px'
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            backgroundColor: darkMode ? '#000000' : '#ffffff',
            color: darkMode ? '#ffffff' : '#000000',
            transition: 'background-color 0.3s, color 0.3s',
            overflow: 'hidden'
        }} className="contact-container">

            <div className="contact-content" style={{
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
                }} className="contact-image-section">
                    <img
                        src={aboutImage}
                        alt="Decoration"
                        className={colorMode ? 'img-color' : 'img-grayscale'}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                </div>

                {/* Right Column: Form */}
                <div style={{
                    flex: '1',
                    padding: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start', // Standard align
                    maxWidth: '800px',
                    overflowY: 'auto' // Allow vertical scroll for form if needed
                }} className="contact-form-section">

                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        marginBottom: '40px',
                        lineHeight: '1.2'
                    }}>
                        Get in Touch
                    </h1>

                    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px' }}>
                        <div>
                            <label style={labelStyle}>Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formState.name}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = darkMode ? '#fff' : '#000'}
                                onBlur={(e) => e.target.style.borderColor = darkMode ? '#333' : '#ccc'}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formState.email}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = darkMode ? '#fff' : '#000'}
                                onBlur={(e) => e.target.style.borderColor = darkMode ? '#333' : '#ccc'}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Subject</label>
                            <input
                                type="text"
                                name="subject"
                                value={formState.subject}
                                onChange={handleChange}
                                required
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = darkMode ? '#fff' : '#000'}
                                onBlur={(e) => e.target.style.borderColor = darkMode ? '#333' : '#ccc'}
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Message</label>
                            <textarea
                                name="message"
                                value={formState.message}
                                onChange={handleChange}
                                required
                                rows="4"
                                style={{ ...inputStyle, resize: 'none' }}
                                onFocus={(e) => e.target.style.borderColor = darkMode ? '#fff' : '#000'}
                                onBlur={(e) => e.target.style.borderColor = darkMode ? '#333' : '#ccc'}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'sending'}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '12px 30px',
                                border: `1px solid ${darkMode ? '#ffffff' : '#000000'}`,
                                backgroundColor: status === 'sending' ? (darkMode ? '#333' : '#ccc') : 'transparent',
                                color: darkMode ? '#ffffff' : '#000000',
                                textDecoration: 'none',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                letterSpacing: '0.1em',
                                transition: 'all 0.3s',
                                textTransform: 'uppercase',
                                cursor: status === 'sending' ? 'default' : 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                if (status !== 'sending') {
                                    e.currentTarget.style.backgroundColor = darkMode ? '#ffffff' : '#000000';
                                    e.currentTarget.style.color = darkMode ? '#000000' : '#ffffff';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (status !== 'sending') {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = darkMode ? '#ffffff' : '#000000';
                                }
                            }}
                        >
                            {status === 'sending' ? 'Sending...' : 'Send Message'}
                        </button>

                        {status === 'success' && (
                            <p style={{
                                marginTop: '20px',
                                color: '#4caf50',
                                fontSize: '0.9rem'
                            }}>
                                Message sent successfully!
                            </p>
                        )}
                    </form>

                </div>
            </div>

            <style>{`
        @media (max-width: 968px) {
          .contact-content {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .contact-image-section {
            height: 40vh !important;
            flex: none !important;
          }
          .contact-form-section {
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

export default Contact;
