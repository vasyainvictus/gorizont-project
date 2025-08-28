// client/src/components/OnboardingStep2_Interests.tsx
import { useState } from 'react';
import { useInterests } from '../hooks/useInterests';

interface OnboardingStep2Props {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: { interestIds: number[] }) => void;
}

export function OnboardingStep2_Interests({ onNext, onBack, updateFormData }: OnboardingStep2Props) {
  const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([]);
  const { interests, loading, error } = useInterests();

  const toggleInterest = (id: number) => {
    setSelectedInterestIds(prev =>
      prev.includes(id)
        ? prev.filter(interestId => interestId !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    updateFormData({ interestIds: selectedInterestIds });
    onNext();
  };
  
  const isFormValid = selectedInterestIds.length > 0;

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <p>Шаг 2 из 4</p>
        <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '4px' }}>
          <div style={{ width: '50%', height: '8px', backgroundColor: '#0088cc', borderRadius: '4px' }}></div>
        </div>
      </div>

      <h1>Ищу компанию для...</h1>
      <p>Выберите то, что вам интересно. Это поможет найти близких по духу людей.</p>
      
      {loading && <p>Загрузка интересов...</p>}
      {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px', marginTop: '20px' }}>
        {interests.map(interest => (
          <label 
            key={interest.id}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px', border: '1px solid #ddd', borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: selectedInterestIds.includes(interest.id) ? '#e6f7ff' : 'white',
              transition: 'background-color 0.2s'
            }}
          >
            <input
              type="checkbox"
              style={{ width: '18px', height: '18px' }}
              checked={selectedInterestIds.includes(interest.id)}
              onChange={() => toggleInterest(interest.id)}
            />
            <span>{interest.name}</span>
          </label>
        ))}
      </div>
      
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