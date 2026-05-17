"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { validateTelegramInitData } from "@/lib/telegram/init";
import type { Profile } from "@/types";

interface UpsertProfileParams {
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  initDataRaw: string;
}

export async function upsertProfile(
  params: UpsertProfileParams
): Promise<Profile> {
  const { telegram_id, username, first_name, last_name, initDataRaw } = params;

  const isValid = validateTelegramInitData(initDataRaw, process.env.BOT_TOKEN!);
  if (!isValid) {
    throw new Error("Invalid Telegram init data");
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        telegram_id,
        username,
        first_name,
        last_name,
      },
      { onConflict: "telegram_id" }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getProfile(
  telegramId: number
): Promise<Profile | null> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("telegram_id", telegramId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return data;
}

export async function updateProfileName(
  telegramId: number,
  first_name: string,
  last_name: string | null
): Promise<Profile> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .update({ first_name, last_name })
    .eq("telegram_id", telegramId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
