"use client";

import { useEffect, useState } from "react";
import {
  retrieveLaunchParams,
  retrieveRawInitData,
  isTMA,
} from "@telegram-apps/sdk";
import { ProfileCard } from "@/components/shared/profile-card";
import { upsertProfile, updateProfileName } from "@/services/profile";
import type { Profile } from "@/types";
import type { User } from "@telegram-apps/types";

type PageState =
  | { status: "loading" }
  | { status: "not-telegram" }
  | { status: "error"; message: string }
  | { status: "loaded"; profile: Profile; raw: string };

export default function Home() {
  const [state, setState] = useState<PageState>({ status: "loading" });

  useEffect(() => {
    async function init() {
      if (!isTMA()) {
        setState({ status: "not-telegram" });
        return;
      }

      try {
        const params = retrieveLaunchParams();
        const initData = params.tgWebAppData;
        const tgUser: User | undefined = initData?.user;
        const raw = retrieveRawInitData();

        if (!tgUser || !raw) {
          setState({
            status: "error",
            message: "Не удалось получить данные пользователя Telegram",
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

        setState({ status: "loaded", profile, raw });
      } catch (e) {
        setState({
          status: "error",
          message:
            e instanceof Error ? e.message : "Произошла неизвестная ошибка",
        });
      }
    }

    init();
  }, []);

  async function handleSaveName(first_name: string, last_name: string | null) {
    if (state.status !== "loaded") return;

    const updated = await updateProfileName(
      state.profile.telegram_id,
      first_name,
      last_name
    );

    setState({ ...state, profile: updated });
  }

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-orange-accent" />
        <p className="text-sm text-muted-foreground">Загрузка профиля...</p>
      </div>
    );
  }

  if (state.status === "not-telegram") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mx-auto w-full max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <span className="text-2xl">📱</span>
          </div>
          <h1 className="text-xl font-semibold">Откройте в Telegram</h1>
          <p className="text-sm text-muted-foreground">
            Это приложение работает только внутри Telegram Mini App
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="mx-auto w-full max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-semibold">Ошибка</h1>
          <p className="text-sm text-muted-foreground">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 px-4 pt-8">
        <div className="mb-6 text-center">
          <h2 className="text-lg font-medium text-muted-foreground">
            Мой профиль
          </h2>
        </div>

        <ProfileCard profile={state.profile} onSave={handleSaveName} />
      </div>

      <div className="sticky bottom-0 border-t border-graphite-light/30 bg-background/80 backdrop-blur-lg">
        <div className="px-4 py-3 text-center text-xs text-muted-foreground">
          Attendance Tracker Mini App
        </div>
      </div>
    </div>
  );
}
