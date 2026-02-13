import { useNavigate } from '@tanstack/react-router';
import { useApolloClient, useMutation } from '@apollo/client/react';
import type { GetMeData, LogoutResponse } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { LOGOUT_MUTATION } from '../../graphql/auth';

interface UserHeaderProps {
  user: NonNullable<GetMeData['me']>;
}

export function UserHeader({ user }: UserHeaderProps) {
  const navigate = useNavigate();
  const client = useApolloClient();
  const logout = useAuthStore((state) => state.logout);
  const [logoutMutation] = useMutation<LogoutResponse>(LOGOUT_MUTATION);

  const handleLogout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      await client.resetStore();
      navigate({ to: '/auth' });
    }
  };

  return (
    <header>
      <div className="user-info">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name ?? 'user'}
            className="user-avatar"
          />
        ) : (
          <div className="user-avatar-fallback">
            {user.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
        )}
        <div className="user-info-text">
          <span className="user-info-label">Signed in as:</span>
          <span className="user-info-name">{user.name}</span>
        </div>
      </div>

      <button onClick={handleLogout} className="btn-logout" data-testid="sign-out-btn">
        Sign Out
      </button>
    </header>
  );
}
