// Shared contract for every lane. Do not edit without asking (see PLAN.md → Shared files).

/** ISO 8601 date-time string, e.g. "2026-12-03T23:59:00Z". */
export type ISODateString = string;

export type CanvasItemType = 'homework' | 'quiz' | 'exam';

/** A student's Canvas work item, mapped from GET /api/v1/planner/items. */
export interface CanvasItem {
  id: string;
  title: string;
  courseName: string;
  type: CanvasItemType;
  dueDate: ISODateString | null;
  htmlUrl: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  major: string;
  /** 1 = freshman … 4 = senior, 5 = graduate. */
  year: 1 | 2 | 3 | 4 | 5;
  /** Course names, matching CanvasItem.courseName. */
  courses: string[];
  bio?: string;
  avatarUrl?: string;
}

/** What a session or project is about: one Canvas item or a personal topic. */
export type Topic =
  | { kind: 'canvas'; canvasItemId: string }
  | { kind: 'personal'; label: string };

export interface StudySession {
  id: string;
  hostId: string;
  title: string;
  description: string;
  topic: Topic;
  startTime: ISODateString;
  endTime: ISODateString;
  /** A campus room (e.g. "IST 1035") or a meeting link. */
  location: string;
  isVirtual: boolean;
  maxParticipants: number;
  createdAt: ISODateString;
}

export type ProjectStatus = 'open' | 'in_progress' | 'completed';

export interface Project {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  topic: Topic;
  status: ProjectStatus;
  skillsNeeded: string[];
  maxMembers: number;
  createdAt: ISODateString;
}

export type MembershipTargetType = 'session' | 'project';
export type MembershipRole = 'host' | 'member';
export type MembershipStatus = 'pending' | 'accepted' | 'declined';

/** Links a user to a study session or a project. */
export interface Membership {
  id: string;
  userId: string;
  targetType: MembershipTargetType;
  targetId: string;
  role: MembershipRole;
  status: MembershipStatus;
  joinedAt: ISODateString;
}
