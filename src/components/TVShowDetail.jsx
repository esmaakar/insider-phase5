import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';

const TVShowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  
  const [show, setShow] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = '348088421ad3fb3a9d6e56bb6a9a8f80';
  const BASE_URL = 'https://api.themoviedb.org/3';

  useEffect(() => {
    const fetchShowDetails = async () => {
      setLoading(true);
      try {
        const [showResponse, creditsResponse] = await Promise.all([
          fetch(`${BASE_URL}/tv/${id}?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/tv/${id}/credits?api_key=${API_KEY}&language=en-US`)
        ]);

        if (!showResponse.ok || !creditsResponse.ok) {
          throw new Error('TV Show bulunamadı');
        }

        const showData = await showResponse.json();
        const creditsData = await creditsResponse.json();

        setShow(showData);
        setCredits(creditsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShowDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#00d474';
    if (rating >= 6) return '#d2d531';
    return '#ff3838';
  };

  const handleFavoriteToggle = () => {
    if (show) {
      if (isFavorite(show.id)) {
        removeFavorite(show.id);
      } else {
        addFavorite(show);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Yükleniyor...
      </div>
    );
  }

  if (error || !show) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        <div style={{ marginBottom: '1rem' }}>TV Show bulunamadı</div>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#01b4e4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const backdropUrl = show.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : 'https://via.placeholder.com/1920x1080?text=No+Backdrop';

  const posterUrl = show.poster_path 
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const genres = show.genres?.map(g => g.name).join(', ') || '';
  const creator = show.created_by?.[0]?.name || '';
  const network = show.networks?.[0]?.name || '';

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Backdrop Image */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${backdropUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(20px) brightness(0.3)',
        zIndex: -1
      }} />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position: 'fixed',
          top: '6rem',
          left: '2rem',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '3rem',
          height: '3rem',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem'
        }}
      >
        ←
      </button>

      <div style={{
        display: 'flex',
        padding: '2rem',
        gap: '3rem',
        maxWidth: '1200px',
        margin: '0 auto',
        alignItems: 'flex-start',
        paddingTop: '8rem'
      }}>
        
        {/* Left Panel - Poster */}
        <div style={{ flex: '0 0 300px', marginLeft: '-60rem' }}>
          <div style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <img 
              src={posterUrl} 
              alt={show.name}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Right Panel - Details */}
        <div style={{ flex: 1, color: 'white' }}>
          
          {/* Title and Year */}
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            color: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            textShadow: 'none'
          }}>
            {show.name} ({new Date(show.first_air_date).getFullYear()})
          </h1>

          {/* General Info Strip */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            color: '#00d474',
            fontFamily: 'Arial, sans-serif'
          }}>
            <span>{show.adult ? '18+' : '10+'}</span>
            <span>{formatDate(show.first_air_date)} (TR)</span>
            <span>{genres}</span>
            <span>{show.number_of_seasons} Sezon</span>
            <span>{show.number_of_episodes} Bölüm</span>
          </div>

          {/* User Score and Sentiment Combined */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '2rem'
          }}>
            {/* User Score */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#1a1a2e',
                border: '2px solid #00d474',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: 'white',
                position: 'relative'
              }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{Math.round(show.vote_average * 10)}</span>
                <span style={{ fontSize: '0.8rem', position: 'absolute', top: '8px', right: '8px' }}>%</span>
              </div>
              <span style={{ fontSize: '1.1rem', color: '#ffffff', fontFamily: 'Arial, sans-serif' }}>User Score</span>
            </div>

            {/* User Sentiment */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0rem'
              }}>
                <span style={{ 
                  fontSize: '1.5rem', 
                  cursor: 'pointer',
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
                }}>😍</span>
                <span style={{ 
                  fontSize: '1.5rem', 
                  cursor: 'pointer',
                  marginLeft: '-1rem',
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
                }}>🤔</span>
                <span style={{ 
                  fontSize: '1.5rem', 
                  cursor: 'pointer',
                  marginLeft: '-1.2rem',
                  filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.3))'
                }}>😊</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                backgroundColor: '#1a1a2e',
                borderRadius: '20px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <span style={{ 
                  fontSize: '1rem', 
                  color: '#ffffff', 
                  fontFamily: 'Arial, sans-serif', 
                  opacity: 0.9,
                  fontWeight: '500'
                }}>How do you feel?</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <button style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: '#1a1a2e',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>
              ☰
            </button>
            <button 
              onClick={handleFavoriteToggle}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                background: '#1a1a2e',
                color: isFavorite(show.id) ? '#FFD700' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}
            >
              {isFavorite(show.id) ? '♥' : '♡'}
            </button>
            <button style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: 'none',
              background: '#1a1a2e',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              position: 'relative'
            }}>
              <div style={{
                width: '0',
                height: '0',
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderLeft: '10px solid white',
                marginLeft: '2px'
              }}></div>
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: 'none',
              background: '#1a1a2e',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              ▶️ Play Trailer
            </button>
          </div>

          {/* Tagline */}
          {show.tagline && (
            <div style={{
              fontStyle: 'italic',
              fontSize: '1.1rem',
              marginBottom: '1rem',
              color: '#ffffff',
              fontFamily: 'Arial, sans-serif',
              opacity: 0.8
            }}>
              "{show.tagline}"
            </div>
          )}

          {/* Overview */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#ffffff', fontFamily: 'Arial, sans-serif' }}>Overview</h3>
            <p style={{
              lineHeight: '1.6',
              fontSize: '1rem',
              color: '#ffffff',
              fontFamily: 'Arial, sans-serif',
              opacity: 0.9
            }}>
              {show.overview || 'No overview available for this TV show.'}
            </p>
          </div>

          {/* Creator/Network */}
          {(creator || network) && (
            <div style={{ marginBottom: '2rem' }}>
              {creator && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#ffffff', fontFamily: 'Arial, sans-serif' }}>{creator}</span>
                  <span style={{ opacity: 0.7, color: '#ffffff', fontFamily: 'Arial, sans-serif' }}> - Creator</span>
                </div>
              )}
              {network && (
                <div>
                  <span style={{ fontWeight: 'bold', color: '#ffffff', fontFamily: 'Arial, sans-serif' }}>{network}</span>
                  <span style={{ opacity: 0.7, color: '#ffffff', fontFamily: 'Arial, sans-serif' }}> - Network</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* White Background Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        marginTop: '2rem',
        borderRadius: '8px 8px 0 0'
      }}>
        {/* Cast */}
        {credits?.cast && credits.cast.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#333', fontFamily: 'Arial, sans-serif' }}>Cast</h3>
            <div style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              paddingBottom: '1rem'
            }}>
                             {credits.cast.slice(0, 10).map((actor) => (
                 <div key={actor.id} style={{
                   textAlign: 'center',
                   minWidth: '140px',
                   padding: '0',
                   borderRadius: '12px',
                   backgroundColor: 'white',
                   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                   border: 'none',
                   transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                   overflow: 'hidden'
                 }}>
                   <img 
                     src={actor.profile_path 
                       ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                       : 'https://via.placeholder.com/185x278?text=No+Image'
                       
                     }
                     alt={actor.name}
                     style={{
                       width: '100%',
                       height: '180px',
                       borderRadius: '12px 12px 0 0',
                       objectFit: 'cover',
                       objectPosition: 'center 20%',
                       marginBottom: '0',
                       boxShadow: 'none'
                     }}
                   />
                   <div style={{
                     fontSize: '1rem',
                     fontWeight: '600',
                     marginBottom: '0.25rem',
                     color: '#2c3e50',
                     fontFamily: 'Arial, sans-serif',
                     lineHeight: '1.2',
                     padding: '0.75rem 0.75rem 0.5rem 0.75rem'
                   }}>
                     {actor.name}
                   </div>
                   <div style={{
                     fontSize: '0.85rem',
                     opacity: 0.8,
                     color: '#7f8c8d',
                     fontFamily: 'Arial, sans-serif',
                     lineHeight: '1.3',
                     padding: '0 0.75rem 0.75rem 0.75rem'
                   }}>
                     {actor.character}
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TVShowDetail; 