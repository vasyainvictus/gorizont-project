// client/src/components/OnboardingStep1_CoreInfo.tsx
import { useState } from 'react';

interface OnboardingStep1Props {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: { name: string; birthDate: string; city: string }) => void;
}

export function OnboardingStep1_CoreInfo({ onNext, onBack, updateFormData }: OnboardingStep1Props) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [city, setCity] = useState('');

  const handleNext = () => {
    updateFormData({ name, birthDate, city });
    onNext();
  };
  
  const isFormValid = name.trim() && birthDate && city.trim();

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <p>Шаг 1 из 4</p>
        <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '4px' }}>
          <div style={{ width: '25%', height: '8px', backgroundColor: '#0088cc', borderRadius: '4px' }}></div>
        </div>
      </div>

      <h1>Расскажите о себе</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Ваше имя"
          value={name}
          // --- ИСПРАВЛЕНИЕ: Убеждаемся, что onChange обновляет состояние 'name' ---
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '1em' }}
        />
        <label>
          Дата рождения:
          <input
            type="date"
            value={birthDate}
            // --- ИСПРАВЛЕНИЕ: Убеждаемся, что onChange обновляет состояние 'birthDate' ---
            onChange={(e) => setBirthDate(e.target.value)}
            required
            style={{ padding: '10px', width: '100%', boxSizing: 'border-box', marginTop: '5px', fontSize: '1em' }}
          />
        </label>
        <input
          type="text"
          placeholder="Город"
          value={city}
          // --- ИСПРАВЛЕНИЕ: Убеждаемся, что onChange обновляет состояние 'city' ---
          onChange={(e) => setCity(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '1em' }}
        />
      </div>

      {/* Блок навигации с двумя кнопками */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <button 
          onClick={onBack} 
          style={{ 
            padding: '12px 24px', cursor: 'pointer', backgroundColor: '#f0f0f0', 
            color: '#333', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1em'
          }}
        >
          Назад
        </button>
        <button 
          onClick={handleNext} 
          disabled={!isFormValid}
          style={{ 
            padding: '12px 24px', 
            cursor: isFormValid ? 'pointer' : 'not-allowed', 
            backgroundColor: isFormValid ? '#0088cc' : '#ccc', 
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1em'
          }}
        >
          Далее
        </button>
      </div>
    </div>
  );
}