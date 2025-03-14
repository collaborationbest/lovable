
/**
 * useLocalStorage - Hook personnalisé pour gérer le stockage local de données
 * Permet de persister des données entre les sessions en utilisant localStorage
 * 
 * @param key - Clé unique pour identifier les données dans localStorage
 * @param initialValue - Valeur par défaut si aucune donnée n'existe
 * @returns [storedValue, setValue] - Valeur stockée et fonction pour la mettre à jour
 */
import { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prevValue: T) => T)) => void] {
  // Initialiser l'état en récupérant la valeur dans localStorage ou en utilisant la valeur par défaut
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      // Convertir la valeur JSON stockée en objet JavaScript
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erreur lors de la lecture de la clé "${key}" dans localStorage:`, error);
      return initialValue;
    }
  });

  // Mettre à jour localStorage à chaque fois que storedValue change
  useEffect(() => {
    try {
      if (storedValue !== undefined) {
        localStorage.setItem(key, JSON.stringify(storedValue));
      }
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la clé "${key}" dans localStorage:`, error);
    }
  }, [key, storedValue]);

  // Fonction pour mettre à jour la valeur stockée
  const setValue = (value: T | ((prevValue: T) => T)) => {
    try {
      // Permettre à value d'être une fonction (comme pour setState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la valeur dans localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;
