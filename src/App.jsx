import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PhotoGrid from './components/PhotoGrid';
import PhotoModal from './components/PhotoModal';
import CursorEffect from './components/CursorEffect';
import MagicCursor from './components/MagicCursor';
import About from './pages/About';
import Contact from './pages/Contact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { photos } from './data/photos';

// Feature Flags
const ENABLE_MAGIC_CURSOR = true;
const MAGIC_CURSOR_SIZE_DEFAULT = 25; // Default size in pixels
const MAGIC_CURSOR_SIZE_HOVER = 50;   // Zoomed size in pixels

// Shuffle function
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

function App() {
  const [cursorEffectEnabled, setCursorEffectEnabled] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [colorMode, setColorMode] = useState(false); // false = grayscale default, true = color default
  const [shuffledPhotos, setShuffledPhotos] = useState(() => shuffleArray(photos));
  const [activeFilters, setActiveFilters] = useState({
    location: null,
    style: null,
    author: null
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Extract unique filter options
  const filters = useMemo(() => {
    const locations = [...new Set(shuffledPhotos.map(p => p.location))].sort();
    const styles = [...new Set(shuffledPhotos.map(p => p.style))].sort();
    const authors = [...new Set(shuffledPhotos.map(p => p.author))].sort();
    return { locations, styles, authors };
  }, [shuffledPhotos]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return shuffledPhotos.filter(photo => {
      if (activeFilters.location && photo.location !== activeFilters.location) return false;
      if (activeFilters.style && photo.style !== activeFilters.style) return false;
      if (activeFilters.author && photo.author !== activeFilters.author) return false;
      return true;
    });
  }, [shuffledPhotos, activeFilters]);

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value === prev[type] ? null : value
    }));
  };

  const handleShuffle = () => {
    setShuffledPhotos(shuffleArray(photos));
    setActiveFilters({
      location: null,
      style: null,
      author: null
    });
  };

  return (
    <Router>
      <div className="app" style={{
        display: 'flex',
        backgroundColor: darkMode ? '#000000' : '#ffffff',
        color: darkMode ? '#ffffff' : '#000000',
        transition: 'background-color 0.3s, color 0.3s'
      }}>
        <Sidebar
          filters={filters}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          darkMode={darkMode}
          onThemeToggle={() => setDarkMode(!darkMode)}
          cursorEffectEnabled={cursorEffectEnabled}
          onCursorToggle={() => setCursorEffectEnabled(!cursorEffectEnabled)}
          colorMode={colorMode}
          onColorModeToggle={() => setColorMode(!colorMode)}
          onShuffle={handleShuffle}
        />

        <main className="main-content" style={{
          marginLeft: '250px',
          width: 'calc(100% - 250px)',
          height: '100vh',
          overflowY: 'auto',
          // paddingTop: '40px', // Removed padding here, manage in components or routes if needed, specifically About needs full height
          paddingTop: '0',
          backgroundColor: darkMode ? '#000000' : '#ffffff',
          transition: 'background-color 0.3s'
        }}>
          <div style={{ paddingTop: '40px' }}> {/* Wrap potentially scrolling content like PhotoGrid if needed, or just apply padding to PhotoGrid container */}
            <Routes>
              <Route path="/" element={
                <div style={{ paddingTop: '40px' }}>
                  <PhotoGrid
                    photos={filteredPhotos}
                    onPhotoClick={setSelectedPhoto}
                    colorMode={colorMode}
                  />
                </div>
              } />
              <Route path="/about" element={<About darkMode={darkMode} colorMode={colorMode} />} />
              <Route path="/contact" element={<Contact darkMode={darkMode} colorMode={colorMode} />} />
            </Routes>
          </div>
        </main>

        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photos={filteredPhotos}
          onNavigate={setSelectedPhoto}
        />

        {cursorEffectEnabled && <CursorEffect />}
        {ENABLE_MAGIC_CURSOR && (
          <MagicCursor
            darkMode={darkMode}
            outerSize={MAGIC_CURSOR_SIZE_DEFAULT}
            hoverScale={MAGIC_CURSOR_SIZE_HOVER / MAGIC_CURSOR_SIZE_DEFAULT}
          />
        )}

        <style>{`
          @media (max-width: 768px) {
            .main-content {
              margin-left: 0 !important;
              width: 100% !important;
              padding-top: 50px !important; /* Adjusted for mobile header */
            }
          }
        `}</style>
      </div>
    </Router>
  );
}

export default App;
