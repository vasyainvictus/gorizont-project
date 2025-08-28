// client/src/components/UserProfilePage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';

// --- ИЗМЕНЕНИЕ 1: Добавляем user в props, чтобы знать, кто отправляет запрос ---
interface User {
  id: string;
}

interface Interest {
  id: number;
  name: string;
}

interface Profile {
  userId: string; // Нам нужен ID пользователя, а не профиля
  name: string;
  city: string;
  about: string;
  photoUrl: string;
  interests: Interest[];
}

interface UserProfilePageProps {
  currentUser: User;   // Текущий пользователь приложения
  profileId: string;   // ID профиля, который нужно показать
  onBack: () => void;  // Функция для возврата к ленте
}

export function UserProfilePage({ currentUser, profileId, onBack }: UserProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // --- ИЗМЕНЕНИЕ 2: Новое состояние для кнопки ---
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`/api/profiles/${profileId}`);
        setProfile(response.data);
      } catch (err) {
        setError('Не удалось загрузить профиль.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileId]);

  // --- ИЗМЕНЕНИЕ 3: Функция для отправки запроса ---
  const handleSendRequest = async () => {
    if (!profile) return;
    setRequestStatus('sending');
    try {
      await axios.post('/api/connections', {
        requesterId: currentUser.id,
        receiverId: profile.userId, // Отправляем ID пользователя, чей профиль смотрим
      });
      setRequestStatus('sent');
    } catch (err) {
      console.error(err);
      setRequestStatus('error');
      // Можно добавить более детальную обработку ошибок, например, если запрос уже отправлен
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        alert("Вы уже отправляли запрос этому пользователю.");
      } else {
        alert("Произошла ошибка при отправке запроса.");
      }
    }
  };

  if (loading) return <div>Загрузка профиля...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!profile) return <div>Профиль не найден.</div>;

  // --- ИЗМЕНЕНИЕ 4: Логика для кнопки ---
  const renderButton = () => {
    switch (requestStatus) {
      case 'idle':
        return <button onClick={handleSendRequest}>Начать общение</button>;
      case 'sending':
        return <button disabled>Отправка...</button>;
      case 'sent':
        return <button disabled style={{ backgroundColor: '#a5d6a7' }}>Запрос отправлен</button>;
      case 'error':
        return <button onClick={handleSendRequest} style={{ backgroundColor: '#ef9a9a' }}>Попробовать снова</button>;
      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={onBack} style={{ marginBottom: '20px' }}>&larr; Назад к ленте</button>
      
      <img src={profile.photoUrl} alt={profile.name} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} />
      <h1>{profile.name}</h1>
      <p><strong>Город:</strong> {profile.city}</p>
      <p><strong>О себе:</strong> {profile.about}</p>
      <div>
        <strong>Интересы:</strong>
        {/* ... код отображения интересов ... */}
      </div>

      {/* Отображаем кнопку внизу профиля */}
      <div style={{ marginTop: '30px' }}>
        {renderButton()}
      </div>
    </div>
  );
}