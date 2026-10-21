import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("favorites");
        const parsed = raw ? JSON.parse(raw) : [];
        setIds(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        console.error("Could not read favorites:", e);
        setIds([]);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = async (next) => {
    setIds(next);
    try {
      await AsyncStorage.setItem("favorites", JSON.stringify(next));
    } catch (e) {
      console.error("Could not save favorites:", e);
    }
  };

  const isFavorite = (id) => ids.includes(id);

  const toggleFavorite = (id) =>
    persist(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);

  const clearFavorites = async () => {
    setIds([]);
    try {
      await AsyncStorage.removeItem("favorites");
    } catch (e) {
      console.error("Could not clear favorites:", e);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{ ids, loaded, isFavorite, toggleFavorite, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);