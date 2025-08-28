import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { FeedPage } from './components/FeedPage';
import { OnboardingFlow } from './components/OnboardingFlow';
import { ProfilePage } from './components/ProfilePage';
import { TabBar } from './components/TabBar';
import { UserProfilePage } from './components/UserProfilePage';
import { ConnectionsPage } from './components/ConnectionsPage'; // <-- 1. ИМПОРТ

// 2. Добавляем 'connections' в тип
type Page = 'feed' | 'profile' | 'connections';

function App() {
  const [authData, setAuthData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<Page>('feed');
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

  const handleLoginSuccess = (data: any) => {
    setAuthData(data);
  };

  if (!authData) { return <LoginPage onLoginSuccess={handleLoginSuccess} />; }
  if (authData.user && !authData.profile) { return <OnboardingFlow userId={authData.user.id} onOnboardingSuccess={handleLoginSuccess} />; }

  if (authData.user && authData.profile) {
    if (viewingProfileId) {
      return <UserProfilePage 
                currentUser={authData.user}
                profileId={viewingProfileId} 
                onBack={() => setViewingProfileId(null)}
             />;
    }

    // 3. ОБНОВЛЕННАЯ ЛОГИКА РЕНДЕРА
    return (
      <div style={{ paddingBottom: '60px' }}>
        {currentPage === 'feed' && <FeedPage user={authData.user} onViewProfile={setViewingProfileId} />}
        {currentPage === 'profile' && <ProfilePage user={authData.user} />}
        {currentPage === 'connections' && <ConnectionsPage currentUser={authData.user} />}
        
        <TabBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </div>
    );
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

export default App;