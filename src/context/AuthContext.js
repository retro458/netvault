/**
 * AuthContext — estado global de la sesión.
 *
 * Es la base de la "guarda de rutas": RootNavigator solo monta las pantallas
 * protegidas (Home, Dispositivos, Perfil) cuando `isLoggedIn` es true.
 *
 * Uso:
 *   const { user, isLoggedIn, isLoading, signIn, signOut } = useAuth();
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as authStorage from '../services/authStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // { token, user } | null
  const [isLoading, setIsLoading] = useState(true); // true mientras se lee AsyncStorage

  // Al abrir la app, restaura la sesión si existe (el usuario no vuelve a loguearse).
  useEffect(() => {
    authStorage
      .getSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoggedIn: Boolean(session?.token),
      isLoading,
      /** Lanza Error si las credenciales son incorrectas. */
      signIn: async (username, password) => {
        const newSession = await authStorage.login(username, password);
        setSession(newSession);
      },
      /** Limpia AsyncStorage y regresa al Login automáticamente. */
      signOut: async () => {
        await authStorage.logout();
        setSession(null);
      },
    }),
    [session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
