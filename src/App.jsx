import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PhotoGrid from './components/PhotoGrid';
import AllGallery from './components/AllGallery';
import PhotoModal from './components/PhotoModal';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { photos } from './data/photos';

const sortByNewest = (array) =>
  [...array].sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

const getInitialState = (key, defaultValue) => {
  const saved = localStorage.getItem(key);
  if (saved !== null) return JSON.parse(saved);
  return defaultValue;
};

function App() {
  const [darkMode, setDarkMode] = useState(() => getInitialState('darkMode', true));
  const [layoutMode, setLayoutMode] = useState(() => getInitialState('layoutMode', 'masonry'));

  useEffect(() => { localStorage.setItem('darkMode', JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('layoutMode', JSON.stringify(layoutMode)); }, [layoutMode]);

  const handleLayoutToggle = () => {
    const modes = ['masonry', 'grid', 'single', 'full'];
    setLayoutMode(modes[(modes.indexOf(layoutMode) + 1) % modes.length]);
  };

  const [sortedPhotos] = useState(() => sortByNewest(photos));

  const [activeFilters, setActiveFilters] = useState({ writer: null, what: null, where: null });
  const [activeGallery, setActiveGallery] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const writers = useMemo(() => [...new Set(sortedPhotos.map(p => p.writer))].sort(), [sortedPhotos]);
  const whats   = useMemo(() => [...new Set(sortedPhotos.map(p => p.what))].sort(),   [sortedPhotos]);
  const wheres  = useMemo(() => [...new Set(sortedPhotos.map(p => p.where))].sort(),  [sortedPhotos]);

  const filteredPhotos = useMemo(() => sortedPhotos.filter(photo => {
    if (activeFilters.writer && photo.writer !== activeFilters.writer) return false;
    if (activeFilters.what   && photo.what   !== activeFilters.what)   return false;
    if (activeFilters.where  && photo.where  !== activeFilters.where)  return false;
    return true;
  }), [sortedPhotos, activeFilters]);

  const clearAllFilters = () => setActiveFilters({ writer: null, what: null, where: null });

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({ ...prev, [type]: value === prev[type] ? null : value }));
  };

  const handleGallerySelect = (field, value) => { handleFilterChange(field, value); setActiveGallery(null); };
  const handleShowGallery   = (field) => setActiveGallery(prev => prev === field ? null : field);

  const galleryConfig = {
    writer: { field: 'writer', values: writers },
    what:   { field: 'what',   values: whats },
    where:  { field: 'where',  values: wheres },
  };

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
    <Router basename={import.meta.env.BASE_URL}>
      <div className="app" data-theme={darkMode ? 'dark' : 'light'}>
        <Sidebar
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode(!darkMode)}
          layoutMode={layoutMode}
          onLayoutToggle={handleLayoutToggle}
          writers={writers}
          activeWriter={activeFilters.writer}
          onWriterChange={(val) => { handleFilterChange('writer', val); setActiveGallery(null); }}
          whats={whats}
          activeWhat={activeFilters.what}
          onWhatChange={(val) => { handleFilterChange('what', val); setActiveGallery(null); }}
          wheres={wheres}
          activeWhere={activeFilters.where}
          onWhereChange={(val) => { handleFilterChange('where', val); setActiveGallery(null); }}
          activeGallery={activeGallery}
          onShowGallery={handleShowGallery}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <div className="route-wrapper">
                <div className="breadcrumb-bar">{buildBreadcrumbs()}</div>

                {activeGallery ? (
                  <AllGallery
                    allPhotos={sortedPhotos}
                    field={galleryConfig[activeGallery].field}
                    values={galleryConfig[activeGallery].values}
                    onSelect={(value) => handleGallerySelect(activeGallery, value)}
                    layoutMode={layoutMode}
                  />
                ) : (
                  <PhotoGrid
                    photos={filteredPhotos}
                    onPhotoClick={setSelectedPhoto}
                    colorMode={true}
                    layoutMode={layoutMode}
                    onClearFilters={clearAllFilters}
                  />
                )}
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photos={filteredPhotos}
          onNavigate={setSelectedPhoto}
          onSelectFilter={(field, value) => { handleFilterChange(field, value); setActiveGallery(null); }}
        />
      </div>
    </Router>
  );
}

export default App;
