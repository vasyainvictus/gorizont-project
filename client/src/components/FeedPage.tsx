import { useState, useEffect } from 'react';
import axios from 'axios';

// Описываем тип профиля, чтобы TypeScript нам помогал
interface Profile {
  id: string;
  name: string;
  age: number;
  city: string;
  about: string;
  photoUrl: string;
}

export function FeedPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect будет запущен один раз при монтировании компонента
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Делаем GET-запрос к нашему API для получения анкет
        const response = await axios.get('/api/profiles');
        setProfiles(response.data);
      } catch (err) {
        setError('Не удалось загрузить анкеты.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []); // Пустой массив зависимостей означает "выполнить только один раз"

  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка анкет...</div>;
  }

  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Лента</h1>
      <p>Здесь вы можете найти новых подруг и единомышленниц.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <div key={profile.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
              <h2 style={{ marginTop: 0 }}>{profile.name}, {profile.age}</h2>
              <p style={{ color: '#555' }}>{profile.city}</p>
              <p>{profile.about}</p>
            </div>
          ))
        ) : (
          <p>В ленте пока нет анкет. Ваша будет первой!</p>
        )}
      </div>
    </div>
  );
}