// client/src/components/WelcomePage.tsx

// Описываем, какие пропсы ожидает наш компонент.
// В данном случае, это одна функция onNext, которая не принимает аргументов и ничего не возвращает.
interface WelcomePageProps {
  onNext: () => void;
}

export function WelcomePage({ onNext }: WelcomePageProps) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      textAlign: 'center', 
      padding: '20px', 
      height: '80vh' 
    }}>
      <h1>Добро пожаловать на «Веранду»</h1>
      <p style={{ fontSize: '1.2em', maxWidth: '400px', margin: '20px 0' }}>
        Место для поиска подруг, совместных событий и нетворкинга. 
        <br/>
        Не дейтинг.
      </p>
      <button 
        onClick={onNext} // При клике вызываем функцию, переданную из родителя
        style={{
          padding: '12px 24px',
          fontSize: '1.1em',
          cursor: 'pointer',
          backgroundColor: '#0088cc',
          color: 'white',
          border: 'none',
          borderRadius: '8px'
        }}
      >
        Создать профиль
      </button>
    </div>
  );
}