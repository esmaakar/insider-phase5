import React from 'react';
import { Link } from 'react-router-dom';

const MoviesDropdown = ({ open, onClose }) => (
  open && (
    <ul className="dropdown__menu" style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      zIndex: 1000000000 ,
      display: 'block',
      background: '#fff',
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      borderRadius: 8,
      minWidth: 180,
      width: 'max-content',
      padding: 0,
      margin: 0
    }}>
      <li><Link to="/movies/popular" className="dropdown__link" onClick={onClose}>Popular</Link></li>
      <li><a href="#" className="dropdown__link">Now Playing</a></li>
      <li><Link to="/movies/upcoming" className="dropdown__link" onClick={onClose}>Upcoming</Link></li>
      <li><Link to="/movies/top-rated" className="dropdown__link" onClick={onClose}>Top Rated</Link></li>
    </ul>
  )
);

export default MoviesDropdown; 