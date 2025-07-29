import Navbar from "./components/Navbar";
import "./App.css";
import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import PopularMenu from "./components/PopularMenu";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MoviesPopular from './components/MoviesPopular';
import MoviesPopularNew from './components/MoviesPopularNew';

const MoviesUpcoming = () => <div style={{padding:32}}><h2>Upcoming Movies</h2></div>;
const MoviesTopRated = () => <div style={{padding:32}}><h2>Top Rated Movies</h2></div>;
const TVShowsPopular = () => <div style={{padding:32}}><h2>Popular TV Shows</h2></div>;
const TVShowsAiringToday = () => <div style={{padding:32}}><h2>TV Shows Airing Today</h2></div>;
const TVShowsOnTV = () => <div style={{padding:32}}><h2>TV Shows On TV</h2></div>;
const TVShowsTopRated = () => <div style={{padding:32}}><h2>Top Rated TV Shows</h2></div>;

function App() {
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  let debounceTimeout = useRef();

  // Bu fonksiyon, Navbar'a prop olarak verilecek
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    setSearchLoading(true);
    setShowResults(false);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=348088421ad3fb3a9d6e56bb6a9a8f80&language=en-US&query=${encodeURIComponent(
          searchTerm
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data.results || []);
          setShowResults(true);
        })
        .finally(() => setSearchLoading(false));
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm]);

  return (
    <Router>
      <SimpleBar style={{ maxHeight: '100vh' }} autoHide={false} scrollbarMaxSize={60} scrollbarMinSize={60}>
        <Navbar onSearchIconClick={focusSearchInput} />
        <Routes>
          <Route path="/" element={
            <>
              {/* Arama kutusu tam navbarın altında, hiçbir margin yok */}
              <div className="search-bar-wrapper" style={{ position: 'relative' }}>
                <i
                  className="ri-search-line search-bar-icon"
                  onClick={() => {
                    if (searchInputRef.current) searchInputRef.current.focus();
                  }}
                  style={{ cursor: "pointer" }}
                ></i>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="search-bar-input"
                  placeholder="Search for a movie, TV show, person..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
                  onBlur={() => setTimeout(() => setShowResults(false), 200)}
                />
                {showResults && (
                  <div className="search-results-dropdown" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    background: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    borderRadius: '0 0 6px 6px',
                    zIndex: 20000,
                    maxHeight: '350px',
                    overflowY: 'auto',
                  }}>
                    {searchLoading ? (
                      <div style={{ padding: '1rem', textAlign: 'center' }}>Loading...</div>
                    ) : searchResults.length === 0 ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: '#888' }}>No results found.</div>
                    ) : (
                      searchResults.map((item, idx) => {
                        let icon = <i className="ri-search-line" style={{ fontSize: '0.95rem', marginRight: 8, color: '#111' }}></i>;
                        if (idx < 3) {
                          if (item.media_type === 'movie') {
                            icon = <i className="ri-movie-2-fill" style={{ fontSize: '0.95rem', marginRight: 8, color: '#111' }}></i>;
                          } else if (item.media_type === 'tv') {
                            icon = <i className="ri-tv-2-fill" style={{ fontSize: '0.95rem', marginRight: 8, color: '#111' }}></i>;
                          } else if (item.media_type === 'person') {
                            icon = <i className="ri-user-3-fill" style={{ fontSize: '0.95rem', marginRight: 8, color: '#111' }}></i>;
                          }
                        }
                        const isFirst = idx === 0;
                        const isLast = idx === searchResults.length - 1;
                        return (
                          <div key={item.id} style={{
                            padding: '0.45rem 0 0.45rem 0',
                            borderTop: isFirst ? '1px solid #ececec' : undefined,
                            borderBottom: isLast ? '1px solid #ececec' : '1px solid #ececec',
                            cursor: 'pointer',
                            background: '#fff',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.92rem', color: '#222', marginLeft: 100 }}>
                              {icon}
                              <span style={{ fontWeight: item.media_type ? 600 : 400 }}>{item.title || item.name}</span>
                              {idx < 3 && item.media_type === 'movie' && <span style={{ color: '#888', marginLeft: 6, fontSize: '0.95em' }}>in Movies</span>}
                              {idx < 3 && item.media_type === 'tv' && <span style={{ color: '#888', marginLeft: 6, fontSize: '0.95em' }}>in TV Shows</span>}
                              {idx < 3 && item.media_type === 'person' && <span style={{ color: '#888', marginLeft: 6, fontSize: '0.95em' }}>in People</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              {/* Hero Section Başlangıcı */}
              <div className="hero-section">
                <div className="hero-content">
                  <h1>Welcome.</h1>
                  <p>Millions of movies, TV shows and people to discover. Explore now.</p>
                  <div className="hero-search-bar">
                    <input type="text" placeholder="Search for a movie, TV show, person..." />
                    <button>Search</button>
                  </div>
                </div>
              </div>
              <PopularMenu />
              {/* Diğer içerikler aşağıda, margin yok */}
              <div style={{ textAlign: "center" }}>
                {/* Buraya kendi içeriklerinizi ekleyebilirsiniz */}
              </div>
            </>
          } />
          <Route path="/movies/popular" element={<MoviesPopularNew />} />
          <Route path="/movies/upcoming" element={<MoviesUpcoming />} />
          <Route path="/movies/top-rated" element={<MoviesTopRated />} />
          <Route path="/tv/popular" element={<TVShowsPopular />} />
          <Route path="/tv/airing-today" element={<TVShowsAiringToday />} />
          <Route path="/tv/on-tv" element={<TVShowsOnTV />} />
          <Route path="/tv/top-rated" element={<TVShowsTopRated />} />
        </Routes>
      </SimpleBar>
    </Router>
  );
}

export default App;
