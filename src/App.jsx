import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PhotoGrid from './components/PhotoGrid';
import PhotoModal from './components/PhotoModal';
import About from './pages/About';
import Contact from './pages/Contact';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { photos } from './data/photos';

// Shuffle function
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

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

  // Persist settings
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
  const [shuffledPhotos] = useState(() => shuffleArray(photos));
  const [activeFilters, setActiveFilters] = useState({
    writer: null,
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Extract unique filter options
  const writers = useMemo(() => {
    return [...new Set(shuffledPhotos.map(p => p.writer))].sort();
  }, [shuffledPhotos]);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return shuffledPhotos.filter(photo => {
      if (activeFilters.writer && photo.writer !== activeFilters.writer) return false;
      return true;
    });
  }, [shuffledPhotos, activeFilters]);

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value === prev[type] ? null : value
    }));
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
          onWriterChange={(val) => handleFilterChange('writer', val)}
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
                    colorMode={true}
                    layoutMode={layoutMode}
                  />
                </div>
              } />
              <Route path="/about" element={<About darkMode={darkMode} colorMode={true} />} />
              <Route path="/contact" element={<Contact darkMode={darkMode} colorMode={true} />} />
            </Routes>
          </div>
        </main>

        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          photos={filteredPhotos}
          onNavigate={setSelectedPhoto}
        />

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
