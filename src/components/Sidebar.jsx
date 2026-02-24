import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Sun, Moon, Menu, X,
    LayoutDashboard, LayoutGrid, RectangleVertical, Maximize,
    Search, XCircle, Pencil, SprayCan, MapPin,
    CalendarArrowDown, CalendarArrowUp, ArrowDownAZ, ArrowUpAZ, Dices,
} from 'lucide-react';

// Reusable input with optional left/right icon slots
const IconInput = ({ iconLeft, iconRight, onClick, children }) => (
    <div className="icon-input" onClick={onClick}>
        {iconLeft && <span className="icon-input-slot">{iconLeft}</span>}
        {children}
        {iconRight && <span className="icon-input-slot">{iconRight}</span>}
    </div>
);

const SearchableSelect = ({ options, value, onChange, placeholder }) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const containerRef = React.useRef(null);

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
        <button className="searchable-clear-btn" onClick={handleClear}>
            <XCircle size={14} />
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
                    value={open ? query : (value || '')}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    placeholder={placeholder}
                    className={`searchable-select-input${value && !open ? ' has-value' : ''}`}
                />
            </IconInput>

            {open && (
                <div className="searchable-dropdown">
                    {filtered.length === 0 ? (
                        <div className="searchable-dropdown-empty">No matches</div>
                    ) : filtered.map(option => (
                        <button
                            key={option}
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

const FilterSection = ({ title, icon, options, value, onChange, placeholder, galleryKey, activeGallery, onShowGallery, onClearAll }) => {
    const isGalleryOpen = activeGallery === galleryKey;
    const isActive = isGalleryOpen || !!value;
    return (
        <div className="filter-section">
            <h3 className={`filter-section-title${isActive ? ' filter-section-title--active' : ''}`}>
                {/* {icon && <span className="filter-section-icon">{icon}</span>} */}
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
                <button
                    className="btn-primary"
                    style={{ opacity: isGalleryOpen ? 0.6 : 1 }}
                    onClick={() => { onClearAll(); onShowGallery(galleryKey); }}
                >
                    All {title}
                </button>
            </div>
        </div>
    );
};

const sortIcons = {
    'date-desc': <CalendarArrowDown size={20} />,
    'date-asc':  <CalendarArrowUp size={20} />,
    'alpha-asc': <ArrowDownAZ size={20} />,
    'alpha-desc':<ArrowUpAZ size={20} />,
    'random':    <Dices size={20} />,

    
};

const sortTitles = {
    'date-desc': 'Newest first',
    'date-asc':  'Oldest first',
    'alpha-asc': 'A → Z',
    'alpha-desc':'Z → A',
    'random':    'Random order',
};

const Sidebar = ({
    darkMode, onThemeToggle, layoutMode, onLayoutToggle, sortMode, onSortToggle,
    writers, activeWriter, onWriterChange,
    whats, activeWhat, onWhatChange,
    wheres, activeWhere, onWhereChange,
    activeGallery, onShowGallery,
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    const clearAll = () => {
        onWriterChange(null);
        onWhatChange(null);
        onWhereChange(null);
    };

    const filterSections = [
        { title: 'Writers', icon: <Pencil size={18} />,   options: writers, value: activeWriter, onChange: onWriterChange, placeholder: 'Search writers...', galleryKey: 'writer' },
        { title: 'What',    icon: <SprayCan size={18} />, options: whats,   value: activeWhat,   onChange: onWhatChange,   placeholder: 'Search what...',    galleryKey: 'what' },
        { title: 'Where',   icon: <MapPin size={18} />,   options: wheres,  value: activeWhere,  onChange: onWhereChange,  placeholder: 'Search where...',   galleryKey: 'where' },
    ];

    const layoutIcons = {
        masonry: <LayoutDashboard size={20} />,
        grid:    <LayoutGrid size={20} />,
        single:  <RectangleVertical size={20} />,
        full:    <Maximize size={20} />,
    };

    const filterSectionEls = filterSections.map(s => (
        <FilterSection
            key={s.galleryKey}
            title={s.title}
            icon={s.icon}
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

    const sortBtn = (
        <button
            className="btn-icon"
            onClick={onSortToggle}
            title={sortTitles[sortMode]}
        >
            {sortIcons[sortMode]}
        </button>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="desktop-sidebar">
                <div>
                    <Link to="/" className="site-title-link">
                        <h1 className="site-title">TORONTO<br />GRAFFITI</h1>
                        <p className="site-subtitle">ARCHIVE 2010-2025</p>
                    </Link>
                    <nav>{filterSectionEls}</nav>
                    <Link
                        to="/places"
                        className={`places-link${location.pathname === '/places' ? ' places-link--active' : ''}`}
                    >
                        PLACES &amp; SPACES
                    </Link>
                </div>

                <div className="sidebar-options">
                    <h3 className="sidebar-options-title">Options</h3>
                    <div className="sidebar-options-row">
                        <button
                            className="btn-icon"
                            onClick={onThemeToggle}
                            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            className="btn-icon"
                            onClick={onLayoutToggle}
                            title={`Current Layout: ${layoutMode}`}
                        >
                            {layoutIcons[layoutMode]}
                        </button>
                        {sortBtn}
                    </div>
                    <p className="sidebar-copyright">
                        &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED
                    </p>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="mobile-header">
                <div className="mobile-header-row">
                    <Link to="/" className="site-title-mobile">
                        <h1>TORONTO GRAFFITI</h1>
                    </Link>
                    <button className="btn-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="mobile-menu-panel">
                        {filterSectionEls}
                        <Link
                            to="/places"
                            className={`places-link${location.pathname === '/places' ? ' places-link--active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            PLACES &amp; SPACES
                        </Link>
                        <div className="mobile-options-row">
                            <button className="btn-icon" onClick={onThemeToggle}>
                                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button className="btn-icon" onClick={onLayoutToggle}>
                                {layoutIcons[layoutMode]}
                            </button>
                            {sortBtn}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Sidebar;
