import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, LayoutDashboard, LayoutGrid, RectangleVertical, Maximize, Search, XCircle } from 'lucide-react';

// Reusable input with optional left/right icon slots
const IconInput = ({ iconLeft, iconRight, darkMode, active, onClick, children, ...props }) => {
    const borderColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const textColor = darkMode ? 'var(--text-color)' : '#000';
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                border: `1px solid ${borderColor}`,
                borderRadius: '3px',
                padding: '6px 8px',
                cursor: 'text',
                gap: '6px',
            }}
        >
            {iconLeft && (
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: 'var(--hover-color)' }}>
                    {iconLeft}
                </span>
            )}
            {children}
            {iconRight && (
                <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: 'var(--hover-color)' }}>
                    {iconRight}
                </span>
            )}
        </div>
    );
};

const SearchableSelect = ({ options, value, onChange, placeholder, darkMode }) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (option) => {
        onChange(option === value ? null : option);
        setQuery('');
        setOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange(null);
        setQuery('');
    };

    const textColor = darkMode ? 'var(--text-color)' : '#000';
    const borderColor = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const bgColor = darkMode ? '#111' : '#fff';

    const clearButton = value ? (
        <button onClick={handleClear} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--hover-color)', padding: 0, display: 'flex', alignItems: 'center'
        }}>
            <XCircle size={14} />
        </button>
    ) : null;

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
            <IconInput
                darkMode={darkMode}
                active={!!value}
                onClick={() => setOpen(true)}
                iconLeft={<Search size={14} />}
                iconRight={clearButton}
            >
                <input
                    type="text"
                    value={open ? query : (value || '')}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    style={{
                        flex: 1,
                        background: 'none',
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.8rem',
                        color: value && !open ? textColor : 'var(--hover-color)',
                        cursor: 'text',
                        minWidth: 0,
                    }}
                />
            </IconInput>

            {open && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '3px',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    zIndex: 500,
                }}>
                    {filtered.length === 0 ? (
                        <div style={{ padding: '8px', fontSize: '0.8rem', color: 'var(--hover-color)' }}>No matches</div>
                    ) : filtered.map(option => (
                        <button
                            key={option}
                            onClick={() => handleSelect(option)}
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                padding: '7px 10px',
                                background: option === value ? (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'none',
                                border: 'none',
                                fontSize: '0.8rem',
                                color: option === value ? textColor : 'var(--hover-color)',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = option === value ? (darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)') : 'transparent'}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ darkMode, onThemeToggle, layoutMode, onLayoutToggle, writers, activeWriter, onWriterChange, showWritersGallery, onShowWritersGallery, onHideWritersGallery }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="desktop-sidebar" style={{
                width: '250px',
                height: '100vh',
                position: 'fixed',
                top: 0,
                left: 0,
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: darkMode ? 'var(--bg-color)' : '#ffffff',
                zIndex: 100,
                overflowY: 'auto',
                transition: 'background-color 0.3s'
            }}>
                <div>
                    <Link
                        to="/"
                        style={{
                            marginBottom: '40px',
                            display: 'block',
                            textDecoration: 'none',
                            color: darkMode ? 'var(--text-color)' : '#000'
                        }}
                    >
                        <h1 style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            marginBottom: '5px'
                        }}>
                            TORONTO<br />GRAFFITI
                        </h1>
                        <p style={{
                            fontSize: '0.7rem',
                            color: 'var(--hover-color)',
                            letterSpacing: '0.2em'
                        }}>
                            ARCHIVE 2010-2025
                        </p>
                    </Link>

                    <nav>
                        <div style={{ marginBottom: '30px' }}>
                            <h3 style={{
                                fontSize: '0.7rem',
                                color: 'var(--grey)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: '10px'
                            }}>Writers</h3>
                            <SearchableSelect
                                options={writers}
                                value={activeWriter}
                                onChange={onWriterChange}
                                placeholder="Search writers..."
                                darkMode={darkMode}
                            />
                            <button
                                onClick={showWritersGallery ? onHideWritersGallery : onShowWritersGallery}
                                style={{
                                    marginTop: '8px',
                                    width: '100%',
                                    padding: '6px 8px',
                                    background: '#000',
                                    border: '1px solid #000',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    color: '#fff',
                                    textAlign: 'left',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                All Writers
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to="/about" style={{
                                fontSize: '0.9rem',
                                color: darkMode ? 'var(--text-color)' : 'var(--text-color-dark)',
                                transition: 'color 0.3s',
                                textDecoration: 'none'
                            }}>
                                About
                            </Link>
                            <span style={{
                                fontSize: '0.9rem',
                                color: darkMode ? 'var(--grey)' : 'var(--dark-grey)'
                            }}>/</span>
                            <Link to="/contact" style={{
                                fontSize: '0.9rem',
                                color: darkMode ? 'var(--text-color)' : 'var(--text-color-dark)',
                                transition: 'color 0.3s',
                                textDecoration: 'none'
                            }}>
                                Contact
                            </Link>
                        </div>
                    </nav>
                </div>

                <div style={{ marginTop: '40px' }}>
                    <h3 style={{
                        fontSize: '0.7rem',
                        color: 'var(--grey)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '15px'
                    }}>
                        Options
                    </h3>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                        <button
                            onClick={onThemeToggle}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: darkMode ? 'var(--text-color)' : '#000',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            onClick={onLayoutToggle}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: darkMode ? 'var(--text-color)' : '#000',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title={`Current Layout: ${layoutMode}`}
                        >
                            {layoutMode === 'masonry' && <LayoutDashboard size={20} />}
                            {layoutMode === 'grid' && <LayoutGrid size={20} />}
                            {layoutMode === 'single' && <RectangleVertical size={20} />}
                            {layoutMode === 'full' && <Maximize size={20} />}
                        </button>
                    </div>

                    <p style={{
                        fontSize: '0.6rem',
                        color: darkMode ? 'var(--grey)' : 'var(--dark-grey)',
                        lineHeight: '1.5'
                    }}>
                        &copy; {new Date().getFullYear()}<br />
                        ALL RIGHTS RESERVED
                    </p>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="mobile-header" style={{
                display: 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: darkMode ? 'var(--bg-color)' : '#ffffff',
                borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                padding: '12px 16px',
                zIndex: 200,
                transition: 'background-color 0.3s'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link
                        to="/"
                        style={{
                            textDecoration: 'none',
                            color: darkMode ? 'var(--text-color)' : '#000'
                        }}
                    >
                        <h1 style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            margin: 0
                        }}>
                            TORONTO GRAFFITI
                        </h1>
                    </Link>

                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: darkMode ? 'var(--text-color)' : '#000',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div style={{
                        paddingTop: '12px',
                        borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        marginTop: '12px'
                    }}>
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{
                                fontSize: '0.7rem',
                                color: 'var(--grey)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: '8px'
                            }}>Writer</h3>
                            <SearchableSelect
                                options={writers}
                                value={activeWriter}
                                onChange={onWriterChange}
                                placeholder="Search writers..."
                                darkMode={darkMode}
                            />
                            <button
                                onClick={showWritersGallery ? onHideWritersGallery : onShowWritersGallery}
                                style={{
                                    marginTop: '8px',
                                    width: '100%',
                                    padding: '6px 8px',
                                    background: '#000',
                                    border: '1px solid #000',
                                    borderRadius: '3px',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    color: '#fff',
                                    textAlign: 'left',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                All Writers
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                            <Link to="/about" style={{
                                fontSize: '0.9rem',
                                color: darkMode ? 'var(--text-color)' : '#000',
                                textDecoration: 'none'
                            }}>About</Link>
                            <span style={{ color: 'var(--grey)' }}>/</span>
                            <Link to="/contact" style={{
                                fontSize: '0.9rem',
                                color: darkMode ? 'var(--text-color)' : '#000',
                                textDecoration: 'none'
                            }}>Contact</Link>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <button onClick={onThemeToggle} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: darkMode ? 'var(--text-color)' : '#000',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0
                            }}>
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button onClick={onLayoutToggle} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: darkMode ? 'var(--text-color)' : '#000',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0
                            }}>
                                {layoutMode === 'masonry' && <LayoutDashboard size={20} />}
                                {layoutMode === 'grid' && <LayoutGrid size={20} />}
                                {layoutMode === 'single' && <RectangleVertical size={20} />}
                                {layoutMode === 'full' && <Maximize size={20} />}
                            </button>
                        </div>
                    </div>
                )}
            </header>

            <style>{`
                @media (max-width: 768px) {
                    .desktop-sidebar {
                        display: none !important;
                    }
                    .mobile-header {
                        display: block !important;
                    }
                }
                @media (min-width: 769px) {
                    .mobile-header {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
};

export default Sidebar;
