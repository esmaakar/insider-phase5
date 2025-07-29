import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import "../App.css";
import tmdbIcon from "../assets/tmdb-icon.png";
import { useFavorites } from '../context/FavoritesContext.jsx';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { Link } from 'react-router-dom';
import MoviesDropdown from './MoviesDropdown';
import TVShowsDropdown from './TVShowsDropdown';

const Navbar = ({ onSearchIconClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [plusBubbleOpen, setPlusBubbleOpen] = useState(false);
  const [moviesOpen, setMoviesOpen] = useState(false);
  const [tvOpen, setTvOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [moviesLocked, setMoviesLocked] = useState(false);
  const [tvLocked, setTvLocked] = useState(false);
  const [peopleLocked, setPeopleLocked] = useState(false);
  const [moreLocked, setMoreLocked] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const { favorites, removeFavorite, isFavorite } = useFavorites();
  const langBtnRef = useRef(null);
  const langMenuRef = useRef(null);
  const plusBtnRef = useRef(null);
  const plusBubbleRef = useRef(null);
  const moviesRef = useRef(null);
  const tvRef = useRef(null);
  const peopleRef = useRef(null);
  const moreRef = useRef(null);
  const favoritesBtnRef = useRef(null);

  // Portal ile dropdown render fonksiyonu
  const renderDropdownPortal = (isOpen, ref, items, label) => {
    if (!isOpen || !ref.current) return null;
    
    const rect = ref.current.getBoundingClientRect();
    
    // Movies için özel route'lar
    let links = [];
    if (label === 'Movies') {
      links = [
        { name: 'Popular', to: '/movies/popular' },
        { name: 'Now Playing', to: '#' },
        { name: 'Upcoming', to: '/movies/upcoming' },
        { name: 'Top Rated', to: '/movies/top-rated' },
      ];
    } else {
      links = items.map(item => ({ name: item, to: '#' }));
    }

    return ReactDOM.createPortal(
      <ul className="dropdown__menu" style={{
        position: 'fixed',
        top: rect.bottom + 5,
        left: rect.left,
        zIndex: 999999,
        display: 'block'
      }}>
        {links.map((item, index) => (
          item.to !== '#' ?
            <li key={index}>
              <Link
                to={item.to}
                className="dropdown__link"
                onClick={() => {
                  setMoviesOpen(false);
                  setMoviesLocked(false);
                }}
              >
                {item.name}
              </Link>
            </li>
            : <li key={index}><a href="#" className="dropdown__link">{item.name}</a></li>
        ))}
      </ul>,
      document.body
    );
  };

  // Plus bubble portal render fonksiyonu
  const renderPlusBubblePortal = () => {
    if (!plusBubbleOpen || !plusBtnRef.current) return null;
    
    const rect = plusBtnRef.current.getBoundingClientRect();
    
    return ReactDOM.createPortal(
      <div className="plus-bubble active" style={{
        position: 'fixed',
        top: rect.bottom + 5,
        left: rect.left - 130, // Ortalamak için bubble genişliğinin yarısı kadar sola kaydır
        zIndex: 999999,
        display: 'block'
      }}>
        Can't find a movie or TV show? <br />Sign in to add it.
      </div>,
      document.body
    );
  };

  // Language menu portal render fonksiyonu
  const renderLanguageMenuPortal = () => {
    if (!langMenuOpen || !langBtnRef.current) return null;
    
    const rect = langBtnRef.current.getBoundingClientRect();
    
    return ReactDOM.createPortal(
      <div className="language-menu" style={{
        position: 'fixed',
        top: rect.bottom + 5,
        left: rect.left - 150,
        zIndex: 999999,
        display: 'block'
      }}>
        <h3>Language Settings</h3>
        <div className="lang-section">
          <div className="lang-section-label-row">
            <label htmlFor="default-lang">Default Language</label>
            <a href="#" className="reset-btn">Reset</a>
          </div>
          <select id="default-lang">
            <option defaultValue>Turkish (tr-TR)</option>
            <option>English (en-US)</option>
          </select>
        </div>
        <div className="lang-section">
          <label htmlFor="secondary-lang">Secondary Language</label>
          <select id="secondary-lang">
            <option defaultValue>English (en-US)</option>
            <option>Turkish (tr-TR)</option>
          </select>
        </div>
      </div>,
      document.body
    );
  };

  // Dışarı tıklanınca menüleri kapat
  useEffect(() => {
    const handleClick = (e) => {
      // Plus bubble ve language menu için dışarı tıklama kontrolü
      if (
        plusBtnRef.current &&
        !plusBtnRef.current.contains(e.target)
      ) {
        setPlusBubbleOpen(false);
      }
      
      if (
        langBtnRef.current &&
        !langBtnRef.current.contains(e.target)
      ) {
        setLangMenuOpen(false);
      }
      
      // Navbar dropdown'ları için dışarı tıklama kontrolü
      const navbarElement = document.querySelector('.nav');
      const dropdownItems = document.querySelectorAll('.dropdown__item');
      
      let clickedInsideNavbar = false;
      let clickedInsideDropdown = false;
      
      // Navbar içinde tıklanıp tıklanmadığını kontrol et
      if (navbarElement && navbarElement.contains(e.target)) {
        clickedInsideNavbar = true;
      }
      
      // Dropdown item içinde tıklanıp tıklanmadığını kontrol et
      dropdownItems.forEach(item => {
        if (item.contains(e.target)) {
          clickedInsideDropdown = true;
        }
      });
      
      // Sadece navbar dışına tıklanırsa dropdown'ları kapat
      if (!clickedInsideNavbar && !clickedInsideDropdown) {
        setMoviesOpen(false);
        setTvOpen(false);
        setPeopleOpen(false);
        setMoreOpen(false);
        setMoviesLocked(false);
        setTvLocked(false);
        setPeopleLocked(false);
        setMoreLocked(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="header">
      <nav className="nav container">
        <div className="nav__data">
          <a href="#" className="nav__logo">
            <img src={tmdbIcon} alt="TMDB" className="tmdb-logo" />
          </a>
          <ul className="nav__list nav__list--main">
            {/* Filmler Dropdown */}
            <li className="dropdown__item" style={{position: 'relative', display: 'inline-block'}}>
              <div 
                className="nav__link"
                ref={moviesRef}
                onMouseEnter={() => {
                  setTvOpen(false);
                  setPeopleOpen(false);
                  setMoreOpen(false);
                  setTvLocked(false);
                  setPeopleLocked(false);
                  setMoreLocked(false);
                  setMoviesOpen(true);
                }}
                onMouseLeave={() => {
                  if (!moviesLocked) {
                    setMoviesOpen(false);
                  }
                }}
                onClick={() => {
                  setTvOpen(false);
                  setPeopleOpen(false);
                  setMoreOpen(false);
                  setTvLocked(false);
                  setPeopleLocked(false);
                  setMoreLocked(false);
                  setPlusBubbleOpen(false);
                  setLangMenuOpen(false);
                  setMoviesOpen(true);
                  setMoviesLocked(true);
                }}
              >
                Movies
              </div>
              <MoviesDropdown open={moviesOpen} onClose={() => { setMoviesOpen(false); setMoviesLocked(false); }} />
            </li>
            {/* Diziler Dropdown */}
            <li className="dropdown__item" style={{position: 'relative', display: 'inline-block'}}>
              <div 
                className="nav__link"
                ref={tvRef}
                onMouseEnter={() => {
                  setMoviesOpen(false);
                  setPeopleOpen(false);
                  setMoreOpen(false);
                  setMoviesLocked(false);
                  setPeopleLocked(false);
                  setMoreLocked(false);
                  setTvOpen(true);
                }}
                onMouseLeave={() => {
                  if (!tvLocked) {
                    setTvOpen(false);
                  }
                }}
                onClick={() => {
                  setMoviesOpen(false);
                  setPeopleOpen(false);
                  setMoreOpen(false);
                  setMoviesLocked(false);
                  setPeopleLocked(false);
                  setMoreLocked(false);
                  setPlusBubbleOpen(false);
                  setLangMenuOpen(false);
                  setTvOpen(true);
                  setTvLocked(true);
                }}
              >
                TV Shows
              </div>
              <TVShowsDropdown open={tvOpen} onClose={() => { setTvOpen(false); setTvLocked(false); }} />
            </li>
            {/* Kişiler Dropdown */}
            <li className="dropdown__item">
              <div 
                className="nav__link"
                ref={peopleRef}
                onMouseEnter={() => {
                  // Hover'da diğer navbar dropdown'larını kapat
                  setMoviesOpen(false);
                  setTvOpen(false);
                  setMoreOpen(false);
                  setMoviesLocked(false);
                  setTvLocked(false);
                  setMoreLocked(false);
                  setPeopleOpen(true);
                }}
                onMouseLeave={() => {
                  if (!peopleLocked) {
                    setPeopleOpen(false);
                  }
                }}
                onClick={() => {
                  // Diğer tüm dropdown'ları kapat
                  setMoviesOpen(false);
                  setTvOpen(false);
                  setMoreOpen(false);
                  setMoviesLocked(false);
                  setTvLocked(false);
                  setMoreLocked(false);
                  // Plus bubble ve language menu'yu kapat
                  setPlusBubbleOpen(false);
                  setLangMenuOpen(false);
                  // Bu dropdown'ı aç ve locked yap
                  setPeopleOpen(true);
                  setPeopleLocked(true);
                }}
              >
                People
              </div>
            </li>
            {/* Daha Fazla Dropdown */}
            <li className="dropdown__item">
              <div 
                className="nav__link"
                ref={moreRef}
                onMouseEnter={() => {
                  // Hover'da diğer navbar dropdown'larını kapat
                  setMoviesOpen(false);
                  setTvOpen(false);
                  setPeopleOpen(false);
                  setMoviesLocked(false);
                  setTvLocked(false);
                  setPeopleLocked(false);
                  setMoreOpen(true);
                }}
                onMouseLeave={() => {
                  if (!moreLocked) {
                    setMoreOpen(false);
                  }
                }}
                onClick={() => {
                  // Diğer tüm dropdown'ları kapat
                  setMoviesOpen(false);
                  setTvOpen(false);
                  setPeopleOpen(false);
                  setMoviesLocked(false);
                  setTvLocked(false);
                  setPeopleLocked(false);
                  // Plus bubble ve language menu'yu kapat
                  setPlusBubbleOpen(false);
                  setLangMenuOpen(false);
                  // Bu dropdown'ı aç ve locked yap
                  setMoreOpen(true);
                  setMoreLocked(true);
                }}
              >
                More
              </div>
            </li>
            <li className="dropdown__item" style={{marginLeft: '0.6rem'}}>
              <a
                href="#"
                className="nav__link"
                ref={favoritesBtnRef}
                onClick={e => {
                  e.preventDefault();
                  setFavoritesOpen(v => !v);
                  // Diğer dropdownları kapat
                  setPlusBubbleOpen(false);
                  setLangMenuOpen(false);
                  setMoviesOpen(false);
                  setTvOpen(false);
                  setPeopleOpen(false);
                  setMoreOpen(false);
                  setMoviesLocked(false);
                  setTvLocked(false);
                  setPeopleLocked(false);
                  setMoreLocked(false);
                }}
              >
                Favorites
              </a>
            </li>
          </ul>
          <ul className="nav__list nav__list--right">
            <li className="nav__plus-wrapper" style={{marginLeft: '17rem'}}>
              <a
                href="#"
                className="nav__link nav__plus"
                id="plus-btn"
                ref={plusBtnRef}
                onClick={e => {
                  e.preventDefault();
                  // Language menu'yu kapat
                  setLangMenuOpen(false);
                  // Navbar dropdown'larını kapat
                  setMoviesOpen(false);
                  setTvOpen(false);
                  setPeopleOpen(false);
                  setMoreOpen(false);
                  setMoviesLocked(false);
                  setTvLocked(false);
                  setPeopleLocked(false);
                  setMoreLocked(false);
                  // Plus bubble'ı toggle et
                  setPlusBubbleOpen(v => !v);
                }}
              >
                +
              </a>
            </li>
            <li className="nav__item language-dropdown">
              <button
                className="nav__link language-btn"
                onClick={e => {
                  e.preventDefault();
                  // Plus bubble'ı kapat
                  setPlusBubbleOpen(false);
                  // Navbar dropdown'larını kapat
                  setMoviesOpen(false);
                  setTvOpen(false);
                  setPeopleOpen(false);
                  setMoreOpen(false);
                  setMoviesLocked(false);
                  setTvLocked(false);
                  setPeopleLocked(false);
                  setMoreLocked(false);
                  // Language menu'yu toggle et
                  setLangMenuOpen(v => !v);
                }}
                ref={langBtnRef}
              >
                EN
              </button>
            </li>
            <li><a href="#" className="nav__link login-btn">Login</a></li>
            <li><a href="#" className="nav__link signup-btn">Join TMDB</a></li>
            <li>
              <a
                href="#"
                className="nav__link nav__search"
                onClick={e => {
                  e.preventDefault();
                  if (onSearchIconClick) onSearchIconClick();
                }}
              >
                <i className="ri-search-line"></i>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Portal ile render edilen dropdown menüler */}
      {renderDropdownPortal(peopleOpen, peopleRef, ['Popular People'], 'People')}
      {renderDropdownPortal(moreOpen, moreRef, ['Discussions', 'Featured', 'Support', 'API Docs', 'API for Business'], 'More')}
      {renderPlusBubblePortal()}
      {renderLanguageMenuPortal()}
      {favoritesOpen && favoritesBtnRef.current && ReactDOM.createPortal(
        (() => {
          const rect = favoritesBtnRef.current.getBoundingClientRect();
          return (
            <div style={{
              position: 'fixed',
              top: rect.bottom + 5,
              left: rect.left,
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              padding: '1.2rem 1.5rem',
              minWidth: 320,
              zIndex: 999999
            }}>
              <h3 style={{marginTop:0, marginBottom: '1rem'}}>Favorites</h3>
              {favorites.length === 0 ? (
                <div style={{color:'#888'}}>No favorites yet.</div>
              ) : (
                <SimpleBar style={{maxHeight: 320}} autoHide={false}>
                  <ul style={{listStyle:'none', margin:0, padding:0}}>
                    {favorites.map(fav => (
                      <li key={fav.id} style={{display:'flex',alignItems:'center',gap:12,marginBottom:10}}>
                        <img src={fav.poster_path ? `https://image.tmdb.org/t/p/w92${fav.poster_path}` : 'https://via.placeholder.com/45x68?text=No+Image'} alt={fav.title || fav.name} style={{width:45,height:68,borderRadius:4,objectFit:'cover'}} />
                        <span style={{flex:1}}>{fav.title || fav.name}</span>
                        <button
                          onClick={()=>removeFavorite(fav.id)}
                          style={{background:'none',border:'none',outline:'none',fontSize:22,color:'#FFD700',cursor:'pointer'}}
                          aria-label="Favorilerden çıkar"
                        >★</button>
                      </li>
                    ))}
                  </ul>
                </SimpleBar>
              )}
              <button onClick={()=>setFavoritesOpen(false)} style={{marginTop:10,background:'#eee',border:'none',borderRadius:6,padding:'0.4rem 1.2rem',cursor:'pointer'}}>Close</button>
            </div>
          );
        })(),
        document.body
      )}
    </header>
  );
};

export default Navbar; 