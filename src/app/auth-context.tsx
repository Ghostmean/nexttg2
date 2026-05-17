"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  retrieveLaunchParams,
  retrieveRawInitData,
  isTMA,
} from "@telegram-apps/sdk";
import { upsertProfile } from "@/services/profile";
import type { Profile } from "@/types";

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  raw: string | null;
}

const AuthContext = createContext<AuthState>({
  profile: null,
  loading: true,
  error: null,
  raw: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    profile: null,
    loading: true,
    error: null,
    raw: null,
  });

  useEffect(() => {
    async function init() {
      if (!isTMA()) {
        setState({ profile: null, loading: false, error: "not-telegram", raw: null });
        return;
      }

      try {
        const params = retrieveLaunchParams();
        const initData = params.tgWebAppData;
        const tgUser = initData?.user;
        const raw = retrieveRawInitData();

        if (!tgUser || !raw) {
          setState({
            profile: null,
            loading: false,
            error: "Не удалось получить данные пользователя",
            raw: null,
          });
          return;
        }

        const profile = await upsertProfile({
          telegram_id: tgUser.id,
          username: tgUser.username ?? null,
          first_name: tgUser.first_name,
          last_name: tgUser.last_name ?? null,
          initDataRaw: raw,
        });

        setState({ profile, loading: false, error: null, raw });
      } catch (e) {
        setState({
          profile: null,
          loading: false,
          error: e instanceof Error ? e.message : "Unknown error",
          raw: null,
        });
      }
    }

    init();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
