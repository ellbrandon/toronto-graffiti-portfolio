import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PhotoGrid from './components/PhotoGrid';
import AllGallery from './components/AllGallery';
import PhotoModal from './components/PhotoModal';
import PlacesPage from './components/PlacesPage';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { fetchPhotos } from './data/photos';

const getInitialState = (key, defaultValue) => {
  const saved = localStorage.getItem(key);
  if (saved !== null) return JSON.parse(saved);
  return defaultValue;
};

// Ordered cycle of sort modes
const SORT_MODES = ['date-desc', 'date-asc', 'alpha-asc', 'alpha-desc', 'random'];

const applySort = (array, sortMode) => {
  switch (sortMode) {
    case 'date-asc':   return [...array].sort((a, b) => new Date(a.uploaded) - new Date(b.uploaded));
    case 'alpha-asc':  return [...array].sort((a, b) => (a.writers[0] ?? '').localeCompare(b.writers[0] ?? ''));
    case 'alpha-desc': return [...array].sort((a, b) => (b.writers[0] ?? '').localeCompare(a.writers[0] ?? ''));
    case 'random':     return [...array].sort(() => Math.random() - 0.5);
    default:           return [...array].sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
  }
};

const applySortValues = (values, sortMode) => {
  switch (sortMode) {
    case 'alpha-desc': return [...values].sort((a, b) => b.localeCompare(a));
    case 'random':     return [...values].sort(() => Math.random() - 0.5);
    default:           return [...values].sort((a, b) => a.localeCompare(b));
  }
};

