import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MoviesPopular = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showWhereToWatch, setShowWhereToWatch] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [moviesWithProviders, setMoviesWithProviders] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const API_KEY = '348088421ad3fb3a9d6e56bb6a9a8f80';
  const BASE_URL = 'https://api.themoviedb.org/3';

  // Platform mapping
  const platforms = {
    'netflix': { name: 'Netflix', icon: '📺', id: 8 },
    'amazon': { name: 'Amazon Prime', icon: '🛒', id: 119 },
    'disney': { name: 'Disney+', icon: '🎭', id: 2 },
    'hulu': { name: 'Hulu', icon: '📺', id: 15 },
    'theaters': { name: 'In Theaters', icon: '🎬', id: 'theaters' },
    'tv': { name: 'On TV', icon: '📺', id: 'tv' }
  };

  useEffect(() => {
    // Component ilk mount olduğunda
    if (!isInitialized) {
      fetchGenres();
      fetchMovies();
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    // Sadece initialized olduktan sonra değişiklikleri takip et
    if (isInitialized) {
      fetchMovies();
    }
  }, [sortBy, page, selectedGenres]);

  useEffect(() => {
    // Platform değişikliklerini takip et
    if (isInitialized) {
      if (selectedPlatform) {
        fetchMoviesWithProviders();
      } else {
        setMoviesWithProviders(movies);
      }
    }
  }, [selectedPlatform, movies]);

  const fetchGenres = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=en-US`
      );
      const data = await response.json();
      setGenres(data.genres);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const genreParams = selectedGenres.length > 0 ? `&with_genres=${selectedGenres.join(',')}` : '';
      const response = await fetch(
        `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=${sortBy}&page=${page}${genreParams}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setMovies(data.results || []);
      setTotalPages(data.total_pages || 0);
      
      // Platform seçili değilse moviesWithProviders'ı da güncelle
      if (!selectedPlatform) {
        setMoviesWithProviders(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      setMovies([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchMoviesWithProviders = async () => {
    if (!selectedPlatform) return;

    setLoading(true);
    const moviesWithProvidersData = [];

    for (const movie of movies) {
      try {
        const response = await fetch(
          `${BASE_URL}/movie/${movie.id}/watch/providers?api_key=${API_KEY}`
        );
        const data = await response.json();
        
        const usProviders = data.results?.US;
        let isAvailable = false;

        if (selectedPlatform === 'theaters') {
          // Check if movie is in theaters (released within last 3 months)
          const releaseDate = new Date(movie.release_date);
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          isAvailable = releaseDate >= threeMonthsAgo;
        } else if (selectedPlatform === 'tv') {
          // Check if movie has TV airing info
          isAvailable = usProviders?.flatrate || usProviders?.free || usProviders?.ads;
        } else {
          // Check specific platform
          const platformId = platforms[selectedPlatform]?.id;
          if (platformId) {
            isAvailable = usProviders?.flatrate?.some(provider => provider.provider_id === platformId) ||
                         usProviders?.free?.some(provider => provider.provider_id === platformId) ||
                         usProviders?.ads?.some(provider => provider.provider_id === platformId);
          }
        }

        if (isAvailable) {
          moviesWithProvidersData.push({
            ...movie,
            providers: usProviders
          });
        }
      } catch (error) {
        console.error(`Error fetching providers for movie ${movie.id}:`, error);
      }
    }

    setMoviesWithProviders(moviesWithProvidersData);
    setLoading(false);
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
    setPage(1);
  };

  const handlePlatformSelect = (platform) => {
    if (selectedPlatform === platform) {
      setSelectedPlatform(null);
    } else {
      setSelectedPlatform(platform);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRatingColor = (rating) => {
    if (rating >= 70) return '#21d07a';
    if (rating >= 50) return '#d2d531';
    return '#db2360';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading Popular Movies...</h2>
      </div>
    );
  }

  const displayMovies = selectedPlatform ? moviesWithProviders : (movies || []);

  // Eğer film yoksa loading göster
  if (displayMovies.length === 0 && !loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>No movies found</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '300px', 
        backgroundColor: '#fff', 
        padding: '2rem',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '2rem', color: '#333' }}>
          Popular Movies
        </h1>
        
        {/* Sort Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
            Sort
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              Sort Results By
            </label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            >
              <option value="popularity.desc">Popularity Descending</option>
              <option value="popularity.asc">Popularity Ascending</option>
              <option value="vote_average.desc">Rating Descending</option>
              <option value="vote_average.asc">Rating Ascending</option>
              <option value="release_date.desc">Release Date Descending</option>
              <option value="release_date.asc">Release Date Ascending</option>
              <option value="title.asc">Title A-Z</option>
              <option value="title.desc">Title Z-A</option>
            </select>
          </div>
        </div>

        {/* Filters Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
            Filters
          </h3>
          <div 
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <span style={{ flex: 1, fontSize: '0.9rem', color: '#666' }}>Filters</span>
            <span style={{ fontSize: '1.2rem', color: '#666', transform: showFilters ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>→</span>
          </div>
          
          {showFilters && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>
                Genres
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {genres.map((genre) => (
                  <label key={genre.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedGenres.includes(genre.id)}
                      onChange={() => handleGenreToggle(genre.id)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    {genre.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Where To Watch Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
            Where To Watch
          </h3>
          <div 
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }}
            onClick={() => setShowWhereToWatch(!showWhereToWatch)}
          >
            <span style={{ flex: 1, fontSize: '0.9rem', color: '#666' }}>Where To Watch</span>
            <span style={{ fontSize: '1.2rem', color: '#666', transform: showWhereToWatch ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>→</span>
          </div>
          
          {showWhereToWatch && (
            <div style={{ marginBottom: '1rem' }}>
              {Object.entries(platforms).map(([key, platform]) => (
                <div 
                  key={key}
                  onClick={() => handlePlatformSelect(key)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    backgroundColor: selectedPlatform === key ? '#e3f2fd' : '#f8f9fa',
                    border: selectedPlatform === key ? '1px solid #2196f3' : '1px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>{platform.icon}</span>
                  {platform.name}
                  {selectedPlatform === key && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#2196f3' }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button style={{
          width: '100%',
          padding: '0.8rem',
          backgroundColor: '#666',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          fontSize: '0.9rem',
          cursor: 'pointer'
        }}>
          Search
        </button>
      </div>

      {/* Main Content */}
      <div style={{ 
        marginLeft: '300px', 
        padding: '2rem',
        paddingTop: '4rem',
        flex: 1
      }}>
        {selectedPlatform && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '1rem', color: '#1976d2' }}>
              Showing movies available on {platforms[selectedPlatform].name}
            </span>
            <button 
              onClick={() => setSelectedPlatform(null)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Clear Filter
            </button>
          </div>
        )}

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.5rem'
        }}>
          {displayMovies.map((movie) => (
            <div key={movie.id} style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src={movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : 'https://via.placeholder.com/300x450?text=No+Image'
                  }
                  alt={movie.title}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  backgroundColor: getRatingColor(Math.round(movie.vote_average * 10)),
                  color: '#fff',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  border: '2px solid #fff'
                }}>
                  {Math.round(movie.vote_average * 10)}%
                </div>
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: 'bold', 
                  marginBottom: '0.5rem',
                  color: '#333',
                  lineHeight: '1.3'
                }}>
                  {movie.title}
                </h3>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#666',
                  margin: 0
                }}>
                  {formatDate(movie.release_date)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginTop: '2rem',
            gap: '0.5rem'
          }}>
            <button 
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                backgroundColor: page === 1 ? '#f5f5f5' : '#fff',
                color: page === 1 ? '#999' : '#333',
                borderRadius: '4px',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px'
            }}>
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                backgroundColor: page === totalPages ? '#f5f5f5' : '#fff',
                color: page === totalPages ? '#999' : '#333',
                borderRadius: '4px',
                cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviesPopular;