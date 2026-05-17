"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check, RefreshCw, Trash2, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/app/auth-context";
import { getGroup, removeMember, regenerateInviteCode } from "@/services/groups";
import type { Group, GroupMember, Profile } from "@/types";
import { toast } from "sonner";

interface MemberWithProfile extends GroupMember {
  profile: Profile | null;
}

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile: currentProfile } = useAuth();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  async function loadGroup() {
    if (!id) return;
    const data = await getGroup(Number(id));
    if (!data) {
      toast.error("Группа не найдена");
      router.push("/groups");
      return;
    }
    setGroup(data.group);
    setMembers(data.members);
    setLoading(false);
  }

  useEffect(() => {
    loadGroup();
  }, [id]);

  const isMonitor = members.some(
    (m) =>
      m.profile?.telegram_id === currentProfile?.telegram_id &&
      m.role === "monitor"
  );

  async function handleRemove(telegramId: number) {
    if (!currentProfile) return;
    const member = members.find(
      (m) => m.profile?.telegram_id === telegramId
    );
    if (!member) return;

    const promise = removeMember({
      groupId: Number(id),
      memberId: member.id,
      requesterTelegramId: currentProfile.telegram_id,
    });

    toast.promise(promise, {
      loading: "Удаление...",
      success: () => {
        loadGroup();
        return "Участник удалён";
      },
      error: (e) => e.message,
    });

    await promise;
  }

  async function handleRegenerateCode() {
    if (!currentProfile || !group) return;

    const promise = regenerateInviteCode({
      groupId: group.id,
      telegram_id: currentProfile.telegram_id,
    });

    toast.promise(promise, {
      loading: "Обновление кода...",
      success: (newCode: string) => {
        loadGroup();
        return "Код приглашения обновлён";
      },
      error: (e) => e.message,
    });
  }

  async function copyCode() {
    if (!group) return;
    await navigator.clipboard.writeText(group.invite_code);
    setCopied(true);
    toast.success("Код скопирован");
    setTimeout(() => setCopied(false), 2000);
  }

  function getInitials(p: Profile): string {
    const first = p.first_name?.charAt(0).toUpperCase() || "";
    const last = p.last_name?.charAt(0).toUpperCase() || "";
    return `${first}${last}` || "?";
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-orange-accent" />
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="flex flex-col px-4 pt-4 pb-4">
      <button
        onClick={() => router.push("/groups")}
        className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </button>

      <Card className="border-graphite-light/50 bg-card">
        <CardContent className="p-5">
          <h1 className="text-xl font-semibold">{group.name}</h1>
          {group.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {group.description}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Код приглашения:
              </span>
              <span className="font-mono text-sm font-medium">
                {group.invite_code}
              </span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyCode}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              {isMonitor && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRegenerateCode}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium text-muted-foreground">
            Участники ({members.length})
          </h2>
        </div>

        <div className="space-y-2">
          {members.map((member) => (
            <Card
              key={member.id}
              className="border-graphite-light/30 bg-card"
            >
              <CardContent className="flex items-center gap-3 p-3">
                <Avatar className="h-10 w-10 border border-graphite-light">
                  <AvatarFallback className="bg-orange-accent/10 text-xs font-medium text-orange-accent">
                    {member.profile
                      ? getInitials(member.profile)
                      : "?"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {member.profile
                      ? `${member.profile.first_name} ${member.profile.last_name ?? ""}`
                      : "Неизвестный"}
                  </p>
                  {member.profile?.username && (
                    <p className="text-xs text-muted-foreground">
                      @{member.profile.username}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-orange-accent/10 px-2.5 py-0.5 text-xs font-medium text-orange-accent">
                    {member.role === "monitor" ? "Староста" : "Студент"}
                  </span>

                  {isMonitor &&
                    member.profile?.telegram_id !== currentProfile?.telegram_id &&
                    member.role !== "monitor" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() =>
                          member.profile &&
                          handleRemove(member.profile.telegram_id)
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
