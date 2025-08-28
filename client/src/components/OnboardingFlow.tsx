// client/src/components/OnboardingFlow.tsx
import { useState } from 'react';
import axios from 'axios';
import { WelcomePage } from './WelcomePage';
import { OnboardingStep1_CoreInfo } from './OnboardingStep1_CoreInfo';
import { OnboardingStep2_Interests } from './OnboardingStep2_Interests';
import { OnboardingStep3_BioPhoto } from './OnboardingStep3_BioPhoto';
import { OnboardingStep4_Verification } from './OnboardingStep4_Verification';

interface OnboardingFlowProps {
  userId: string;
  onOnboardingSuccess: (data: any) => void;
}

export function OnboardingFlow({ userId, onOnboardingSuccess }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    userId: userId,
    name: '',
    birthDate: '',
    city: '',
    interestIds: [] as number[],
    photoFile: null as File | null,
    about: '',
    verificationFile: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const updateFormData = (newData: any) => {
    setFormData(prevData => ({ ...prevData, ...newData }));
  };

  const handleSubmit = async (finalData: { verificationFile: File | null }) => {
    setIsLoading(true);
    setError(null);

    const finalFormData = { ...formData, ...finalData };

    const dataToSend = new FormData();
    dataToSend.append('userId', finalFormData.userId);
    dataToSend.append('name', finalFormData.name);
    dataToSend.append('birthDate', finalFormData.birthDate);
    dataToSend.append('city', finalFormData.city);
    dataToSend.append('about', finalFormData.about);
    dataToSend.append('interestIds', JSON.stringify(finalFormData.interestIds));

    if (finalFormData.photoFile) {
      dataToSend.append('photo', finalFormData.photoFile);
    }
    if (finalFormData.verificationFile) {
      dataToSend.append('verificationPhoto', finalFormData.verificationFile);
    }

    try {
      const response = await axios.post('/api/profiles', dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newAuthData = {
        user: { id: userId, status: 'PENDING_VERIFICATION' },
        profile: response.data,
      };
      
      onOnboardingSuccess(newAuthData);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Произошла ошибка при создании профиля.');
      setIsLoading(false);
    }
  };

  // --- ИСПРАВЛЕНИЕ: Добавляем отображение ошибки ---
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red', textAlign: 'center', height: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Произошла ошибка</h2>
        <p style={{ maxWidth: '400px' }}>{error}</p>
        <button 
          onClick={() => {
            setError(null); // Сбрасываем ошибку
            setIsLoading(false); // Сбрасываем состояние загрузки
          }}
          style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  switch (step) {
    case 1:
      return <WelcomePage onNext={nextStep} />;
    case 2:
      return <OnboardingStep1_CoreInfo onNext={nextStep} onBack={prevStep} updateFormData={updateFormData} />;
    case 3:
      return <OnboardingStep2_Interests onNext={nextStep} onBack={prevStep} updateFormData={updateFormData} />;
    case 4:
      return <OnboardingStep3_BioPhoto onNext={nextStep} onBack={prevStep} updateFormData={updateFormData} />;
    case 5:
      return <OnboardingStep4_Verification onSubmit={handleSubmit} onBack={prevStep} isLoading={isLoading} />;
    default:
      return <WelcomePage onNext={nextStep} />;
  }
}