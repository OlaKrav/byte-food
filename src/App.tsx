import { useQuery } from '@apollo/client/react';
import { AuthForm } from './components/AuthForm';
import { GET_ME } from './graphql/auth';
import type { GetMeData } from './types';

function App() {
  const { data, loading, client } = useQuery<GetMeData>(GET_ME);

  const handleLogout = () => {
    localStorage.removeItem('token');
    client.resetStore();
  };

  if (loading) {
    return <div className="loader">Loading ByteFood...</div>;
  }

  return (
    <div className="app-container">
      {data?.me ? (
        <div className="dashboard">
          <header>
            <div className="user-info">
              {data.me.avatar ? (
                <img 
                  src={data.me.avatar} 
                  alt={data.me.name ?? 'user_image'} 
                  className="user-avatar"
                />
              ) : (
                <div className="user-avatar-fallback">
                  {data.me.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
              )}
              <div className="user-info-text">
                <span className="user-info-label">Signed in as:</span>
                <span className="user-info-name">{data.me.name}</span>
              </div>
            </div>
            
            <button onClick={handleLogout} className="btn-logout">
              Sign Out
            </button>
          </header>
          
          <main>
            <h1>Amino Acid Database</h1>
            <p>Welcome to ByteFood. Your molecular database will appear here.</p>
          </main>
        </div>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

export default App;
