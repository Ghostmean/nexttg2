"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogIn, Copy, Check, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useAuth } from "@/app/auth-context";
import { getUserGroups, createGroup, joinGroupByCode } from "@/services/groups";
import type { Group } from "@/types";

export default function GroupsPage() {
  return (
    <ErrorBoundary>
      <GroupsContent />
    </ErrorBoundary>
  );
}

function GroupsContent() {
  const { profile, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const router = useRouter();

  const loadGroups = useCallback(async () => {
    if (!profile) return;
    try {
      const data = await getUserGroups(profile.telegram_id);
      setGroups(data);
    } catch {
      setError("Не удалось загрузить группы");
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (!authLoading && profile) loadGroups();
  }, [authLoading, profile, loadGroups]);

  async function handleCreate() {
    if (!profile || !createName.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createGroup({
        name: createName.trim(),
        description: createDesc.trim() || null,
        telegram_id: profile.telegram_id,
      });
      setCreateOpen(false);
      setCreateName("");
      setCreateDesc("");
      await loadGroups();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка создания");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    if (!profile || !joinCode.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await joinGroupByCode({
        inviteCode: joinCode.trim(),
        telegram_id: profile.telegram_id,
      });
      setJoinOpen(false);
      setJoinCode("");
      await loadGroups();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка вступления");
    } finally {
      setBusy(false);
    }
  }

  async function copyCode(code: string, id: number) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  }

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-orange-accent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col px-4 pt-8 pb-4">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-muted-foreground">
          Мои группы
        </h2>
        <div className="flex gap-2">
          <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
            <DialogTrigger>
              <Button
                variant="outline"
                size="sm"
                className="border-graphite-light"
              >
                <LogIn className="mr-1.5 h-4 w-4" />
                Вступить
              </Button>
            </DialogTrigger>
            <DialogContent className="border-graphite-light bg-card sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Вступить в группу</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Введите invite code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="border-graphite-light bg-graphite"
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button
                  onClick={handleJoin}
                  disabled={busy || !joinCode.trim()}
                  className="w-full bg-orange-accent text-black hover:bg-orange-accent/90"
                >
                  {busy ? "Загрузка..." : "Вступить"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger>
              <Button size="sm" className="bg-orange-accent text-black hover:bg-orange-accent/90">
                <Plus className="mr-1.5 h-4 w-4" />
                Создать
              </Button>
            </DialogTrigger>
            <DialogContent className="border-graphite-light bg-card sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Новая группа</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Название
                  </label>
                  <Input
                    placeholder="Название группы"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="border-graphite-light bg-graphite"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    Описание (необязательно)
                  </label>
                  <Input
                    placeholder="Описание группы"
                    value={createDesc}
                    onChange={(e) => setCreateDesc(e.target.value)}
                    className="border-graphite-light bg-graphite"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <Button
                  onClick={handleCreate}
                  disabled={busy || !createName.trim()}
                  className="w-full bg-orange-accent text-black hover:bg-orange-accent/90"
                >
                  {busy ? "Создание..." : "Создать"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium">Нет групп</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Создайте группу или вступите по приглашению
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Card
              key={group.id}
              className="cursor-pointer border-graphite-light/50 transition-colors hover:border-orange-accent/30"
              onClick={() => router.push(`/groups/${group.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{group.name}</h3>
                    {group.description && (
                      <p className="mt-0.5 text-sm text-muted-foreground truncate">
                        {group.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {group.member_count ?? "?"}{" "}
                        {group.member_count === 1 ? "участник" : "участников"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyCode(group.invite_code, group.id);
                  }}
                  className="mt-2 flex items-center gap-1 text-xs text-orange-accent"
                >
                  {copiedId === group.id ? (
                    <>
                      <Check className="h-3 w-3" />
                      Скопировано
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      {group.invite_code}
                    </>
                  )}
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
