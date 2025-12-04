import React, { useState } from 'react';
import { Instagram, ChevronLeft, ChevronRight, Sun, Moon, Sparkles, Dices, Palette } from 'lucide-react';

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
                        color: 'var(--accent-color)'
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
                            transition: 'color 0.3s'
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
                                color: activeItem === item ? 'var(--text-color)' : 'var(--hover-color)',
                                fontWeight: activeItem === item ? 'bold' : 'normal',
                                textAlign: 'left',
                                transition: 'color 0.3s'
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

const Sidebar = ({ filters, activeFilters, onFilterChange, darkMode, onThemeToggle, cursorEffectEnabled, onCursorToggle, colorMode, onColorModeToggle, onShuffle }) => {
    return (
        <aside style={{
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
                <div style={{ marginBottom: '40px' }}>
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
                        letterSpacing: '0.1em'
                    }}>
                        ARCHIVE 2010-2025
                    </p>
                </div>

                <nav>
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

                    <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button style={{
                            fontSize: '0.9rem',
                            color: darkMode ? 'var(--text-color)' : 'var(--text-color-dark)',
                            textAlign: 'left',
                            transition: 'color 0.3s'
                        }}>
                            About
                        </button>
                        <button style={{
                            fontSize: '0.9rem',
                            color: darkMode ? 'var(--text-color)' : 'var(--text-color-dark)',
                            textAlign: 'left',
                            transition: 'color 0.3s'
                        }}>
                            Contact
                        </button>
                    </div>
                </nav>
            </div>

            <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                    {/* Instagram Button */}
                    <button
                        onClick={() => window.open('https://www.instagram.com/flown_canary', '_blank')}
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
                        title="Follow on Instagram"
                    >
                        <Instagram size={20} />
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
                        <Sparkles size={20} />
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
                        <Palette size={20} />
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
    );
};

export default Sidebar;
