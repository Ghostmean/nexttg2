"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Save, X, User, Hash, AtSign, Shield } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/types";
import { cn } from "@/lib/utils";

const roleLabels: Record<string, string> = {
  student: "Студент",
  monitor: "Староста",
  teacher: "Преподаватель",
};

const roleIcons: Record<string, string> = {
  student: "🎓",
  monitor: "⭐",
  teacher: "👨‍🏫",
};

interface ProfileCardProps {
  profile: Profile;
  onSave: (first_name: string, last_name: string | null) => Promise<void>;
}

function getInitials(firstName: string, lastName: string | null): string {
  const first = firstName.charAt(0).toUpperCase();
  const last = lastName ? lastName.charAt(0).toUpperCase() : "";
  return `${first}${last}` || "?";
}

export function ProfileCard({ profile, onSave }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(profile.first_name);
  const [lastName, setLastName] = useState(profile.last_name ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!firstName.trim()) {
      toast.error("Имя не может быть пустым");
      return;
    }

    setSaving(true);
    const promise = onSave(firstName.trim(), lastName.trim() || null);
    toast.promise(promise, {
      loading: "Сохранение...",
      success: () => {
        setEditing(false);
        return "Профиль обновлён";
      },
      error: "Ошибка сохранения",
    });
    await promise;
    setSaving(false);
  }

  function handleCancel() {
    setFirstName(profile.first_name);
    setLastName(profile.last_name ?? "");
    setEditing(false);
  }

  return (
    <Card className="mx-auto w-full max-w-md border-graphite-light/50 bg-card">
      <CardContent className="flex flex-col items-center gap-5 p-6 pt-8">
        <Avatar className="h-20 w-20 border-2 border-orange-accent/50">
          <AvatarFallback className="bg-orange-accent/10 text-lg font-bold text-orange-accent">
            {getInitials(profile.first_name, profile.last_name)}
          </AvatarFallback>
        </Avatar>

        {editing ? (
          <div className="flex w-full flex-col gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Имя</label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Введите имя"
                className="border-graphite-light bg-graphite"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Фамилия</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Введите фамилию"
                className="border-graphite-light bg-graphite"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 border-graphite-light"
              >
                <X className="mr-2 h-4 w-4" />
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-orange-accent text-black hover:bg-orange-accent/90"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center">
              <h1 className="text-xl font-semibold">
                {profile.first_name} {profile.last_name}
              </h1>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm text-orange-accent transition-colors hover:text-orange-accent/80"
            >
              <Pencil className="h-3.5 w-3.5" />
              Редактировать
            </button>

            <div className="flex w-full flex-col gap-3">
              <InfoRow
                icon={<AtSign className="h-4 w-4" />}
                label="Username"
                value={profile.username ? `@${profile.username}` : "—"}
              />
              <InfoRow
                icon={<Hash className="h-4 w-4" />}
                label="Telegram ID"
                value={String(profile.telegram_id)}
              />
              <InfoRow
                icon={<Shield className="h-4 w-4" />}
                label="Роль"
                value={
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
                      profile.role === "monitor" &&
                        "bg-orange-accent/15 text-orange-accent",
                      profile.role === "teacher" &&
                        "bg-blue-500/15 text-blue-400",
                      profile.role === "student" &&
                        "bg-green-500/15 text-green-400"
                    )}
                  >
                    {roleIcons[profile.role]}{" "}
                    {roleLabels[profile.role] || profile.role}
                  </span>
                }
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <span className="min-w-[100px] text-sm text-muted-foreground">
        {label}
      </span>
      <span className="ml-auto text-sm font-medium">{value}</span>
    </div>
  );
}
