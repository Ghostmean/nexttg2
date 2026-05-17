"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { Group, GroupMember, Profile } from "@/types";
import { randomBytes } from "crypto";

function generateInviteCode(): string {
  return randomBytes(4).toString("hex");
}

export async function createGroup(params: {
  name: string;
  description: string | null;
  telegram_id: number;
}): Promise<Group> {
  const supabase = createAdminClient();

  const inviteCode = generateInviteCode();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("telegram_id", params.telegram_id)
    .single();

  if (!profile) throw new Error("Profile not found");

  const { data: group, error: groupError } = await supabase
    .from("groups_table")
    .insert({
      name: params.name,
      description: params.description,
      invite_code: inviteCode,
      created_by: params.telegram_id,
    })
    .select()
    .single();

  if (groupError) throw new Error(groupError.message);

  const { error: memberError } = await supabase.from("group_members").insert({
    group_id: group.id,
    profile_id: profile.id,
    role: "monitor",
  });

  if (memberError) throw new Error(memberError.message);

  return group;
}

export async function getUserGroups(telegramId: number): Promise<Group[]> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("telegram_id", telegramId)
    .single();

  if (!profile) return [];

  const { data: memberRecords } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("profile_id", profile.id);

  if (!memberRecords || memberRecords.length === 0) return [];

  const groupIds = memberRecords.map((m) => m.group_id);

  const { data: groups } = await supabase
    .from("groups_table")
    .select("*")
    .in("id", groupIds)
    .order("created_at", { ascending: false });

  if (!groups) return [];

  const groupsWithCount = await Promise.all(
    groups.map(async (g) => {
      const { count } = await supabase
        .from("group_members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", g.id);

      return { ...g, member_count: count ?? 0 };
    })
  );

  return groupsWithCount;
}

export async function getGroup(groupId: number): Promise<{
  group: Group;
  members: (GroupMember & { profile: Profile | null })[];
} | null> {
  const supabase = createAdminClient();

  const { data: group } = await supabase
    .from("groups_table")
    .select("*")
    .eq("id", groupId)
    .single();

  if (!group) return null;

  const { data: members } = await supabase
    .from("group_members")
    .select("*, profiles(*)")
    .eq("group_id", groupId)
    .order("created_at", { ascending: true });

  return {
    group,
    members: (members || []).map((m) => ({
      ...m,
      profile: m.profiles ?? null,
    })),
  };
}

export async function joinGroupByCode(params: {
  inviteCode: string;
  telegram_id: number;
}): Promise<Group> {
  const supabase = createAdminClient();

  const { data: group } = await supabase
    .from("groups_table")
    .select("*")
    .eq("invite_code", params.inviteCode)
    .single();

  if (!group) throw new Error("Группа с таким кодом не найдена");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("telegram_id", params.telegram_id)
    .single();

  if (!profile) throw new Error("Profile not found");

  const { data: existing } = await supabase
    .from("group_members")
    .select("id")
    .eq("group_id", group.id)
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (existing) throw new Error("Вы уже в этой группе");

  const { error } = await supabase.from("group_members").insert({
    group_id: group.id,
    profile_id: profile.id,
    role: "student",
  });

  if (error) throw new Error(error.message);

  return group;
}

export async function removeMember(params: {
  groupId: number;
  memberId: number;
  requesterTelegramId: number;
}): Promise<void> {
  const supabase = createAdminClient();

  const { data: requesterProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("telegram_id", params.requesterTelegramId)
    .single();

  if (!requesterProfile) throw new Error("Profile not found");

  const { data: requesterMember } = await supabase
    .from("group_members")
    .select("role")
    .eq("group_id", params.groupId)
    .eq("profile_id", requesterProfile.id)
    .single();

  if (!requesterMember || requesterMember.role !== "monitor") {
    throw new Error("Только староста может удалять участников");
  }

  const { error } = await supabase
    .from("group_members")
    .delete()
    .eq("id", params.memberId)
    .eq("group_id", params.groupId);

  if (error) throw new Error(error.message);
}

export async function regenerateInviteCode(params: {
  groupId: number;
  telegram_id: number;
}): Promise<string> {
  const supabase = createAdminClient();

  const { data: group } = await supabase
    .from("groups_table")
    .select("created_by")
    .eq("id", params.groupId)
    .single();

  if (!group || group.created_by !== params.telegram_id) {
    throw new Error("Только создатель может обновить код");
  }

  const newCode = generateInviteCode();

  const { error } = await supabase
    .from("groups_table")
    .update({ invite_code: newCode })
    .eq("id", params.groupId);

  if (error) throw new Error(error.message);

  return newCode;
}
