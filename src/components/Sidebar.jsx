import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Instagram, ChevronLeft, ChevronRight, Sun, Moon, SprayCan, Dices, PaintbrushVertical, Menu, X, ChevronDown, Wand2, MousePointer2, LayoutDashboard, LayoutGrid, RectangleVertical, Maximize } from 'lucide-react';

const FilterSection = ({ title, items, activeItem, onItemClick, itemsPerPage = 3, darkMode }) => {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const displayedItems = items.slice(
        page * itemsPerPage,
        (page + 1) * itemsPerPage
    );

    return (
        <div style={{ marginBottom: '30px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
            }}>
                <h3 style={{
                    fontSize: '0.7rem',
                    color: 'var(--grey)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em'
                }}>
                    {title}
                </h3>

                {/* Pagination Controls in Header */}
                {totalPages > 1 && (
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        color: 'var(--grey)'
                    }}>
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            style={{
                                opacity: page === 0 ? 0.3 : 1,
                                cursor: page === 0 ? 'default' : 'pointer',
                                display: 'flex', alignItems: 'center',
                                padding: '0'
                            }}
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            style={{
                                opacity: page === totalPages - 1 ? 0.3 : 1,
                                cursor: page === totalPages - 1 ? 'default' : 'pointer',
                                display: 'flex', alignItems: 'center',
                                padding: '0'
                            }}
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                )}
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li>
                    <button
                        onClick={() => onItemClick(null)}
                        style={{
                            fontSize: '0.9rem',
                            color: !activeItem
                                ? (darkMode ? 'var(--text-color)' : 'var(--text-color-dark)')
                                : 'var(--hover-color)',
                            fontWeight: !activeItem ? 'bold' : 'normal',
                            textAlign: 'left',
                            transition: 'color 0.3s, transform 0.3s',
                            transform: 'translateX(0)',
                            display: 'block',
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            if (activeItem) { // Only animate if not active
                                e.currentTarget.style.color = darkMode ? 'var(--text-color)' : 'var(--text-color-dark)';
                                e.currentTarget.style.transform = 'translateX(5px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeItem) {
                                e.currentTarget.style.color = 'var(--hover-color)';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }
                        }}
                    >
                        All
                    </button>
                </li>
                {displayedItems.map(item => (
                    <li key={item}>
                        <button
                            onClick={() => onItemClick(item)}
                            style={{
                                fontSize: '0.9rem',
                                color: activeItem === item ? (darkMode ? 'var(--text-color)' : '#000000') : 'var(--hover-color)',
                                fontWeight: activeItem === item ? 'bold' : 'normal',
                                textAlign: 'left',
                                transition: 'color 0.3s, transform 0.3s',
                                transform: 'translateX(0)',
                                display: 'block',
                                width: '100%',
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                                if (activeItem !== item) {
                                    e.currentTarget.style.color = darkMode ? 'var(--text-color)' : 'var(--text-color-dark)';
                                    e.currentTarget.style.transform = 'translateX(5px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeItem !== item) {
                                    e.currentTarget.style.color = 'var(--hover-color)';
                                    e.currentTarget.style.transform = 'translateX(0)';
                                }
                            }}
                        >
                            {item}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const MobileDropdown = ({ title, items, activeItem, onItemClick, darkMode }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div style={{ position: 'relative', flex: 1 }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: 'none',
                    borderRadius: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    color: darkMode ? 'var(--text-color)' : 'var(--text-color-dark)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}
            >
                <span>{activeItem || title}</span>
                <ChevronDown size={14} style={{
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                }} />
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    backgroundColor: darkMode ? 'var(--bg-color)' : '#ffffff',
                    border: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <button
                        onClick={() => {
                            onItemClick(null);
                            setIsOpen(false);
                        }}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: 'none',
                            background: 'none',
                            textAlign: 'left',
                            fontSize: '0.8rem',
                            color: !activeItem ? (darkMode ? 'var(--text-color)' : 'var(--text-color-dark)') : 'var(--hover-color)',
                            fontWeight: !activeItem ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        All
                    </button>
                    {items.map(item => (
                        <button
                            key={item}
                            onClick={() => {
                                onItemClick(item);
                                setIsOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: 'none',
                                background: 'none',
                                textAlign: 'left',
                                fontSize: '0.8rem',
                                color: activeItem === item ? (darkMode ? 'var(--text-color)' : 'var(--text-color-dark)') : 'var(--hover-color)',
                                fontWeight: activeItem === item ? 'bold' : 'normal',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Sidebar = ({ filters, activeFilters, onFilterChange, darkMode, onThemeToggle, cursorEffectEnabled, onCursorToggle, magicCursorEnabled, onMagicCursorToggle, colorMode, onColorModeToggle, onShuffle, layoutMode, onLayoutToggle }) => {
    const location = useLocation();
    const showFilters = location.pathname === '/';
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
                        onClick={() => {
                            onFilterChange('style', null);
                            onFilterChange('location', null);
                            onFilterChange('author', null);
                        }}
                        style={{
                            marginBottom: '40px',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
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
                        {showFilters && (
                            <>
                                <FilterSection
                                    title="Styles"
                                    items={filters.styles}
                                    activeItem={activeFilters.style}
                                    onItemClick={(val) => onFilterChange('style', val)}
                                    itemsPerPage={4}
                                    darkMode={darkMode}
                                />

                                <FilterSection
                                    title="Locations"
                                    items={filters.locations}
                                    activeItem={activeFilters.location}
                                    onItemClick={(val) => onFilterChange('location', val)}
                                    itemsPerPage={4}
                                    darkMode={darkMode}
                                />

                                <FilterSection
                                    title="Artists"
                                    items={filters.authors}
                                    activeItem={activeFilters.author}
                                    onItemClick={(val) => onFilterChange('author', val)}
                                    itemsPerPage={4}
                                    darkMode={darkMode}
                                />
                            </>
                        )}

                        <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Link to="/about" style={{
                                fontSize: '0.9rem',
                                color: darkMode ? 'var(--text-color)' : 'var(--text-color-dark)',
                                textAlign: 'left',
                                transition: 'color 0.3s',
                                background: 'none',
                                border: 'none',
                                padding: 0,
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
                                textAlign: 'left',
                                transition: 'color 0.3s',
                                background: 'none',
                                border: 'none',
                                padding: 0,
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
                        {/* Color Mode Toggle */}
                        <button
                            onClick={onColorModeToggle}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: colorMode ? '#ff0000' : (darkMode ? 'var(--text-color)' : '#000'),
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                                transition: 'transform 0.2s, color 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title={colorMode ? 'Switch to Grayscale Default' : 'Switch to Color Default'}
                        >
                            <PaintbrushVertical size={20} />
                        </button>

                        {/* Theme Toggle */}
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

                        {/* Magic Cursor Toggle */}
                        <button
                            onClick={(e) => {
                                console.log("Sidebar: Magic Cursor Toggle Clicked");
                                onMagicCursorToggle(e);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: magicCursorEnabled ? '#00ff00' : (darkMode ? 'var(--text-color)' : '#000'),
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                                transition: 'transform 0.2s, color 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title={magicCursorEnabled ? 'Disable Magic Cursor' : 'Enable Magic Cursor'}
                        >
                            {magicCursorEnabled ? <Wand2 size={20} /> : <MousePointer2 size={20} />}
                        </button>

                        {/* Layout Toggle */}
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
                                transition: 'transform 0.2s, color 0.3s'
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

                        {/* Cursor Effect Toggle */}
                        <button
                            onClick={onCursorToggle}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: cursorEffectEnabled ? '#00ff00' : (darkMode ? 'var(--text-color)' : '#000'),
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0,
                                transition: 'transform 0.2s, color 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            title={cursorEffectEnabled ? 'Disable Spray Effect' : 'Enable Spray Effect'}
                        >
                            <SprayCan size={20} />
                        </button>

                        {/* Shuffle Button */}
                        <button
                            onClick={onShuffle}
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
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(180deg) scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
                            title="Shuffle & Clear Filters"
                        >
                            <Dices size={20} />
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
                {/* Top row: Logo and Menu */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <Link
                        to="/"
                        onClick={() => {
                            onFilterChange('style', null);
                            onFilterChange('location', null);
                            onFilterChange('author', null);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            textAlign: 'left',
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

                {/* Filter dropdowns */}
                {showFilters && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <MobileDropdown
                            title="Styles"
                            items={filters.styles}
                            activeItem={activeFilters.style}
                            onItemClick={(val) => onFilterChange('style', val)}
                            darkMode={darkMode}
                        />
                        <MobileDropdown
                            title="Locations"
                            items={filters.locations}
                            activeItem={activeFilters.location}
                            onItemClick={(val) => onFilterChange('location', val)}
                            darkMode={darkMode}
                        />
                        <MobileDropdown
                            title="Artists"
                            items={filters.authors}
                            activeItem={activeFilters.author}
                            onItemClick={(val) => onFilterChange('author', val)}
                            darkMode={darkMode}
                        />
                    </div>
                )}

                {/* Control buttons - visible when menu open */}
                {mobileMenuOpen && (
                    <div style={{
                        paddingTop: '12px',
                        borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}>
                        <h3 style={{
                            fontSize: '0.7rem',
                            color: 'var(--grey)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            marginBottom: '12px'
                        }}>
                            Options
                        </h3>
                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            alignItems: 'center'
                        }}>
                            <button onClick={onColorModeToggle} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: colorMode ? '#ff0000' : (darkMode ? 'var(--text-color)' : '#000'),
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0
                            }}>
                                <PaintbrushVertical size={20} />
                            </button>
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
                            <button onClick={(e) => {
                                console.log("Mobile Sidebar: Magic Cursor Toggle Clicked");
                                onMagicCursorToggle(e);
                            }} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: magicCursorEnabled ? '#00ff00' : (darkMode ? 'var(--text-color)' : '#000'),
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0
                            }}>
                                {magicCursorEnabled ? <Wand2 size={20} /> : <MousePointer2 size={20} />}
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
                            <button onClick={onCursorToggle} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: cursorEffectEnabled ? '#00ff00' : (darkMode ? 'var(--text-color)' : '#000'),
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0
                            }}>
                                <SprayCan size={20} />
                            </button>
                            <button onClick={onShuffle} style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: darkMode ? 'var(--text-color)' : '#000',
                                display: 'flex',
                                alignItems: 'center',
                                padding: 0
                            }}>
                                <Dices size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Add responsive styles */}
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
