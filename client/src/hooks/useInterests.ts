// client/src/hooks/useInterests.ts
import { useState, useEffect } from 'react';

interface Interest {
  id: number;  // ← ЧИСЛО!
  name: string;
}

export const useInterests = () => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await fetch('/api/interests');
        if (!response.ok) throw new Error('Ошибка загрузки интересов');
        const data: Interest[] = await response.json();
        setInterests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();
  }, []);

  return { interests, loading, error };
};