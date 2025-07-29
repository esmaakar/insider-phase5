import React, { useState, useEffect } from 'react';

const TVShowsTopRatedNew = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('vote_average.desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [showsWithProviders, setShowsWithProviders] = useState([]);
  const [showWhereToWatch, setShowWhereToWatch] = useState(false);

  const API_KEY = '348088421ad3fb3a9d6e56bb6a9a8f80';
  const BASE_URL = 'https://api.themoviedb.org/3';

  const platforms = {
    'netflix': { name: 'Netflix', icon: '📺', id: 8 },
    'disney': { name: 'Disney+', icon: '🎭', id: 337 }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const [genresResponse, showsResponse] = await Promise.all([
          fetch(`${BASE_URL}/genre/tv/list?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=en-US&page=${page}`)
        ]);
        const genresData = await genresResponse.json();
        const showsData = await showsResponse.json();
        setGenres(genresData.genres || []);
        setShows(showsData.results || []);
        setTotalPages(showsData.total_pages || 0);
      } catch (error) {
        console.error('Error initializing data:', error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, [page]);

  useEffect(() => {
    if (page > 0) {
      fetchShows();
    }
  }, [sortBy, page, selectedGenres]);

  const fetchShows = async () => {
    setLoading(true);
    try {
      const genreParams = selectedGenres.length > 0 ? `&with_genres=${selectedGenres.join(',')}` : '';
      const response = await fetch(
        `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=${sortBy}&page=${page}${genreParams}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      let sortedShows = [...(data.results || [])];
      if (sortBy === "vote_average.desc") {
        sortedShows = sortedShows
          .filter(s => s.vote_average > 0)
          .sort((a, b) => b.vote_average - a.vote_average)
          .concat(sortedShows.filter(s => s.vote_average === 0));
      } else if (sortBy === "vote_average.asc") {
        sortedShows = sortedShows
          .filter(s => s.vote_average > 0)
          .sort((a, b) => a.vote_average - b.vote_average)
          .concat(sortedShows.filter(s => s.vote_average === 0));
      } else if (sortBy === "name.asc") {
        sortedShows = sortedShows.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      } else if (sortBy === "name.desc") {
        sortedShows = sortedShows.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      }
      setShows(sortedShows);
      setTotalPages(data.total_pages || 0);
    } catch (error) {
      console.error('Error fetching shows:', error);
      setShows([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
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
      setShowsWithProviders(shows);
    } else {
      setSelectedPlatform(platform);
      fetchShowsWithProviders(platform);
    }
  };

  const fetchShowsWithProviders = async (platform) => {
    setLoading(true);
    try {
      const platformData = platforms[platform];
      if (!platformData) return;
      const filteredShows = [];
      for (const show of shows) {
        try {
          const response = await fetch(
            `${BASE_URL}/tv/${show.id}/watch/providers?api_key=${API_KEY}`
          );
          if (response.ok) {
            const data = await response.json();
            const results = data.results;
            if (results && results.US) {
              const providers = results.US;
              const isAvailable =
                (providers.flatrate && providers.flatrate.some(p => p.provider_id === platformData.id)) ||
                (providers.free && providers.free.some(p => p.provider_id === platformData.id)) ||
                (providers.ads && providers.ads.some(p => p.provider_id === platformData.id)) ||
                (providers.rent && providers.rent.some(p => p.provider_id === platformData.id)) ||
                (providers.buy && providers.buy.some(p => p.provider_id === platformData.id));
              if (isAvailable) {
                filteredShows.push(show);
              }
            }
          }
        } catch (error) {}
      }
      setShowsWithProviders(filteredShows);
    } catch (error) {
      setShowsWithProviders([]);
    } finally {
      setLoading(false);
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

  const displayShows = selectedPlatform ? showsWithProviders : shows;

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading Top Rated TV Shows...</h2>
      </div>
    );
  }

  if (displayShows.length === 0) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ width: '300px', backgroundColor: '#f8f9fa', padding: '2rem', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: '#333', textAlign: 'left', display: 'block', position: 'relative', zIndex: 10 }}>
            Top Rated TV Shows
          </h1>
          <div style={{ marginBottom: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Sort</h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Sort Results By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#f8f9fa', color: '#333' }}>
                <option value="popularity.desc">Popularity Descending</option>
                <option value="popularity.asc">Popularity Ascending</option>
                <option value="vote_average.desc">Rating Descending</option>
                <option value="vote_average.asc">Rating Ascending</option>
                <option value="name.asc">Title A-Z</option>
                <option value="name.desc">Title Z-A</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Filters</h3>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }} onClick={() => setShowFilters(!showFilters)}>
              <span style={{ flex: 1, fontSize: '0.9rem', color: '#666' }}>Filters</span>
              <span style={{ fontSize: '1.2rem', color: '#666', transform: showFilters ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontWeight: 'bold' }}>→</span>
            </div>
            {showFilters && (
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>Genres</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {genres.map((genre) => (
                    <label key={genre.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', padding: '0.25rem 0' }}>
                      <input type="checkbox" checked={selectedGenres.includes(genre.id)} onChange={() => handleGenreToggle(genre.id)} style={{ marginRight: '0.5rem' }} />
                      {genre.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ marginBottom: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Where To Watch</h3>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }} onClick={() => setShowWhereToWatch(!showWhereToWatch)}>
              <span style={{ flex: 1, fontSize: '0.9rem', color: '#666' }}>Where To Watch</span>
              <span style={{ fontSize: '1.2rem', color: '#666', transform: showWhereToWatch ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontWeight: 'bold' }}>→</span>
            </div>
            {showWhereToWatch && (
              <div style={{ marginBottom: '1rem' }}>
                {Object.entries(platforms).map(([key, platform]) => (
                  <div key={key} onClick={() => handlePlatformSelect(key)} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem', borderRadius: '6px', backgroundColor: selectedPlatform === key ? '#e3f2fd' : '#f8f9fa', border: selectedPlatform === key ? '2px solid #2196f3' : '1px solid transparent', transition: 'all 0.2s' }}>
                    <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>{platform.icon}</span>
                    {platform.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ marginLeft: '300px', padding: '2rem', paddingTop: '6rem', flex: 1 }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '2rem', color: '#666', marginBottom: '1rem' }}>No TV shows found</h2>
            <p style={{ fontSize: '1.1rem', color: '#999', marginBottom: '2rem' }}>Try adjusting your filters or search criteria.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ width: '300px', backgroundColor: '#f8f9fa', padding: '2rem', position: 'fixed', height: '100vh', overflowY: 'auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', marginTop:'4rem',color: '#333', textAlign: 'left', display: 'block', position: 'relative', zIndex: 10 }}>
          Top Rated TV Shows
        </h1>
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Sort</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>Sort Results By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#f8f9fa', color: '#333' }}>
              <option value="popularity.desc">Popularity Descending</option>
              <option value="popularity.asc">Popularity Ascending</option>
              <option value="vote_average.desc">Rating Descending</option>
              <option value="vote_average.asc">Rating Ascending</option>
              <option value="name.asc">Title A-Z</option>
              <option value="name.desc">Title Z-A</option>
            </select>
          </div>
        </div>
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Filters</h3>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }} onClick={() => setShowFilters(!showFilters)}>
            <span style={{ flex: 1, fontSize: '0.9rem', color: '#666' }}>Filters</span>
            <span style={{ fontSize: '1.2rem', color: '#666', transform: showFilters ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontWeight: 'bold' }}>→</span>
          </div>
          {showFilters && (
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333' }}>Genres</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {genres.map((genre) => (
                  <label key={genre.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', padding: '0.25rem 0' }}>
                    <input type="checkbox" checked={selectedGenres.includes(genre.id)} onChange={() => handleGenreToggle(genre.id)} style={{ marginRight: '0.5rem' }} />
                    {genre.name}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
        <div style={{ marginBottom: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>Where To Watch</h3>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '1rem' }} onClick={() => setShowWhereToWatch(!showWhereToWatch)}>
            <span style={{ flex: 1, fontSize: '0.9rem', color: '#666' }}>Where To Watch</span>
            <span style={{ fontSize: '1.2rem', color: '#666', transform: showWhereToWatch ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontWeight: 'bold' }}>→</span>
          </div>
          {showWhereToWatch && (
            <div style={{ marginBottom: '1rem' }}>
              {Object.entries(platforms).map(([key, platform]) => (
                <div key={key} onClick={() => handlePlatformSelect(key)} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', padding: '0.5rem', borderRadius: '6px', backgroundColor: selectedPlatform === key ? '#e3f2fd' : '#f8f9fa', border: selectedPlatform === key ? '2px solid #2196f3' : '1px solid transparent', transition: 'all 0.2s' }}>
                  <span style={{ marginRight: '0.5rem', fontSize: '1.2rem' }}>{platform.icon}</span>
                  {platform.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ marginLeft: '300px', padding: '2rem', paddingTop: '6rem', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {displayShows.map((show) => (
            <div key={show.id} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', transition: 'transform 0.2s', cursor: 'pointer' }}>
              <div style={{ position: 'relative' }}>
                <img src={show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image'} alt={show.name} style={{ width: '100%', height: 'auto', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: '8px', left: '8px', backgroundColor: getRatingColor(Math.round(show.vote_average * 10)), color: '#fff', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid #fff' }}>
                  {Math.round(show.vote_average * 10)}%
                </div>
              </div>
              <div style={{ padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#333', lineHeight: '1.3' }}>{show.name}</h3>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: 0 }}>{formatDate(show.first_air_date)}</p>
              </div>
            </div>
          ))}
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', backgroundColor: page === 1 ? '#f5f5f5' : '#fff', color: page === 1 ? '#999' : '#333', borderRadius: '4px', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Previous</button>
            <span style={{ padding: '0.5rem 1rem', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} style={{ padding: '0.5rem 1rem', border: '1px solid #ddd', backgroundColor: page === totalPages ? '#f5f5f5' : '#fff', color: page === totalPages ? '#999' : '#333', borderRadius: '4px', cursor: page === totalPages ? 'not-allowed' : 'pointer' }}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TVShowsTopRatedNew;