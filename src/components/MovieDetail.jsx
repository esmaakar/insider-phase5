import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext.jsx';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  
  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = '348088421ad3fb3a9d6e56bb6a9a8f80';
  const BASE_URL = 'https://api.themoviedb.org/3';

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      try {
        const [movieResponse, creditsResponse] = await Promise.all([
          fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=en-US`),
          fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=en-US`)
        ]);

        if (!movieResponse.ok || !creditsResponse.ok) {
          throw new Error('Film bulunamadı');
        }

        const movieData = await movieResponse.json();
        const creditsData = await creditsResponse.json();

        setMovie(movieData);
        setCredits(creditsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
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
    if (movie) {
      if (isFavorite(movie.id)) {
        removeFavorite(movie.id);
      } else {
        addFavorite(movie);
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

  if (error || !movie) {
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
        <div style={{ marginBottom: '1rem' }}>Film bulunamadı</div>
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

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : 'https://via.placeholder.com/1920x1080?text=No+Backdrop';

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Poster';

  const genres = movie.genres?.map(g => g.name).join(', ') || '';
  const director = credits?.crew?.find(person => person.job === 'Director')?.name || '';
  const writer = credits?.crew?.find(person => person.job === 'Writer')?.name || '';

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
        <div style={{ flex: '0 0 300px', marginLeft: '-10rem' }}>
          <div style={{
            position: 'relative',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <img 
              src={posterUrl} 
              alt={movie.title}
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
            {movie.title} ({new Date(movie.release_date).getFullYear()})
          </h1>

                                {/* General Info Strip */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginBottom: '2rem',
              fontSize: '0.9rem',
              color: '#ffffff',
              fontFamily: 'Arial, sans-serif'
            }}>
            <span>{movie.adult ? '18+' : '10+'}</span>
            <span>{formatDate(movie.release_date)} (TR)</span>
            <span>{genres}</span>
            <span>{formatRuntime(movie.runtime)}</span>
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
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{Math.round(movie.vote_average * 10)}</span>
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
                  marginLeft: '-1.2rem',
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
                 color: isFavorite(movie.id) ? '#FFD700' : 'white',
                 cursor: 'pointer',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontSize: '1.2rem'
               }}
             >
               {isFavorite(movie.id) ? '★' : '☆'}
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
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  width: '0',
                  height: '0',
                  borderTop: '6px solid transparent',
                  borderBottom: '6px solid transparent',
                  borderLeft: '10px solid white',
                  marginRight: '0.5rem'
                }}></div>
                Play Trailer
              </button>
          </div>

          {/* Tagline */}
          {movie.tagline && (
            <div style={{
              fontStyle: 'italic',
              fontSize: '1.1rem',
              marginBottom: '1rem',
              color: '#ffffff',
              fontFamily: 'Arial, sans-serif',
              opacity: 0.8
            }}>
              "{movie.tagline}"
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
              {movie.overview || 'No overview available for this movie.'}
            </p>
          </div>

          {/* Director/Writer */}
          {(director || writer) && (
            <div style={{ marginBottom: '2rem' }}>
              {director && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', color: '#ffffff', fontFamily: 'Arial, sans-serif' }}>{director}</span>
                  <span style={{ opacity: 0.7, color: '#ffffff', fontFamily: 'Arial, sans-serif' }}> - Director</span>
                </div>
              )}
              {writer && (
                <div>
                  <span style={{ fontWeight: 'bold', color: '#ffffff', fontFamily: 'Arial, sans-serif' }}>{writer}</span>
                  <span style={{ opacity: 0.7, color: '#ffffff', fontFamily: 'Arial, sans-serif' }}> - Writer</span>
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
               position: 'relative',
               width: '100%',
               overflow: 'hidden'
             }}>
               {/* Navigation Buttons */}
               <button 
                 onClick={() => {
                   const container = document.getElementById('cast-slider');
                   if (container) {
                     container.scrollLeft -= 400;
                   }
                 }}
                                                   style={{
                   position: 'absolute',
                   left: '0',
                   top: '50%',
                   transform: 'translateY(-50%)',
                   zIndex: 10,
                   width: '50px',
                   height: '100%',
                   border: 'none',
                   outline: 'none',
                   background: 'linear-gradient(to right, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                   color: '#333',
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontSize: '1.5rem',
                   fontWeight: 'bold',
                   transition: 'all 0.3s ease',
                   opacity: 0.2
                 }}
                 
               >
                 ‹
               </button>
               
               <button 
                 onClick={() => {
                   const container = document.getElementById('cast-slider');
                   if (container) {
                     container.scrollLeft += 400;
                   }
                 }}
                                                   style={{
                   position: 'absolute',
                   right: '0',
                   top: '50%',
                   transform: 'translateY(-50%)',
                   zIndex: 10,
                   width: '50px',
                   height: '100%',
                   border: 'none',
                   outline: 'none',
                   background: 'linear-gradient(to left, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 50%, transparent 100%)',
                   color: '#333',
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontSize: '1.5rem',
                   fontWeight: 'bold',
                   transition: 'all 0.3s ease',
                   opacity: 0.8
                 }}
                 
               >
                 ›
               </button>

              {/* Cast Slider */}
              <div 
                id="cast-slider"
                style={{
                  display: 'flex',
                  gap: '1rem',
                  overflowX: 'auto',
                  paddingBottom: '1rem',
                  scrollBehavior: 'smooth',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
                                 onScroll={(e) => {
                   // Hide/show navigation buttons based on scroll position
                   const leftBtn = e.target.previousElementSibling?.previousElementSibling;
                   const rightBtn = e.target.previousElementSibling;
                   
                   if (leftBtn) {
                     leftBtn.style.opacity = e.target.scrollLeft > 0 ? '1' : '0.2';
                   }
                   if (rightBtn) {
                     const maxScroll = e.target.scrollWidth - e.target.clientWidth;
                     rightBtn.style.opacity = e.target.scrollLeft < maxScroll ? '1' : '0.2';
                   }
                 }}
              >
                {credits.cast.map((actor) => (
                                     <div key={actor.id} style={{
                     textAlign: 'center',
                     minWidth: '140px',
                     padding: '0',
                     borderRadius: '12px',
                     backgroundColor: 'white',
                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                     border: 'none',
                     transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                     overflow: 'hidden',
                     flexShrink: 0
                   }}
                  
                  >
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
                       padding: '0.75rem 0.75rem 0.25rem 0.75rem'
                     }}>
                       {actor.name}
                     </div>
                     <div style={{
                       fontSize: '0.9rem',
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

              {/* Custom Scrollbar */}
              <style>
                {`
                  #cast-slider::-webkit-scrollbar {
                    height: 6px;
                  }
                  #cast-slider::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 3px;
                  }
                  #cast-slider::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 3px;
                  }
                  #cast-slider::-webkit-scrollbar-thumb:hover {
                    background: #a8a8a8;
                  }
                `}
              </style>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail; 