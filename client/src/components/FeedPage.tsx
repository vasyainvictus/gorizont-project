// client/src/components/FeedPage.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useInterests } from '../hooks/useInterests';
import { differenceInYears } from 'date-fns';

// Интерфейсы
interface User {
  id: string;
}

interface FeedPageProps {
  user: User;
  onViewProfile: (profileId: string) => void;
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
  userId: string;
}

const calculateAge = (birthDateString: string): number => {
  if (!birthDateString) return 0;
  const birthDate = new Date(birthDateString);
  return differenceInYears(new Date(), birthDate);
};

export function FeedPage({ user, onViewProfile }: FeedPageProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const [cityFilter, setCityFilter] = useState('');
  const [ageFromFilter, setAgeFromFilter] = useState('');
  const [ageToFilter, setAgeToFilter] = useState('');
  
  const { interests: allInterests, loading: interestsLoading, error: interestsError } = useInterests();

  const toggleInterestFilter = (id: number) => {
    setSelectedInterestIds(prev => 
      prev.includes(id) 
        ? prev.filter(interestId => interestId !== id)
        : [...prev, id]
    );
  };

  const resetFilters = () => {
    setSelectedInterestIds([]);
    setCityFilter('');
    setAgeFromFilter('');
    setAgeToFilter('');
    fetchProfiles({ reset: true });
  };

  const applyFilters = () => {
    fetchProfiles();
  };

  const fetchProfiles = async (options: { reset?: boolean } = {}) => {
    setLoading(true);
    setError(null);
    
    if (!user || !user.id) {
        setError("Ошибка: пользователь не определен. Невозможно загрузить ленту.");
        setLoading(false);
        return;
    }

    try {
      const params = new URLSearchParams();
      
      params.append('currentUserId', user.id);

      const interestsToFetch = options.reset ? [] : selectedInterestIds;
      const cityToFetch = options.reset ? '' : cityFilter;
      const ageFromToFetch = options.reset ? '' : ageFromFilter;
      const ageToToFetch = options.reset ? '' : ageToFilter;

      if (interestsToFetch.length > 0) {
        params.append('interests', interestsToFetch.join(','));
      }
      if (cityToFetch) {
        params.append('city', cityToFetch);
      }
      if (ageFromToFetch) {
        params.append('ageFrom', ageFromToFetch);
      }
      if (ageToToFetch) {
        params.append('ageTo', ageToToFetch);
      }

      const response = await axios.get('/api/profiles', { params });
      setProfiles(response.data);
    } catch (err) {
      setError('Не удалось загрузить анкеты.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (interestsLoading) {
    return <div style={{ padding: '20px' }}>Загрузка интересов...</div>;
  }

  if (interestsError) {
    return <div style={{ padding: '20px', color: 'red' }}>Ошибка загрузки интересов: {interestsError}</div>;
  }

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
      
      {/* --- НАЧАЛО ВОССТАНОВЛЕННОГО БЛОКА ФИЛЬТРОВ --- */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ margin: 0 }}>Фильтры</h3>
          <button onClick={resetFilters} style={{ padding: '5px 10px', backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Сбросить
          </button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <strong>Город:</strong>
            <input type="text" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder="Например, Москва" style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
          </div>

          <div>
            <strong>Возраст:</strong>
            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              <input type="number" value={ageFromFilter} onChange={(e) => setAgeFromFilter(e.target.value)} placeholder="От" style={{ width: '100%', padding: '8px' }} />
              <input type="number" value={ageToFilter} onChange={(e) => setAgeToFilter(e.target.value)} placeholder="До" style={{ width: '100%', padding: '8px' }} />
            </div>
          </div>
          
          <div>
            <strong>Интересы:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '10px' }}>
              {allInterests.map(interest => (
                <label key={interest.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: selectedInterestIds.includes(interest.id) ? '#e6f7ff' : 'white' }}>
                  <input type="checkbox" checked={selectedInterestIds.includes(interest.id)} onChange={() => toggleInterestFilter(interest.id)} />
                  <span>{interest.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '15px' }}>
          <button onClick={applyFilters} style={{ padding: '8px 16px', backgroundColor: '#1890ff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Применить фильтры
          </button>
        </div>
      </div>
      {/* --- КОНЕЦ ВОССТАНОВЛЕННОГО БЛОКА ФИЛЬТРОВ --- */}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {profiles.length > 0 ? (
          profiles.map((profile) => (
            <div 
              key={profile.id} 
              onClick={() => onViewProfile(profile.userId)}
              style={{ 
                border: '1px solid #ccc', 
                padding: '15px', 
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <h2 style={{ marginTop: 0 }}>{profile.name}, {calculateAge(profile.birthDate)}</h2>
              <p style={{ color: '#555' }}>{profile.city}</p>
              <p>{profile.about}</p>
              {profile.interests && profile.interests.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Интересы:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                    {profile.interests.map(interest => (
                      <span key={interest.id} style={{ backgroundColor: '#e6f7ff', border: '1px solid #91d5ff', borderRadius: '4px', padding: '2px 8px', fontSize: '12px' }}>
                        {interest.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>По выбранным фильтрам анкет не найдено.</p>
        )}
      </div>
    </div>
  );
}