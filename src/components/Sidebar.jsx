import React, { useState } from 'react';
import { Instagram, ChevronLeft, ChevronRight } from 'lucide-react';

const FilterSection = ({ title, items, activeItem, onItemClick, itemsPerPage = 3 }) => {
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
                    color: 'var(--accent-color)',
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
                            color: !activeItem ? 'var(--text-color)' : 'var(--hover-color)',
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

const Sidebar = ({ filters, activeFilters, onFilterChange }) => {
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
            backgroundColor: 'var(--bg-color)',
            zIndex: 100,
            overflowY: 'auto'
        }}>
            <div>
                <div style={{ marginBottom: '60px' }}>
                    <h1 style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        lineHeight: '1.4',
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
                    />

                    <FilterSection
                        title="Locations"
                        items={filters.locations}
                        activeItem={activeFilters.location}
                        onItemClick={(val) => onFilterChange('location', val)}
                        itemsPerPage={4}
                    />

                    <FilterSection
                        title="Artists"
                        items={filters.authors}
                        activeItem={activeFilters.author}
                        onItemClick={(val) => onFilterChange('author', val)}
                        itemsPerPage={4}
                    />

                    <div style={{ marginTop: '30px' }}>
                        <button style={{ fontSize: '0.9rem', color: 'var(--text-color)', textAlign: 'left' }}>
                            About / Contact
                        </button>
                    </div>
                </nav>
            </div>

            <div style={{ marginTop: '40px' }}>
                <a href="#" style={{ color: 'var(--text-color)' }}>
                    <Instagram size={20} />
                </a>
                <p style={{
                    fontSize: '0.6rem',
                    color: 'var(--accent-color)',
                    marginTop: '20px',
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
