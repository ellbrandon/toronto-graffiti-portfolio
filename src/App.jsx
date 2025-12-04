import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PhotoGrid from './components/PhotoGrid';
import PhotoModal from './components/PhotoModal';
import CursorEffect from './components/CursorEffect';
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
  }, [activeFilters]);

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

      <main style={{
        marginLeft: '250px',
        width: 'calc(100% - 250px)',
        height: '100vh',
        overflowY: 'auto',
        paddingTop: '40px',
        backgroundColor: darkMode ? '#000000' : '#ffffff',
        transition: 'background-color 0.3s'
      }}>
        <PhotoGrid
          photos={filteredPhotos}
          onPhotoClick={setSelectedPhoto}
          colorMode={colorMode}
        />
      </main>

      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />

      {cursorEffectEnabled && <CursorEffect />}
    </div>
  );
}

export default App;