function AppContent() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => getInitialState('darkMode', false));
  const [layoutMode, setLayoutMode] = useState(() => getInitialState('layoutMode', 'masonry'));
  const [sortMode, setSortMode] = useState(() => getInitialState('sortMode', 'date-desc'));

  useEffect(() => { localStorage.setItem('darkMode', JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('layoutMode', JSON.stringify(layoutMode)); }, [layoutMode]);
  useEffect(() => { localStorage.setItem('sortMode', JSON.stringify(sortMode)); }, [sortMode]);

  const handleLayoutToggle = () => {
    const modes = ['masonry', 'grid', 'single', 'full'];
    setLayoutMode(modes[(modes.indexOf(layoutMode) + 1) % modes.length]);
  };

  const handleSortToggle = () => {
    setSortMode(SORT_MODES[(SORT_MODES.indexOf(sortMode) + 1) % SORT_MODES.length]);
  };

  // --- Async photo loading ---
  const [basePhotos, setBasePhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchPhotos()
      .then(data => { setBasePhotos(data); setLoading(false); })
      .catch(err => { setLoadError(err.message); setLoading(false); });
  }, []);

  const [activeFilters, setActiveFilters] = useState({ writer: null, what: null, where: null });
  const [activeGallery, setActiveGallery] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Unique filter values — writers are flattened from arrays
  const writers = useMemo(() => [...new Set(basePhotos.flatMap(p => p.writers))].sort(), [basePhotos]);
  const whats   = useMemo(() => [...new Set(basePhotos.map(p => p.what).filter(Boolean))].sort(),   [basePhotos]);
  const wheres  = useMemo(() => [...new Set(basePhotos.map(p => p.where).filter(Boolean))].sort(),  [basePhotos]);

  // Filtered then sorted photo list for PhotoGrid
  // writer filter: photo matches if ANY of its writers match the active filter
  const displayPhotos = useMemo(() => {
    const filtered = basePhotos.filter(photo => {
      if (activeFilters.writer && !photo.writers.includes(activeFilters.writer)) return false;
      if (activeFilters.what   && photo.what  !== activeFilters.what)            return false;
      if (activeFilters.where  && photo.where !== activeFilters.where)           return false;
      return true;
    });
    return applySort(filtered, sortMode);
  }, [basePhotos, activeFilters, sortMode]);

  // Sorted values for AllGallery cards
  const gallerySortedValues = useMemo(() => ({
    writer: applySortValues(writers, sortMode),
    what:   applySortValues(whats,   sortMode),
    where:  applySortValues(wheres,  sortMode),
  }), [writers, whats, wheres, sortMode]);

  const galleryConfig = {
    writer: { field: 'writer', values: gallerySortedValues.writer },
    what:   { field: 'what',   values: gallerySortedValues.what },
    where:  { field: 'where',  values: gallerySortedValues.where },
  };

  const clearAllFilters = () => setActiveFilters({ writer: null, what: null, where: null });

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({ ...prev, [type]: value === prev[type] ? null : value }));
  };

  const handleGallerySelect = (field, value) => { handleFilterChange(field, value); setActiveGallery(null); navigate('/'); };
  const handleShowGallery   = (field) => { setActiveGallery(prev => prev === field ? null : field); navigate('/'); };

  // Breadcrumb builder
  const buildBreadcrumbs = () => {
    const crumbs = [];
    const hasAnything = activeGallery || activeFilters.writer || activeFilters.what || activeFilters.where;

    crumbs.push(
      hasAnything
        ? <button key="root" className="breadcrumb-link" onClick={() => { clearAllFilters(); setActiveGallery(null); }}>All Graff</button>
        : <span key="root" className="breadcrumb-text">All Graff</span>
    );

    if (activeGallery) {
      const label = activeGallery === 'writer' ? 'Writers' : activeGallery === 'what' ? 'What' : 'Where';
      crumbs.push(<span key="sep1" className="breadcrumb-sep">/</span>);
      crumbs.push(<span key="gallery" className="breadcrumb-text">{label}</span>);
    } else {
      [
        { key: 'writer', value: activeFilters.writer },
        { key: 'what',   value: activeFilters.what },
        { key: 'where',  value: activeFilters.where },
      ].filter(f => f.value).forEach((f, i) => {
        crumbs.push(<span key={`sep${i}`} className="breadcrumb-sep">/</span>);
        crumbs.push(
          <button key={f.key} className="breadcrumb-link" onClick={() => handleFilterChange(f.key, f.value)}>
            {f.value}
          </button>
        );
      });
    }

    return crumbs;
  };

  return (
    <>
      <div className="app" data-theme={darkMode ? 'dark' : 'light'}>
        <Sidebar
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode(!darkMode)}
          layoutMode={layoutMode}
          onLayoutToggle={handleLayoutToggle}
          sortMode={sortMode}
          onSortToggle={handleSortToggle}
          writers={writers}
          activeWriter={activeFilters.writer}
          onWriterChange={(val) => { handleFilterChange('writer', val); setActiveGallery(null); navigate('/'); }}
          whats={whats}
          activeWhat={activeFilters.what}
          onWhatChange={(val) => { handleFilterChange('what', val); setActiveGallery(null); navigate('/'); }}
          wheres={wheres}
          activeWhere={activeFilters.where}
          onWhereChange={(val) => { handleFilterChange('where', val); setActiveGallery(null); navigate('/'); }}
          activeGallery={activeGallery}
          onShowGallery={handleShowGallery}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <div className="route-wrapper">
                <div className="breadcrumb-bar">{buildBreadcrumbs()}</div>

                {loading && (
                  <div className="photo-grid-empty">
                    <p className="photo-grid-empty-title">Loading photos…</p>
                  </div>
                )}

                {loadError && (
                  <div className="photo-grid-empty">
                    <p className="photo-grid-empty-title">Could not load photos</p>
                    <p className="photo-grid-empty-subtitle">{loadError}</p>
                  </div>
                )}

                {!loading && !loadError && (
                  activeGallery ? (
                    <AllGallery
                      allPhotos={basePhotos}
                      field={galleryConfig[activeGallery].field}
                      values={galleryConfig[activeGallery].values}
                      onSelect={(value) => handleGallerySelect(activeGallery, value)}
                      layoutMode={layoutMode}
                    />
                  ) : (
                    <PhotoGrid
                      photos={displayPhotos}
                      onPhotoClick={setSelectedPhoto}
                      colorMode={true}
                      layoutMode={layoutMode}
                      onClearFilters={clearAllFilters}
                    />
                  )
                )}
              </div>
            } />
            <Route path="/places" element={
              <div className="route-wrapper">
                <div className="breadcrumb-bar">
                  <span className="breadcrumb-text">Places &amp; Spaces</span>
                </div>
                <PlacesPage layoutMode={layoutMode} sortMode={sortMode} />
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photos={displayPhotos}
          onNavigate={setSelectedPhoto}
          onSelectFilter={(field, value) => { setActiveFilters({ writer: null, what: null, where: null, [field]: value }); setActiveGallery(null); }}
        />
      </div>
    </>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppContent />
    </Router>
  );
}

export default App;
