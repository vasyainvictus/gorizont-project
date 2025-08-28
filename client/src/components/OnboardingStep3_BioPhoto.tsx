// client/src/components/OnboardingStep3_BioPhoto.tsx
import { useState } from 'react';
import type { ChangeEvent } from 'react';

// Описываем пропсы
interface OnboardingStep3Props {
  onNext: () => void;
  onBack: () => void;
  updateFormData: (data: { about: string; photoFile: File | null }) => void;
}

export function OnboardingStep3_BioPhoto({ onNext, onBack, updateFormData }: OnboardingStep3Props) {
  // Локальное состояние для этого шага
  const [about, setAbout] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null); // Для предпросмотра фото

  // Обработчик выбора файла
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      // Создаем URL для предпросмотра
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Обработчик нажатия на кнопку "Далее"
  const handleNext = () => {
    updateFormData({ about, photoFile });
    onNext();
  };
  
  // Кнопка активна, только если фото загружено и поле "о себе" заполнено
  const isFormValid = photoFile && about.trim().length > 10; // Ставим минимальную длину для "о себе"

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <p>Шаг 3 из 4</p>
        <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '4px' }}>
          <div style={{ width: '75%', height: '8px', backgroundColor: '#0088cc', borderRadius: '4px' }}></div>
        </div>
      </div>

      <h1>Последние штрихи</h1>
      
      {/* Блок загрузки фото */}
      <div style={{ marginTop: '20px' }}>
        <label>
          <strong>Загрузите ваше фото:</strong>
          <div style={{ 
            width: '150px', height: '150px', border: '2px dashed #ccc', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', marginTop: '10px', cursor: 'pointer',
            backgroundImage: photoPreview ? `url(${photoPreview})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center'
          }}>
            {!photoPreview && <span>+</span>}
          </div>
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handlePhotoChange}
            style={{ display: 'none' }} // Скрываем стандартный инпут
            required
          />
        </label>
      </div>

      {/* Поле "О себе" */}
      <div style={{ marginTop: '20px' }}>
        <label>
          <strong>Коротко о себе:</strong>
          <textarea
            placeholder="Расскажите, чем вы увлекаетесь, что ищете. Это поможет найти единомышленниц."
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            maxLength={300}
            required
            style={{ 
              padding: '10px', minHeight: '100px', width: '100%', 
              boxSizing: 'border-box', marginTop: '10px', fontSize: '1em',
              border: '1px solid #ccc', borderRadius: '4px'
            }}
          />
        </label>
      </div>
      
      {/* Кнопки навигации */}
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