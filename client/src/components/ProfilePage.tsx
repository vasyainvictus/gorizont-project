// client/src/components/ProfilePage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useInterests } from '../hooks/useInterests';
import { format } from 'date-fns';

// --- ИНТЕРФЕЙСЫ ---
interface User {
  id: string;
}

interface Interest {
  id: number;
  name: string;
}

interface Profile {
  id: string;
  name: string;
  birthDate: string;
  city: string;
  about: string;
  photoUrl: string;
  interests: Interest[];
}

interface ProfilePageProps {
  user: User;
}

// --- КОМПОНЕНТ ---
export function ProfilePage({ user }: ProfilePageProps) {
  // --- СОСТОЯНИЯ ---
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние для режима редактирования
  const [isEditing, setIsEditing] = useState(false);
  // Состояние для данных формы в режиме редактирования
  const [formData, setFormData] = useState({ name: '', city: '', about: '', birthDate: '', interestIds: [] as number[] });

  const { interests: allInterests, loading: interestsLoading } = useInterests();

  // --- ЛОГИКА ---

  // 1. Загрузка данных профиля при монтировании компонента
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/profiles/me', {
          params: { userId: user.id },
        });
        setProfile(response.data);
      } catch (err) {
        setError('Не удалось загрузить профиль.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user.id]);

  // 2. Переход в режим редактирования
  const handleEdit = () => {
    if (!profile) return;
    // Заполняем форму текущими данными профиля
    setFormData({
      name: profile.name,
      city: profile.city,
      about: profile.about,
      // Форматируем дату для input[type="date"] (YYYY-MM-DD)
      birthDate: format(new Date(profile.birthDate), 'yyyy-MM-dd'),
      interestIds: profile.interests.map(i => i.id),
    });
    setIsEditing(true);
  };

  // 3. Отмена редактирования
  const handleCancel = () => {
    setIsEditing(false);
  };

  // 4. Обновление полей формы
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleInterestToggle = (interestId: number) => {
    setFormData(prev => ({
      ...prev,
      interestIds: prev.interestIds.includes(interestId)
        ? prev.interestIds.filter(id => id !== interestId)
        : [...prev.interestIds, interestId],
    }));
  };

  // 5. Сохранение изменений
  const handleSave = async () => {
    if (!profile) return;
    try {
      // Отправляем PUT-запрос с обновленными данными
      const response = await axios.put('/api/profiles/me', {
        userId: user.id,
        // photoUrl пока не трогаем, отправляем старый
        photoUrl: profile.photoUrl,
        ...formData,
      });
      // Обновляем состояние профиля на странице новыми данными с сервера
      setProfile(response.data);
      // Выходим из режима редактирования
      setIsEditing(false);
    } catch (err) {
      alert('Ошибка сохранения. Попробуйте снова.');
      console.error(err);
    }
  };


  // --- ОТОБРАЖЕНИЕ ---
  if (loading) return <div>Загрузка профиля...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!profile) return <div>Профиль не найден.</div>;

  return (
    <div style={{ padding: '20px' }}>
      {/* --- РЕЖИМ РЕДАКТИРОВАНИЯ --- */}
      {isEditing ? (
        <div>
          <h2>Редактирование профиля</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <strong>Имя:</strong>
              <input type="text" name="name" value={formData.name} onChange={handleFormChange} style={{ width: '100%' }}/>
            </div>
            <div>
              <strong>Дата рождения:</strong>
              <input type="date" name="birthDate" value={formData.birthDate} onChange={handleFormChange} style={{ width: '100%' }}/>
            </div>
            <div>
              <strong>Город:</strong>
              <input type="text" name="city" value={formData.city} onChange={handleFormChange} style={{ width: '100%' }}/>
            </div>
            <div>
              <strong>О себе:</strong>
              <textarea name="about" value={formData.about} onChange={handleFormChange} style={{ width: '100%', minHeight: '80px' }}/>
            </div>
            <div>
              <strong>Интересы:</strong>
              {interestsLoading ? <p>Загрузка интересов...</p> : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {allInterests.map(interest => (
                    <label key={interest.id}>
                      <input
                        type="checkbox"
                        checked={formData.interestIds.includes(interest.id)}
                        onChange={() => handleInterestToggle(interest.id)}
                      /> {interest.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={handleSave}>Сохранить</button>
            <button onClick={handleCancel} style={{ backgroundColor: '#ccc' }}>Отмена</button>
          </div>
        </div>
      ) : (
        /* --- РЕЖИМ ПРОСМОТРА --- */
        <div>
          <img src={profile.photoUrl} alt={profile.name} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} />
          <h1>{profile.name}</h1>
          <p><strong>Город:</strong> {profile.city}</p>
          <p><strong>О себе:</strong> {profile.about}</p>
          <div>
            <strong>Интересы:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
              {profile.interests.map(interest => (
                <span key={interest.id} style={{ padding: '4px 8px', backgroundColor: '#f0f0f0', borderRadius: '12px' }}>
                  {interest.name}
                </span>
              ))}
            </div>
          </div>
          <button onClick={handleEdit} style={{ marginTop: '20px' }}>Редактировать профиль</button>
        </div>
      )}
    </div>
  );
}