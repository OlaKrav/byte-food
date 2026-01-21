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
          <header>
            <span>
              Вы вошли как: <strong>{data.me.name}</strong>
            </span>
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
