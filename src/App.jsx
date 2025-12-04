import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import PhotoGrid from './components/PhotoGrid';
import PhotoModal from './components/PhotoModal';
import { photos } from './data/photos';

function App() {
  const [activeFilters, setActiveFilters] = useState({
    location: null,
    style: null,
    author: null
  });
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Extract unique filter options
  const filters = useMemo(() => {
    const locations = [...new Set(photos.map(p => p.location))].sort();
    const styles = [...new Set(photos.map(p => p.style))].sort();
    const authors = [...new Set(photos.map(p => p.author))].sort();
    return { locations, styles, authors };
  }, []);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return photos.filter(photo => {
      if (activeFilters.location && photo.location !== activeFilters.location) return false;
      if (activeFilters.style && photo.style !== activeFilters.style) return false;
      if (activeFilters.author && photo.author !== activeFilters.author) return false;
      return true;
    });
  }, [activeFilters]);

  const handleFilterChange = (type, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [type]: value === prev[type] ? null : value // Toggle off if same value clicked
    }));
  };

  return (
    <div className="app" style={{ display: 'flex' }}>
      <Sidebar
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
      />

      <main style={{
        marginLeft: '250px',
        width: 'calc(100% - 250px)',
        height: '100vh',
        overflowY: 'auto',
        paddingTop: '40px'
      }}>
        <PhotoGrid
          photos={filteredPhotos}
          onPhotoClick={setSelectedPhoto}
        />
      </main>

      <PhotoModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
}

export default App;
