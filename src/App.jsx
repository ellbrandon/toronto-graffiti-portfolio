import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PhotoGrid from './components/PhotoGrid';
import AllGallery from './components/AllGallery';
import PhotoModal from './components/PhotoModal';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { photos } from './data/photos';

const sortByNewest = (array) =>
  [...array].sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

const getInitialState = (key, defaultValue) => {
  const saved = localStorage.getItem(key);
  if (saved !== null) {
    return JSON.parse(saved);
  }
  return defaultValue;
};

function App() {
  const [darkMode, setDarkMode] = useState(() => getInitialState('darkMode', true));
  const [layoutMode, setLayoutMode] = useState(() => getInitialState('layoutMode', 'masonry'));

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('layoutMode', JSON.stringify(layoutMode));
  }, [layoutMode]);

  const handleLayoutToggle = () => {
    const modes = ['masonry', 'grid', 'single', 'full'];
    const nextIndex = (modes.indexOf(layoutMode) + 1) % modes.length;
    setLayoutMode(modes[nextIndex]);
  };

  const [sortedPhotos] = useState(() => sortByNewest(photos));

  const [activeFilters, setActiveFilters] = useState({
    writer: null,
    what: null,
    where: null,
  });

  // null = photo grid, 'writer' | 'what' | 'where' = that all-gallery is shown
  const [activeGallery, setActiveGallery] = useState(null);

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Unique sorted values for each field
  const writers = useMemo(() => [...new Set(sortedPhotos.map(p => p.writer))].sort(), [sortedPhotos]);
  const whats   = useMemo(() => [...new Set(sortedPhotos.map(p => p.what))].sort(),   [sortedPhotos]);
  const wheres  = useMemo(() => [...new Set(sortedPhotos.map(p => p.where))].sort(),  [sortedPhotos]);

  const filteredPhotos = useMemo(() => {
    return sortedPhotos.filter(photo => {
      if (activeFilters.writer && photo.writer !== activeFilters.writer) return false;
      if (activeFilters.what   && photo.what   !== activeFilters.what)   return false;
      if (activeFilters.where  && photo.where  !== activeFilters.where)  return false;
      return true;
    });
  }, [sortedPhotos, activeFilters]);

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value === prev[type] ? null : value
    }));
  };

  // Clicking a card in AllGallery applies that filter and returns to photo grid
  const handleGallerySelect = (field, value) => {
    handleFilterChange(field, value);
    setActiveGallery(null);
  };

  // Toggle a gallery panel; clicking the same one again closes it
  const handleShowGallery = (field) => {
    setActiveGallery(prev => prev === field ? null : field);
  };

  const galleryConfig = {
    writer: { field: 'writer', values: writers },
    what:   { field: 'what',   values: whats },
    where:  { field: 'where',  values: wheres },
  };

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="app" style={{
        display: 'flex',
        backgroundColor: darkMode ? '#000000' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
        transition: 'background-color 0.3s, color 0.3s'
      }}>
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

        <main className="main-content" style={{
          marginLeft: '250px',
          width: 'calc(100% - 250px)',
          height: '100vh',
          overflowY: 'auto',
          paddingTop: '0',
          backgroundColor: darkMode ? '#000000' : '#ffffff',
          transition: 'background-color 0.3s'
        }}>
          <Routes>
            <Route path="/" element={
                <div style={{ paddingTop: '40px' }}>
                  {/* Breadcrumbs */}
                  {(() => {
                    const crumbs = [];
                    const crumbStyle = { fontSize: '0.7rem', color: 'var(--hover-color)', letterSpacing: '0.05em' };
                    const sepStyle = { ...crumbStyle, margin: '0 6px' };
                    const linkStyle = { ...crumbStyle, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', background: 'none', border: 'none', padding: 0, color: 'var(--hover-color)' };

                    // Root crumb — always present
                    const hasAnything = activeGallery || activeFilters.writer || activeFilters.what || activeFilters.where;
                    crumbs.push(
                      hasAnything
                        ? <button key="root" style={linkStyle} onClick={() => { setActiveFilters({ writer: null, what: null, where: null }); setActiveGallery(null); }}>All Graff</button>
                        : <span key="root" style={crumbStyle}>All Graff</span>
                    );

                    if (activeGallery) {
                      // e.g. All Graff > Writers
                      const label = activeGallery === 'writer' ? 'Writers' : activeGallery === 'what' ? 'What' : 'Where';
                      crumbs.push(<span key="sep1" style={sepStyle}>/</span>);
                      crumbs.push(<span key="gallery" style={crumbStyle}>{label}</span>);
                    } else {
                      // Active filter crumbs
                      const filterEntries = [
                        { key: 'writer', value: activeFilters.writer },
                        { key: 'what',   value: activeFilters.what },
                        { key: 'where',  value: activeFilters.where },
                      ].filter(f => f.value);

                      filterEntries.forEach((f, i) => {
                        crumbs.push(<span key={`sep${i}`} style={sepStyle}>/</span>);
                        crumbs.push(
                          <button key={f.key} style={linkStyle} onClick={() => handleFilterChange(f.key, f.value)}>
                            {f.value}
                          </button>
                        );
                      });
                    }

                    return (
                      <div style={{ padding: '0 40px 16px 0', display: 'flex', alignItems: 'center' }}>
                        {crumbs}
                      </div>
                    );
                  })()}

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
                      onClearFilters={() => setActiveFilters({ writer: null, what: null, where: null })}
                    />
                  )}
                </div>
              } />
          </Routes>
        </main>

        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photos={filteredPhotos}
          onNavigate={setSelectedPhoto}
          onSelectFilter={(field, value) => { handleFilterChange(field, value); setActiveGallery(null); }}
        />

        <style>{`
          @media (max-width: 768px) {
            .main-content {
              margin-left: 0 !important;
              width: 100% !important;
              padding-top: 50px !important;
            }
          }
        `}</style>
      </div>
    </Router>
  );
}

export default App;
