import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PhotoGrid from './components/PhotoGrid';
import AllGallery from './components/AllGallery';
import PhotoModal from './components/PhotoModal';
import PlacesPage from './components/PlacesPage';
import { fetchPhotos } from './data/photos';

const SiteHeader = ({ onHomeClick }) => (
  <header className="site-header">
    <Link to="/" className="site-title-link" onClick={onHomeClick}>
      <h1 className="site-title">TORONTO GRAFFITI</h1>
      <p className="site-subtitle">ARCHIVE 2010-2025</p>
    </Link>
  </header>
);

const applySort = (array) =>
  [...array].sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dark mode: always dark unless ?theme=light is in the URL
  const lightMode = new URLSearchParams(location.search).get('theme') === 'light';

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

  const lastUpdated = useMemo(() => {
    if (!basePhotos.length) return '';
    const latest = basePhotos.reduce((a, b) => new Date(a.uploaded) > new Date(b.uploaded) ? a : b);
    return new Date(latest.uploaded).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [basePhotos]);

  // PhotoGrid: always newest-first
  const displayPhotos = useMemo(() => {
    const filtered = basePhotos.filter(photo => {
      if (activeFilters.writer && !photo.writers.includes(activeFilters.writer)) return false;
      if (activeFilters.what   && photo.what  !== activeFilters.what)            return false;
      if (activeFilters.where  && photo.where !== activeFilters.where)           return false;
      return true;
    });
    return applySort(filtered);
  }, [basePhotos, activeFilters]);

  // AllGallery: always alphabetical
  const galleryConfig = useMemo(() => ({
    writer: { field: 'writer', values: [...writers].sort((a, b) => a.localeCompare(b)) },
    what:   { field: 'what',   values: [...whats].sort((a, b) => a.localeCompare(b)) },
    where:  { field: 'where',  values: [...wheres].sort((a, b) => a.localeCompare(b)) },
  }), [writers, whats, wheres]);

  const clearAllFilters = () => setActiveFilters({ writer: null, what: null, where: null });

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({ ...prev, [type]: value === prev[type] ? null : value }));
  };

  const handleGallerySelect = (field, value) => { handleFilterChange(field, value); setActiveGallery(null); navigate('/'); };
  const handleShowGallery   = (field) => { setActiveGallery(prev => prev === field ? null : field); navigate('/'); };

  return (
    <>
      <div className="app" data-theme={lightMode ? 'light' : 'dark'}>
        <SiteHeader onHomeClick={() => { clearAllFilters(); setActiveGallery(null); navigate('/'); }} />
        <div className="app-body">
        <Sidebar
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
          onHomeClick={() => { clearAllFilters(); setActiveGallery(null); navigate('/'); }}
          photoCount={basePhotos.length}
          lastUpdated={lastUpdated}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <div className="route-wrapper">
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
                    />
                  ) : (
                    <PhotoGrid
                      photos={displayPhotos}
                      onPhotoClick={setSelectedPhoto}
                      colorMode={true}
                      onClearFilters={clearAllFilters}
                    />
                  )
                )}
              </div>
            } />
            <Route path="/places" element={
              <div className="route-wrapper">
                <PlacesPage />
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        </div>

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
