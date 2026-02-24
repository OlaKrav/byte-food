import { useNavigate } from '@tanstack/react-router';
import { useApolloClient, useMutation } from '@apollo/client/react';
import type { GetMeData, LogoutResponse } from '../../../types';
import { useAuthStore } from '../../../store/authStore';
import { LOGOUT_MUTATION } from '../../../graphql/auth';
import styles from './UserHeader.module.css';

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
    <header className={styles.root}>
      <div className={styles.userInfo}>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name ?? 'user'}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarFallback}>
            {user.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>
        )}
        <div className={styles.infoText}>
          <span className={styles.infoLabel}>Signed in as:</span>
          <span className={styles.userName}>{user.name}</span>
        </div>
      </div>

      <button onClick={handleLogout} className={styles.logoutBtn} data-testid="sign-out-btn">
        Sign Out
      </button>
    </header>
  );
}
