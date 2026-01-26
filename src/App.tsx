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

  if (loading) return <div className="loader">Загрузка ByteFood...</div>;

  return (
    <div className="app-container">
      {data?.me ? (
        <div className="dashboard">
          <header style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {data.me.avatar ? (
                <img 
                  src={data.me.avatar} 
                  alt={data.me.name ?? 'user_image'} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#007bff', 
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                  {data.me.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <span>
                Вы вошли как: <strong>{data.me.name}</strong>
              </span>
            </div>
            
            <button onClick={handleLogout} className="btn-logout">
              Выйти
            </button>
          </header>
          
          <main>
            <h1>База данных аминокислот</h1>
            <p>Добро пожаловать в ByteFood. Здесь будет список молекул.</p>
          </main>
        </div>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

export default App;
