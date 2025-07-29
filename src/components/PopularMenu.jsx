import React, { useState } from "react";
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { useFavorites } from '../context/FavoritesContext.jsx';

const TABS = [
  { key: "streaming", label: "Streaming" },
  { key: "on_tv", label: "On TV" },
  { key: "for_rent", label: "For Rent" },
  { key: "in_theaters", label: "In Theaters" },
];

const API_URLS = {
  streaming: "https://api.themoviedb.org/3/discover/movie?api_key=348088421ad3fb3a9d6e56bb6a9a8f80&language=en-US&with_watch_monetization_types=flatrate",
  on_tv: "https://api.themoviedb.org/3/discover/tv?api_key=348088421ad3fb3a9d6e56bb6a9a8f80&language=en-US&with_watch_monetization_types=flatrate",
  for_rent: "https://api.themoviedb.org/3/discover/movie?api_key=348088421ad3fb3a9d6e56bb6a9a8f80&language=en-US&with_watch_monetization_types=rent",
  in_theaters: "https://api.themoviedb.org/3/movie/now_playing?api_key=348088421ad3fb3a9d6e56bb6a9a8f80&language=en-US",
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default function PopularMenu() {
  const [activeTab, setActiveTab] = useState("streaming");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  const handleTabClick = async (tab) => {
    setActiveTab(tab);
    if (!data[tab]) {
      setLoading(true);
      const res = await fetch(API_URLS[tab]);
      const json = await res.json();
      setData((prev) => ({ ...prev, [tab]: json.results }));
      setLoading(false);
    }
  };

  React.useEffect(() => {
    handleTabClick(activeTab);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="popular-menu">
      <div className="popular-header">
        <h2 className="popular-title">What's Popular</h2>
        <div className="popular-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "active" : ""}
              onClick={() => handleTabClick(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <SimpleBar className="popular-list" direction="horizontal" autoHide={false} scrollbarMaxSize={580} scrollbarMinSize={580} style={{overflowX: 'auto'}}>
        {loading && <div className="popular-loading">Loading...</div>}
        {data[activeTab] &&
          <div style={{display: 'flex', flexDirection: 'row', gap: '1.2rem'}}>
            {data[activeTab].map((item) => (
              <div className="popular-card" key={item.id}>
                <div className="popular-card-poster-wrapper" style={{ position: 'relative' }}>
                  <img
                    src={
                      item.poster_path
                        ? `https://image.tmdb.org/t/p/w185${item.poster_path}`
                        : "https://via.placeholder.com/185x278?text=No+Image"
                    }
                    alt={item.title || item.name}
                  />
                  {/* Favori yıldız butonu */}
                  <button
                    onClick={() => isFavorite(item.id) ? removeFavorite(item.id) : addFavorite(item)}
                    style={{
                      position: 'absolute',
                      top: -15,
                      right: -15,
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      cursor: 'pointer',
                      fontSize: 24,
                      color: isFavorite(item.id) ? '#FFD700' : '#bbb',
                      transition: 'color 0.2s',
                      zIndex: 2
                    }}
                    aria-label={isFavorite(item.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                  >
                    {isFavorite(item.id) ? '★' : '☆'}
                  </button>
                  <div className={`popular-card-score ${Math.round((item.vote_average || 0) * 10) >= 70 ? 'score-green' : 'score-yellow'}`}>
                    <span className="popular-card-score-number">{Math.round((item.vote_average || 0) * 10)}</span>
                    <span className="popular-card-score-percent">%</span>
                  </div>
                </div>
                <div className="popular-card-title">{item.title || item.name}</div>
                <div className="popular-card-date">{formatDate(item.release_date || item.first_air_date)}</div>
              </div>
            ))}
          </div>
        }
      </SimpleBar>
    </div>
  );
} 