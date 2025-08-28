// client/src/components/OnboardingStep4_Verification.tsx
import { useState } from 'react';
import type { ChangeEvent } from 'react';

// Описываем пропсы
interface OnboardingStep4Props {
  onSubmit: (data: { verificationFile: File | null }) => void; // Финальная отправка
  onBack: () => void;
  isLoading: boolean; // Получаем состояние загрузки от родителя
}

export function OnboardingStep4_Verification({ onSubmit, onBack, isLoading }: OnboardingStep4Props) {
  // Локальное состояние для этого шага
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Обработчик выбора файла
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVerificationFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Обработчик нажатия на финальную кнопку
  const handleSubmit = () => {
    onSubmit({ verificationFile });
  };
  
  const isFormValid = verificationFile !== null;

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <p>Шаг 4 из 4</p>
        <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '4px' }}>
          <div style={{ width: '100%', height: '8px', backgroundColor: '#0088cc', borderRadius: '4px' }}></div>
        </div>
      </div>

      <h1>Подтвердите профиль</h1>
      <p>В «Веранде» мы заботимся о безопасности. Чтобы мы знали, что вы — это вы, сделайте простое селфи с жестом "палец вверх" 👍.</p>
      
      <div style={{ marginTop: '20px' }}>
        <label>
          <strong>Сделайте селфи с жестом:</strong>
          <div style={{ 
            width: '150px', height: '150px', border: '2px dashed #ccc', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', marginTop: '10px', cursor: 'pointer',
            backgroundImage: preview ? `url(${preview})` : 'none',
            backgroundSize: 'cover', backgroundPosition: 'center'
          }}>
            {!preview && <span>+</span>}
          </div>
          <input
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            required
          />
        </label>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
        <button 
          onClick={onBack} 
          disabled={isLoading}
          style={{ 
            padding: '12px 24px', cursor: 'pointer', backgroundColor: '#f0f0f0', 
            color: '#333', border: '1px solid #ccc', borderRadius: '8px', fontSize: '1em'
          }}
        >
          Назад
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={!isFormValid || isLoading}
          style={{ 
            padding: '12px 24px', 
            cursor: (isFormValid && !isLoading) ? 'pointer' : 'not-allowed', 
            backgroundColor: (isFormValid && !isLoading) ? '#28a745' : '#ccc', 
            color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1em'
          }}
        >
          {isLoading ? 'Создаем профиль...' : 'Завершить и войти'}
        </button>
      </div>
    </div>
  );
}