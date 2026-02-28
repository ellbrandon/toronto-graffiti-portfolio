import { useState, useMemo } from 'react';
import PhotoGrid from './PhotoGrid';
import PlacesModal from './PlacesModal';
import { places as allPlaces } from '../data/places';

const applySort = (array, sortMode) => {
    switch (sortMode) {
        case 'date-asc':   return [...array].sort((a, b) => new Date(a.uploaded) - new Date(b.uploaded));
        case 'alpha-asc':  return [...array].sort((a, b) => a.description.localeCompare(b.description));
        case 'alpha-desc': return [...array].sort((a, b) => b.description.localeCompare(a.description));
        case 'random':     return [...array].sort(() => Math.random() - 0.5);
        default:           return [...array].sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded));
    }
};

const PlacesPage = () => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const displayPlaces = useMemo(
        () => applySort(allPlaces, 'date-desc'),
        []
    );

    return (
        <>
            <PhotoGrid
                photos={displayPlaces}
                onPhotoClick={setSelectedPhoto}
                colorMode={true}
                onClearFilters={() => {}}
            />
            <PlacesModal
                photo={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
                photos={displayPlaces}
                onNavigate={setSelectedPhoto}
            />
        </>
    );
};

export default PlacesPage;
