export type UserRole = "student" | "monitor" | "teacher";
export type MemberRole = "monitor" | "student";
export type AttendanceStatus = "present" | "absent" | "late";

export interface Profile {
  id: number;
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface GroupMember {
  id: number;
  group_id: number;
  profile_id: number;
  role: MemberRole;
  created_at: string;
  profiles?: Profile;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface InitData {
  user?: TelegramUser;
  authDate?: Date;
  hash?: string;
  startParam?: string;
}
