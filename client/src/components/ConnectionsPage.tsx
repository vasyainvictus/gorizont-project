// client/src/components/ConnectionsPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
}

interface Profile {
  name: string;
  city: string;
  photoUrl: string;
}

interface Requester {
  id: string;
  profile: Profile | null;
}

interface Connection {
  id: number;
  requester: Requester;
}

interface ConnectionsPageProps {
  currentUser: User;
}

export function ConnectionsPage({ currentUser }: ConnectionsPageProps) {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Функция для загрузки входящих запросов
  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/connections', {
        params: { userId: currentUser.id },
      });
      setConnections(response.data);
    } catch (err) {
      setError('Не удалось загрузить запросы.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Загружаем запросы при первом рендере страницы
  useEffect(() => {
    fetchConnections();
  }, [currentUser.id]);

  // 3. Функция для ответа на запрос
  const handleRespond = async (connectionId: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      // Отправляем PUT-запрос на обновление статуса
      await axios.put(`/api/connections/${connectionId}`, {
        status: status,
        currentUserId: currentUser.id, // Отправляем ID для проверки безопасности на бэкенде
      });

      // Если успешно, убираем запрос из списка на экране
      setConnections(prev => prev.filter(c => c.id !== connectionId));
    } catch (err) {
      alert('Не удалось ответить на запрос.');
      console.error(err);
    }
  };

  if (loading) return <div>Загрузка запросов...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Запросы на общение</h1>
      {connections.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {connections.map(conn => (
            <div key={conn.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {conn.requester.profile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src={conn.requester.profile.photoUrl} alt={conn.requester.profile.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <strong>{conn.requester.profile.name}</strong>
                    <p style={{ margin: 0, color: '#666' }}>{conn.requester.profile.city}</p>
                  </div>
                </div>
              ) : (
                <p>Информация о пользователе недоступна</p>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleRespond(conn.id, 'ACCEPTED')} style={{ backgroundColor: '#a5d6a7' }}>Принять</button>
                <button onClick={() => handleRespond(conn.id, 'REJECTED')} style={{ backgroundColor: '#ef9a9a' }}>Отклонить</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>У вас пока нет новых запросов.</p>
      )}
    </div>
  );
}