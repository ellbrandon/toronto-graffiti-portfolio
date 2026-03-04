import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import PhotoGrid from './components/PhotoGrid';
import AllGallery from './components/AllGallery';
import PhotoModal from './components/PhotoModal';
import { fetchPhotos } from './data/photos';
import CopyrightPage from './components/CopyrightPage';

const SiteHeader = ({ onHomeClick }) => (
  <header className="site-header">
    <Link to="/" className="site-title-link" onClick={onHomeClick}>
      <h1 className="site-title">TORONTO GRAFF</h1>
    </Link>
  </header>
);

const applySort = (array) =>
  [...array].sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));

function AppContent() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const onCopyright = location.pathname === '/copyright';

  // Dark mode: always dark unless ?theme=light is in the URL
  const lightMode = searchParams.get('theme') === 'light';

  // --- Async photo loading ---
  const [basePhotos, setBasePhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchPhotos()
      .then(data => { setBasePhotos(data); setLoading(false); })
      .catch(err => { setLoadError(err.message); setLoading(false); });
  }, []);

  // View state derived from URL — no useState for these
  const activeFilters = {
    writer: searchParams.get('writer'),
    what:   searchParams.get('what'),
    where:  searchParams.get('where'),
  };
  const viewParam     = searchParams.get('view');
  const activeGallery = viewParam?.startsWith('gallery-') ? viewParam.slice('gallery-'.length) : null;
  const placesActive  = viewParam === 'places';

  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Fixed ordered lists — define display order in dropdowns and AllGallery
  const WHAT_ORDER  = [
    'Handstyles', 'Hollows', 'Throws', 'Pieces', 'Rollers',
    'Extinguishers', 'Rappels', 'Characters', 'Details', 'Wall Wisdoms',
    'Slaps', 'Cans', 'Beef',
  ];
  const WHERE_ORDER = [
    'Alley', 'Bridge', 'Tunnel', 'Trackside', 'Freight',
    'Truck', 'Door', 'River', 'Gulley', 'Highway',
    'Rooftop', 'Subway', 'Bando', 'Urbex',
  ];

  // Interdependent filter options — each dropdown shows only values present
  // in photos that satisfy the OTHER two active filters.
  const writers = useMemo(() => {
    const pool = basePhotos.filter(p => {
      if (activeFilters.what  && p.what  !== activeFilters.what)  return false;
      if (activeFilters.where && p.where !== activeFilters.where) return false;
      return true;
    });
    return [...new Set(pool.flatMap(p => p.writers))].sort((a, b) => {
      if (a === 'Unknown') return 1;
      if (b === 'Unknown') return -1;
      return a.localeCompare(b);
    });
  }, [basePhotos, activeFilters.what, activeFilters.where]);

  const whats = useMemo(() => {
    const pool = basePhotos.filter(p => {
      if (activeFilters.writer && !p.writers.includes(activeFilters.writer)) return false;
      if (activeFilters.where  && p.where !== activeFilters.where)           return false;
      return true;
    });
    const present = new Set(pool.map(p => p.what).filter(Boolean));
    return WHAT_ORDER.filter(w => present.has(w));
  }, [basePhotos, activeFilters.writer, activeFilters.where]);

  const wheres = useMemo(() => {
    const pool = basePhotos.filter(p => {
      if (activeFilters.writer && !p.writers.includes(activeFilters.writer)) return false;
      if (activeFilters.what   && p.what  !== activeFilters.what)            return false;
      return true;
    });
    const present = new Set(pool.map(p => p.where).filter(Boolean));
    return WHERE_ORDER.filter(w => present.has(w));
  }, [basePhotos, activeFilters.writer, activeFilters.what]);

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

  // Values hidden from all public-facing lists (dropdown + AllGallery)
  const SECRET_WRITERS = new Set([]);
  const SECRET_WHATS   = new Set(['Beef']);
  const SECRET_WHERES  = new Set([]);

  const publicWriters = useMemo(
    () => writers.filter(w => !SECRET_WRITERS.has(w)),
    [writers],
  );
  const publicWhats = useMemo(
    () => whats.filter(w => !SECRET_WHATS.has(w)),
    [whats],
  );
  const publicWheres = useMemo(
    () => wheres.filter(w => !SECRET_WHERES.has(w)),
    [wheres],
  );

  // AllGallery: writers alphabetical, what/where use fixed order
  const galleryConfig = useMemo(() => ({
    writer: { field: 'writer', values: [...publicWriters].sort((a, b) => {
      if (a === 'Unknown') return 1;
      if (b === 'Unknown') return -1;
      return a.localeCompare(b);
    }) },
    what:   { field: 'what',   values: publicWhats },
    where:  { field: 'where',  values: publicWheres },
  }), [publicWriters, publicWhats, publicWheres]);

  // Scroll to top on any filter, gallery, or places change
  useEffect(() => {
    const scroller = document.querySelector('.main-content') ?? window;
    scroller.scrollTo({ top: 0, behavior: 'instant' });
  }, [searchParams]);

  // Build a clean params object, preserving ?theme and omitting null values
  const buildParams = (overrides = {}) => {
    const next = {};
    if (searchParams.get('theme')) next.theme = searchParams.get('theme');
    Object.entries(overrides).forEach(([k, v]) => { if (v != null) next[k] = v; });
    return next;
  };

  // If we're on /copyright, navigate to / with the given params; otherwise just update params
  const goTo = (params) => {
    if (onCopyright) {
      const qs = new URLSearchParams(params).toString();
      navigate('/' + (qs ? '?' + qs : ''));
    } else {
      setSearchParams(params);
    }
  };

  const goHome = () => goTo(buildParams());

  const handleFilterChange = (type, value, { closeView = false } = {}) => {
    const current = searchParams.get(type);
    const next    = value === current ? null : value;
    if (next === current) return;
    goTo(buildParams({
      writer: activeFilters.writer,
      what:   activeFilters.what,
      where:  activeFilters.where,
      view:   closeView ? null : viewParam,
      [type]: next,
    }));
  };

  const handleGallerySelect = (field, value) =>
    goTo(buildParams({
      writer: activeFilters.writer,
      what:   activeFilters.what,
      where:  activeFilters.where,
      [field]: value,
    }));

  const handleShowPlaces = () => {
    const nextView = placesActive ? null : 'places';
    goTo(buildParams({ view: nextView }));
  };

  // Atomic: clear filters + open gallery in one history push (used by sidebar icon/title clicks)
  const handleClearAndShowGallery = (field) => {
    const nextView = activeGallery === field ? null : `gallery-${field}`;
    goTo(buildParams({ view: nextView }));
  };

  // Close modal on any URL change (Back/Forward while modal open)
  useEffect(() => {
    setSelectedPhoto(null);
  }, [searchParams]);

  // Active photos for the modal (places or main grid)
  const modalPhotos = placesActive ? placesPhotos : displayPhotos;

  return (
    <>
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      <div className="app" data-theme={lightMode ? 'light' : 'dark'}>
        <SiteHeader onHomeClick={goHome} />
        <div className="app-body">
        <Sidebar
          writers={publicWriters}
          secretWriters={[...SECRET_WRITERS].filter(w => writers.includes(w))}
          activeWriter={activeFilters.writer}
          onWriterChange={(val) => handleFilterChange('writer', val, { closeView: true })}
          whats={publicWhats}
          secretWhats={[...SECRET_WHATS].filter(w => whats.includes(w))}
          activeWhat={activeFilters.what}
          onWhatChange={(val) => handleFilterChange('what', val, { closeView: true })}
          wheres={publicWheres}
          secretWheres={[...SECRET_WHERES].filter(w => wheres.includes(w))}
          activeWhere={activeFilters.where}
          onWhereChange={(val) => handleFilterChange('where', val, { closeView: true })}
          activeGallery={activeGallery}
          onClearAndShowGallery={handleClearAndShowGallery}
          onHomeClick={goHome}
          placesActive={placesActive}
          onShowPlaces={handleShowPlaces}
          photoCount={basePhotos.length}
          lastUpdated={lastUpdated}
        />

        <main id="main-content" className="main-content">
          <Routes>
            <Route path="/" element={
              <div className="route-wrapper">
                {loading && (
                  <div className="photo-grid-empty" role="status" aria-live="polite">
                    <span className="loading-spinner" aria-hidden="true" />
                    <p className="photo-grid-empty-title">Loading photos…</p>
                  </div>
                )}

                {loadError && (
                  <div className="photo-grid-empty" role="alert">
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
                      field={galleryConfig[activeGallery]?.field}
                      values={galleryConfig[activeGallery]?.values ?? []}
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
            <Route path="/copyright" element={<CopyrightPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        </div>

        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photos={modalPhotos}
          onNavigate={setSelectedPhoto}
          onSelectFilter={(field, value) => goTo(buildParams({ [field]: value }))}
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
