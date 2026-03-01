import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Search, XCircle, UserRoundPlus, SprayCan, Locate, Camera } from 'lucide-react';

// Reusable input with optional left/right icon slots
const IconInput = ({ iconLeft, iconRight, onClick, children }) => (
    <div className="icon-input" onClick={onClick}>
        {iconLeft && <span className="icon-input-slot" aria-hidden="true">{iconLeft}</span>}
        {children}
        {iconRight && <span className="icon-input-slot">{iconRight}</span>}
    </div>
);

const SearchableSelect = ({ options, value, onChange, placeholder }) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = React.useRef(null);
    const listId = React.useId();

    const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

    React.useEffect(() => {
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

    const clearButton = value ? (
        <button
            className="searchable-clear-btn"
            onClick={handleClear}
            aria-label={`Clear ${value} filter`}
        >
            <XCircle size={14} aria-hidden="true" />
        </button>
    ) : null;

    return (
        <div ref={containerRef} className="searchable-select">
            <IconInput
                onClick={() => setOpen(true)}
                iconLeft={<Search size={14} />}
                iconRight={clearButton}
            >
                <input
                    type="text"
                    role="combobox"
                    aria-expanded={open}
                    aria-autocomplete="list"
                    aria-controls={open ? listId : undefined}
                    value={open ? query : (value || '')}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    className={`searchable-select-input${value && !open ? ' has-value' : ''}`}
                />
            </IconInput>

            {open && (
                <div id={listId} className="searchable-dropdown" role="listbox">
                    {filtered.length === 0 ? (
                        <div className="searchable-dropdown-empty" role="option" aria-disabled="true">No matches</div>
                    ) : filtered.map(option => (
                        <button
                            key={option}
                            role="option"
                            aria-selected={option === value}
                            className={`searchable-dropdown-option${option === value ? ' is-selected' : ''}`}
                            onClick={() => handleSelect(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const FilterSection = ({ icon, title, options, value, onChange, placeholder, galleryKey, activeGallery, onShowGallery, onClearAll }) => {
    const isGalleryOpen = activeGallery === galleryKey;
    const isActive = isGalleryOpen || !!value;
    const galleryLabel = `Browse all ${title} gallery`;
    return (
        <div className="filter-section">
            <div className="filter-section-row">
                <button
                    className={`filter-section-icon-col filter-section-icon-col--clickable${isActive ? ' filter-section-icon-col--active' : ''}`}
                    onClick={() => { onClearAll(); onShowGallery(galleryKey); }}
                    aria-label={galleryLabel}
                    aria-pressed={isGalleryOpen}
                >
                    <span aria-hidden="true">{icon}</span>
                </button>
                <div className="filter-section-body">
                    <h3
                        className={`filter-section-title filter-section-title--clickable${isActive ? ' filter-section-title--active' : ''}`}
                        onClick={() => { onClearAll(); onShowGallery(galleryKey); }}
                        role="button"
                        tabIndex={0}
                        aria-label={galleryLabel}
                        aria-pressed={isGalleryOpen}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClearAll(); onShowGallery(galleryKey); }}}
                    >
                        {title}
                    </h3>
                    <div className="filter-section-controls">
                        <SearchableSelect
                            key={value ?? '__empty__'}
                            options={options}
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Sidebar = ({
    writers, activeWriter, onWriterChange,
    whats, activeWhat, onWhatChange,
    wheres, activeWhere, onWhereChange,
    activeGallery, onShowGallery, onHomeClick,
    placesActive, onShowPlaces,
    photoCount, lastUpdated,
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Close mobile menu whenever filters, gallery, places, or route changes
    React.useEffect(() => {
        setMobileMenuOpen(false);
    }, [activeWriter, activeWhat, activeWhere, activeGallery, placesActive, location.pathname]);

    const clearAll = () => {
        onWriterChange(null);
        onWhatChange(null);
        onWhereChange(null);
    };

    const filterSections = [
        { icon: <UserRoundPlus size={18} />, title: 'Writers', options: writers, value: activeWriter, onChange: onWriterChange, placeholder: 'Search writers...', galleryKey: 'writer' },
        { icon: <SprayCan      size={18} />, title: 'What',    options: whats,   value: activeWhat,   onChange: onWhatChange,   placeholder: 'Search what...',    galleryKey: 'what' },
        { icon: <Locate        size={18} />, title: 'Where',   options: wheres,  value: activeWhere,  onChange: onWhereChange,  placeholder: 'Search where...',   galleryKey: 'where' },
    ];

    const filterSectionEls = filterSections.map(s => (
        <FilterSection
            key={s.galleryKey}
            icon={s.icon}
            title={s.title}
            options={s.options}
            value={s.value}
            onChange={s.onChange}
            placeholder={s.placeholder}
            galleryKey={s.galleryKey}
            activeGallery={activeGallery}
            onShowGallery={onShowGallery}
            onClearAll={clearAll}
        />
    ));

    const placesBtn = () => (
        <button
            className={`places-link${placesActive ? ' places-link--active' : ''}`}
            onClick={onShowPlaces}
            aria-pressed={placesActive}
        >
            <span className={`filter-section-icon-col${placesActive ? ' filter-section-icon-col--active' : ''}`} aria-hidden="true">
                <Camera size={18} />
            </span>
            <span className="places-link-label">PLACES &amp; SPACES</span>
        </button>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="desktop-sidebar" aria-label="Filter navigation">
                <div className="desktop-sidebar-inner">
                    <div>
                        <nav aria-label="Photo filters">{filterSectionEls}</nav>
                        {placesBtn()}
                    </div>

                    <div className="sidebar-options">
                        <div className="sidebar-stats" aria-label="Archive statistics">
                            <p>{photoCount} Photos</p>
                            <p>{writers.length} Writers</p>
                            <p>Updated: {lastUpdated}</p>
                        </div>
                        <p className="sidebar-copyright">
                            &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED
                        </p>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="mobile-header">
                <div className="mobile-header-row">
                    <Link to="/" className="site-title-mobile" onClick={onHomeClick}>
                        <h1>TORONTO GRAFFITI</h1>
                    </Link>
                    <button
                        className="btn-icon"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-menu-panel"
                    >
                        {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu Panel — outside fixed header so it can scroll */}
            {mobileMenuOpen && (
                <nav id="mobile-menu-panel" className="mobile-menu-panel" aria-label="Photo filters">
                    {filterSectionEls}
                    {placesBtn()}
                </nav>
            )}
        </>
    );
};

export default Sidebar;
