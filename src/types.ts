import type { Timestamp } from 'firebase/firestore';

export type AppTab = 'patrol' | 'board' | 'admin';

export interface CoordinatesData {
  lat: number;
  lng: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  updatedAt?: Timestamp | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  usernameLower: string;
  displayName: string;
  approved: boolean;
  role: 'user' | 'admin';
  avatarColor: string;
  isPatrolling: boolean;
  currentPatrolId: string | null;
  currentPatrolStartedAt?: Timestamp | null;
  lastLocation?: CoordinatesData | null;
  lastSeenAt?: Timestamp | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface PatrolRecord {
  id: string;
  userId: string;
  username: string;
  startedAt?: Timestamp | null;
  endedAt?: Timestamp | null;
  active: boolean;
  durationSeconds: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface PatrolPoint {
  id: string;
  userId: string;
  patrolId: string;
  lat: number;
  lng: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  recordedAt?: Timestamp | null;
}

export interface PlannedRoute {
  id: string;
  createdBy: string;
  username: string;
  name: string;
  points: Array<{ lat: number; lng: number }>;
  archived: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface AlertRecord {
  id: string;
  createdBy: string;
  username: string;
  message: string;
  location?: CoordinatesData | null;
  active: boolean;
  createdAt?: Timestamp | null;
  resolvedAt?: Timestamp | null;
}

export interface BoardPost {
  id: string;
  authorId: string;
  username: string;
  content: string;
  mentions: string[];
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface MentionRecord {
  id: string;
  toUid: string;
  fromUid: string;
  fromUsername: string;
  postId: string;
  createdAt?: Timestamp | null;
  read: boolean;
  readAt?: Timestamp | null;
}

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
}
