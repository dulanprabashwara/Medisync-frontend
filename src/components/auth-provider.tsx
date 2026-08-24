"use client";

import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ApiError, getMyProfile, setLatestApiAccessToken } from "@/lib/api";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { MediSyncProfile } from "@/types/user";

interface AuthContextValue {
  session: Session | null;
  profile: MediSyncProfile | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshProfile: () => Promise<MediSyncProfile | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function withTimeout<T>(
  promise: PromiseLike<T>,
  milliseconds: number,
  message: string,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Promise.resolve(promise),
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), milliseconds);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function fetchProfile(session: Session): Promise<MediSyncProfile | null> {
  try {
    return await getMyProfile(session.access_token);
  } catch (error) {
    if (error instanceof ApiError && error.code === "ONBOARDING_REQUIRED") {
      return null;
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MediSyncProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const profileRef = useRef<MediSyncProfile | null>(null);
  const operationRef = useRef(0);

  const applySession = useCallback(async (nextSession: Session | null) => {
    const operation = ++operationRef.current;
    const sameUser = sessionRef.current?.user.id === nextSession?.user.id;
    sessionRef.current = nextSession;
    setLatestApiAccessToken(nextSession?.access_token ?? null);
    if (!sameUser || !nextSession) setSession(nextSession);
    setError(null);
    if (!nextSession) {
      profileRef.current = null;
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const nextProfile = await fetchProfile(nextSession);
      if (operation !== operationRef.current) return;
      profileRef.current = nextProfile;
      setProfile(nextProfile);
    } catch (profileError) {
      if (operation !== operationRef.current) return;
      const canKeepCurrentProfile =
        profileRef.current &&
        sessionRef.current?.user.id === nextSession.user.id;
      if (!canKeepCurrentProfile) {
        profileRef.current = null;
        setProfile(null);
        setError(
          profileError instanceof Error
            ? profileError.message
            : "Your MediSync profile could not be loaded.",
        );
      }
    } finally {
      if (operation === operationRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let client: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      client = getSupabaseBrowserClient();
    } catch (configurationError) {
      const timer = window.setTimeout(() => {
        setError(
          configurationError instanceof Error
            ? configurationError.message
            : "Supabase authentication is not configured.",
        );
        setLoading(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    void (async () => {
      try {
        const { data, error: sessionError } = await withTimeout(
          client.auth.getSession(),
          10_000,
          "The authentication service did not respond in time. Refresh the page to try again.",
        );
        if (!active) return;
        if (sessionError) throw sessionError;
        await applySession(data.session);
      } catch (sessionError) {
        if (!active) return;
        setError(
          sessionError instanceof Error
            ? sessionError.message
            : "Your secure session could not be checked.",
        );
        setLoading(false);
      }
    })();

    const { data: listener } = client.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!active) return;

        // getSession above owns initialization. Supabase also emits INITIAL_SESSION,
        // so processing both would duplicate the profile request and restart the loader.
        if (event === "INITIAL_SESSION") return;

        const sameUser = sessionRef.current?.user.id === nextSession?.user.id;
        if (
          (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") &&
          sameUser &&
          profileRef.current
        ) {
          sessionRef.current = nextSession;
          setLatestApiAccessToken(nextSession?.access_token ?? null);
          setError(null);
          setLoading(false);
          return;
        }

        if (!profileRef.current || !sameUser) setLoading(true);
        window.setTimeout(() => void applySession(nextSession), 0);
      },
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [applySession]);

  const refreshProfile = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    let authResult: Awaited<ReturnType<typeof client.auth.getSession>>;
    try {
      authResult = await withTimeout(
        client.auth.getSession(),
        10_000,
        "The authentication service did not respond in time. Refresh the page to try again.",
      );
    } catch (sessionError) {
      setError(
        sessionError instanceof Error
          ? sessionError.message
          : "Your secure session could not be checked.",
      );
      setLoading(false);
      return null;
    }
    const { data, error: sessionError } = authResult;
    if (sessionError || !data.session) {
      operationRef.current += 1;
      sessionRef.current = null;
      setLatestApiAccessToken(null);
      profileRef.current = null;
      setSession(null);
      setProfile(null);
      if (sessionError) setError(sessionError.message);
      setLoading(false);
      return null;
    }

    const existingProfile = profileRef.current;
    setRefreshing(true);
    try {
      const nextProfile = await fetchProfile(data.session);
      sessionRef.current = data.session;
      setLatestApiAccessToken(data.session.access_token);
      profileRef.current = nextProfile;
      if (session?.user.id !== data.session.user.id) setSession(data.session);
      setProfile(nextProfile);
      setError(null);
      return nextProfile;
    } catch (profileError) {
      if (!existingProfile) {
        setError(
          profileError instanceof Error
            ? profileError.message
            : "Your MediSync profile could not be loaded.",
        );
      }
      return existingProfile;
    } finally {
      setRefreshing(false);
      if (!existingProfile) setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (
        document.visibilityState === "visible" &&
        sessionRef.current &&
        profileRef.current
      ) {
        void refreshProfile();
      }
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () =>
      document.removeEventListener("visibilitychange", refreshWhenVisible);
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    await client.auth.signOut();
    operationRef.current += 1;
    sessionRef.current = null;
    setLatestApiAccessToken(null);
    profileRef.current = null;
    setSession(null);
    setProfile(null);
    setError(null);
    setLoading(false);
    setRefreshing(false);
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      refreshing,
      error,
      refreshProfile,
      signOut,
    }),
    [session, profile, loading, refreshing, error, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
