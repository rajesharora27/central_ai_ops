import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { gql, useMutation } from '@apollo/client';
import { client } from '../../../providers/ApolloClientProvider';

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      user { id username email isAdmin }
    }
  }
`;

type User = { id: string; username: string; email?: string; isAdmin: boolean };

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('governance_token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('governance_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [loginMutation] = useMutation(LOGIN);

  const login = useCallback(async (username: string, password: string) => {
    const { data } = await loginMutation({ variables: { username, password } });
    const { token: t, user: u } = data.login;
    localStorage.setItem('governance_token', t);
    localStorage.setItem('governance_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  }, [loginMutation]);

  const logout = useCallback(() => {
    localStorage.removeItem('governance_token');
    localStorage.removeItem('governance_user');
    setToken(null);
    setUser(null);
    client.resetStore();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
