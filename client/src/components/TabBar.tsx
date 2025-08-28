type Page = 'feed' | 'profile' | 'connections';

interface TabBarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

export function TabBar({ currentPage, setCurrentPage }: TabBarProps) {
  const tabStyle = (page: Page) => ({
    padding: '10px 20px',
    cursor: 'pointer',
    borderBottom: currentPage === page ? '2px solid blue' : '2px solid transparent',
    fontWeight: currentPage === page ? 'bold' : 'normal',
    flex: 1,
    textAlign: 'center' as const,
  });

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      borderTop: '1px solid #ccc',
      position: 'fixed',
      bottom: 0,
      width: '100%',
      backgroundColor: 'white',
    }}>
      <div onClick={() => setCurrentPage('feed')} style={tabStyle('feed')}>
        Лента
      </div>
      {/* 2. Добавляем новую вкладку "Запросы" */}
      <div onClick={() => setCurrentPage('connections')} style={tabStyle('connections')}>
        Запросы
      </div>
      <div onClick={() => setCurrentPage('profile')} style={tabStyle('profile')}>
        Профиль
      </div>
    </div>
  );
}