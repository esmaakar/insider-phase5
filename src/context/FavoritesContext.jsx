import React, { createContext, useContext, useEffect, useState } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    const stored = localStorage.getItem('favorites');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (movie) => {
    setFavorites((prev) => prev.some(f => f.id === movie.id) ? prev : [...prev, movie]);
  };

  const removeFavorite = (movieId) => {
    setFavorites((prev) => prev.filter(f => f.id !== movieId));
  };

  const isFavorite = (movieId) => favorites.some(f => f.id === movieId);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
} 