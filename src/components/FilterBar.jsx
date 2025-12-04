import React from 'react';
import { Filter, MapPin, Tag, PaintBucket } from 'lucide-react';

const FilterBar = ({ filters, activeFilters, onFilterChange }) => {
    return (
        <div style={{
            padding: '20px 0',
            borderBottom: '1px solid var(--accent-color)',
            marginBottom: '40px',
            position: 'sticky',
            top: 0,
            backgroundColor: 'var(--bg-color)',
            zIndex: 100,
            backdropFilter: 'blur(10px)'
        }}>
            <div className="container" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>

                {/* Location Filter */}
                <div className="filter-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--hover-color)' }}>
                        <MapPin size={16} />
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Location</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => onFilterChange('location', null)}
                            style={{
                                padding: '6px 12px',
                                border: `1px solid ${!activeFilters.location ? 'var(--text-color)' : 'var(--accent-color)'}`,
                                borderRadius: '20px',
                                color: !activeFilters.location ? 'var(--bg-color)' : 'var(--text-color)',
                                backgroundColor: !activeFilters.location ? 'var(--text-color)' : 'transparent',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            All
                        </button>
                        {filters.locations.map(loc => (
                            <button
                                key={loc}
                                onClick={() => onFilterChange('location', loc)}
                                style={{
                                    padding: '6px 12px',
                                    border: `1px solid ${activeFilters.location === loc ? 'var(--text-color)' : 'var(--accent-color)'}`,
                                    borderRadius: '20px',
                                    color: activeFilters.location === loc ? 'var(--bg-color)' : 'var(--text-color)',
                                    backgroundColor: activeFilters.location === loc ? 'var(--text-color)' : 'transparent',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {loc}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Style Filter */}
                <div className="filter-group">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--hover-color)' }}>
                        <PaintBucket size={16} />
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Style</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => onFilterChange('style', null)}
                            style={{
                                padding: '6px 12px',
                                border: `1px solid ${!activeFilters.style ? 'var(--text-color)' : 'var(--accent-color)'}`,
                                borderRadius: '20px',
                                color: !activeFilters.style ? 'var(--bg-color)' : 'var(--text-color)',
                                backgroundColor: !activeFilters.style ? 'var(--text-color)' : 'transparent',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            All
                        </button>
                        {filters.styles.map(style => (
                            <button
                                key={style}
                                onClick={() => onFilterChange('style', style)}
                                style={{
                                    padding: '6px 12px',
                                    border: `1px solid ${activeFilters.style === style ? 'var(--text-color)' : 'var(--accent-color)'}`,
                                    borderRadius: '20px',
                                    color: activeFilters.style === style ? 'var(--bg-color)' : 'var(--text-color)',
                                    backgroundColor: activeFilters.style === style ? 'var(--text-color)' : 'transparent',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FilterBar;
