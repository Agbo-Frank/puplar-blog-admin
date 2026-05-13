import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useNavigate } from "react-router";
import { STORAGE_KEYS } from "@/utils/constant";
import type { IAuth, IAdminProfile, IAuthor, ICategory } from "@/api/types";
import { isEmpty, parseJson } from "@/utils";
import dayjs from "dayjs";

interface IState {
  auth:        IAuth         | null;
  user:        IAdminProfile | null;
  author:      IAuthor       | null;
  categories:  ICategory[];
  authorName:  string;
}

const initialState: IState = {
  auth:        null,
  user:        null,
  author:      null,
  categories:  [],
  authorName:  '',
};

export interface StoreContext extends IState {
  hydrated:       boolean;
  setAuth:        (auth: IAuth) => void;
  unsetAuth:      () => void;
  setUser:        (user: IAdminProfile | null) => void;
  setAuthor:      (author: IAuthor | null) => void;
  setCategories:  (cats: ICategory[]) => void;
  setAuthorName:  (name: string) => void;
}

const store = createContext<StoreContext | null>(null);

export function StoreProvider({ children }: PropsWithChildren) {
  const [state, setState]       = useState<IState>(initialState);
  const [hydrated, setHydrated] = useState(false);
  const navigate = useNavigate();

  const setAuth = useCallback((auth: IAuth) => {
    if (isEmpty(auth)) return;
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
    setState((p) => ({ ...p, auth }));
  }, []);

  const unsetAuth = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setState(() => ({ ...initialState }));
    navigate("/login", { replace: true });
  }, [navigate]);

  const setUser = useCallback((user: IAdminProfile | null) => {
    if (user === null) {
      localStorage.removeItem(STORAGE_KEYS.USER);
      setState((p) => ({ ...p, user: null }));
      return;
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    setState((p) => ({ ...p, user }));
  }, []);

  const setAuthor = useCallback((author: IAuthor | null) => {
    setState((p) => ({ ...p, author }));
  }, []);

  const setCategories = useCallback((cats: ICategory[]) => {
    setState((p) => ({ ...p, categories: cats }));
  }, []);

  const setAuthorName = useCallback((name: string) => {
    setState((p) => ({ ...p, authorName: name }));
  }, []);

  // Auto-logout when refresh token has expired
  useEffect(() => {
    if (!hydrated || !state.auth?.refresh_token_expires_at) return;
    const expiresAt = dayjs(state.auth.refresh_token_expires_at);
    if (!expiresAt.isValid() || expiresAt.isAfter(dayjs())) return;
    unsetAuth();
  }, [hydrated, state.auth?.refresh_token_expires_at, unsetAuth]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const authRaw = localStorage.getItem(STORAGE_KEYS.AUTH);
      const userRaw = localStorage.getItem(STORAGE_KEYS.USER);
      const auth    = authRaw ? parseJson<IAuth>(authRaw)         : null;
      const user    = userRaw ? parseJson<IAdminProfile>(userRaw) : null;
      setState({ auth, user, author: null, categories: [], authorName: '' });
    } catch (error) {
      console.error("Error loading from storage:", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  return (
    <store.Provider value={{ ...state, hydrated, setAuth, unsetAuth, setUser, setAuthor, setCategories, setAuthorName }}>
      {children}
    </store.Provider>
  );
}

export function useStore(): StoreContext {
  const context = useContext(store);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
}
