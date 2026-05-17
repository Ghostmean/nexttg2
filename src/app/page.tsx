"use client";

import { ProfileCard } from "@/components/shared/profile-card";
import { updateProfileName } from "@/services/profile";
import { useAuth } from "./auth-context";

export default function Home() {
  const { profile, loading, error } = useAuth();

  async function handleSaveName(first_name: string, last_name: string | null) {
    if (!profile) return;
    await updateProfileName(profile.telegram_id, first_name, last_name);
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-orange-accent" />
        <p className="text-sm text-muted-foreground">Загрузка профиля...</p>
      </div>
    );
  }

  if (error === "not-telegram") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
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

  if (error || !profile) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <div className="mx-auto w-full max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-semibold">Ошибка</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 pt-8">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-medium text-muted-foreground">
          Мой профиль
        </h2>
      </div>

      <ProfileCard profile={profile} onSave={handleSaveName} />
    </div>
  );
}
