import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PhotoGrid from './components/PhotoGrid';
import AllGallery from './components/AllGallery';
import PhotoModal from './components/PhotoModal';
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
  const [placesActive, setPlacesActive] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Fixed ordered lists — define display order in dropdowns and AllGallery
  const WHAT_ORDER  = [
    'Handstyles', 'Hollows', 'Throws', 'Pieces', 'Rollers',
    'Extinguishers', 'Rappels', 'Characters', 'Details', 'Wall Wisdoms',
    'Slaps', 'Cans',
  ];
  const WHERE_ORDER = [
    'Alley', 'Bridge', 'Tunnel', 'Trackside', 'Freight',
    'Truck', 'Door', 'River', 'Gulley', 'Highway',
    'Rooftop', 'Subway', 'Bando', 'Urbex',
  ];

  // Unique filter values — writers are flattened from arrays
  const writers = useMemo(() => [...new Set(basePhotos.flatMap(p => p.writers))].sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return a.localeCompare(b);
  }), [basePhotos]);
  const whats   = useMemo(() => {
    const present = new Set(basePhotos.map(p => p.what).filter(Boolean));
    return WHAT_ORDER.filter(w => present.has(w));
  }, [basePhotos]);
  const wheres  = useMemo(() => {
    const present = new Set(basePhotos.map(p => p.where).filter(Boolean));
    return WHERE_ORDER.filter(w => present.has(w));
  }, [basePhotos]);

  const lastUpdated = useMemo(() => {
    if (!basePhotos.length) return '';
    const latest = basePhotos.reduce((a, b) => new Date(a.uploaded) > new Date(b.uploaded) ? a : b);
    return new Date(latest.uploaded).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }, [basePhotos]);

  // Main grid: filtered + sorted; Places grid: places:true only
  const displayPhotos = useMemo(() => {
    const filtered = basePhotos.filter(photo => {
      if (activeFilters.writer && !photo.writers.includes(activeFilters.writer)) return false;
      if (activeFilters.what   && photo.what  !== activeFilters.what)            return false;
      if (activeFilters.where  && photo.where !== activeFilters.where)           return false;
      return true;
    });
    return applySort(filtered);
  }, [basePhotos, activeFilters]);

  const placesPhotos = useMemo(() => applySort(basePhotos.filter(p => p.places)), [basePhotos]);

  // AllGallery: writers alphabetical, what/where use fixed order
  const galleryConfig = useMemo(() => ({
    writer: { field: 'writer', values: [...writers].sort((a, b) => {
      if (a === 'Unknown') return 1;
      if (b === 'Unknown') return -1;
      return a.localeCompare(b);
    }) },
    what:   { field: 'what',   values: whats },
    where:  { field: 'where',  values: wheres },
  }), [writers, whats, wheres]);

  // Scroll to top on any filter, gallery, or places change
  useEffect(() => {
    const scroller = document.querySelector('.main-content') ?? window;
    scroller.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeFilters, activeGallery, placesActive]);

  const clearAllFilters = () => setActiveFilters({ writer: null, what: null, where: null });

  const goHome = () => { clearAllFilters(); setActiveGallery(null); setPlacesActive(false); navigate('/'); };

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({ ...prev, [type]: value === prev[type] ? null : value }));
  };

  const handleGallerySelect = (field, value) => { handleFilterChange(field, value); setActiveGallery(null); navigate('/'); };
  const handleShowGallery   = (field) => { setActiveGallery(prev => prev === field ? null : field); setPlacesActive(false); navigate('/'); };
  const handleShowPlaces    = () => { setPlacesActive(prev => !prev); setActiveGallery(null); clearAllFilters(); navigate('/'); };

  // Active photos for the modal (places or main grid)
  const modalPhotos = placesActive ? placesPhotos : displayPhotos;

  return (
    <>
      <div className="app" data-theme={lightMode ? 'light' : 'dark'}>
        <SiteHeader onHomeClick={goHome} />
        <div className="app-body">
        <Sidebar
          writers={writers}
          activeWriter={activeFilters.writer}
          onWriterChange={(val) => { handleFilterChange('writer', val); setActiveGallery(null); setPlacesActive(false); navigate('/'); }}
          whats={whats}
          activeWhat={activeFilters.what}
          onWhatChange={(val) => { handleFilterChange('what', val); setActiveGallery(null); setPlacesActive(false); navigate('/'); }}
          wheres={wheres}
          activeWhere={activeFilters.where}
          onWhereChange={(val) => { handleFilterChange('where', val); setActiveGallery(null); setPlacesActive(false); navigate('/'); }}
          activeGallery={activeGallery}
          onShowGallery={handleShowGallery}
          onHomeClick={goHome}
          placesActive={placesActive}
          onShowPlaces={handleShowPlaces}
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
                  placesActive ? (
                    <PhotoGrid
                      photos={placesPhotos}
                      onPhotoClick={setSelectedPhoto}
                      colorMode={true}
                      onClearFilters={goHome}
                    />
                  ) : activeGallery ? (
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
                      onClearFilters={goHome}
                    />
                  )
                )}
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        </div>

        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photos={modalPhotos}
          onNavigate={setSelectedPhoto}
          onSelectFilter={(field, value) => { setActiveFilters({ writer: null, what: null, where: null, [field]: value }); setActiveGallery(null); setPlacesActive(false); }}
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
