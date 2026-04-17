import { Timestamp } from 'firebase/firestore';

export const DEFAULT_CENTER: [number, number] = [
  Number(import.meta.env.VITE_MAP_DEFAULT_LAT ?? -26.2041),
  Number(import.meta.env.VITE_MAP_DEFAULT_LNG ?? 28.0473),
];

export const DEFAULT_ZOOM = Number(import.meta.env.VITE_MAP_DEFAULT_ZOOM ?? 12);

export const AVATAR_COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#14b8a6',
  '#f97316',
  '#ef4444',
  '#22c55e',
  '#eab308',
  '#06b6d4',
];

interface MentionableUserLike {
  uid: string;
  displayName?: string;
  username?: string;
}

interface MentionMatch {
  start: number;
  end: number;
  user: MentionableUserLike;
}

export function pickAvatarColor(seed: string) {
  const total = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[total % AVATAR_COLORS.length];
}

export function normalizeDisplayName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function cleanDisplayName(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

export function getUserDisplayName(user: Pick<MentionableUserLike, 'displayName' | 'username'>) {
  return cleanDisplayName(user.displayName || user.username || 'Unknown user');
}

function isMentionBoundary(character?: string) {
  return !character || /[\s.,!?;:()[\]{}"'“”‘’/\-]/.test(character);
}

function getMentionMatches(content: string, users: MentionableUserLike[]) {
  const lowerContent = content.toLowerCase();
  const candidates = [...users]
    .map((user) => ({ user, mentionText: `@${getUserDisplayName(user)}` }))
    .sort((a, b) => b.mentionText.length - a.mentionText.length);

  const matches: MentionMatch[] = [];

  for (let index = 0; index < content.length; index += 1) {
    if (content[index] !== '@') continue;

    for (const candidate of candidates) {
      const lowerMention = candidate.mentionText.toLowerCase();
      if (!lowerContent.startsWith(lowerMention, index)) continue;

      const previous = content[index - 1];
      const next = content[index + candidate.mentionText.length];
      if (index > 0 && !isMentionBoundary(previous)) continue;
      if (!isMentionBoundary(next)) continue;

      matches.push({
        start: index,
        end: index + candidate.mentionText.length,
        user: candidate.user,
      });

      index += candidate.mentionText.length - 1;
      break;
    }
  }

  return matches;
}

export function extractMentionedUsers(content: string, users: MentionableUserLike[]) {
  const seen = new Set<string>();
  return getMentionMatches(content, users)
    .map((match) => match.user)
    .filter((user) => {
      if (seen.has(user.uid)) return false;
      seen.add(user.uid);
      return true;
    });
}

export function formatDuration(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, '0'))
    .join(':');
}

export function formatTimeAgo(timestamp?: Timestamp | null) {
  if (!timestamp) {
    return 'just now';
  }

  const seconds = Math.floor((Date.now() - timestamp.toDate().getTime()) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function highlightMentions(content: string, users: MentionableUserLike[] = []) {
  const matches = getMentionMatches(content, users);
  if (!matches.length) {
    return `<span>${escapeHtml(content)}</span>`;
  }

  let cursor = 0;
  let html = '';

  for (const match of matches) {
    html += `<span>${escapeHtml(content.slice(cursor, match.start))}</span>`;
    html += `<span class="mention">${escapeHtml(content.slice(match.start, match.end))}</span>`;
    cursor = match.end;
  }

  html += `<span>${escapeHtml(content.slice(cursor))}</span>`;
  return html;
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function haversineMeters(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
) {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLat = toRadians(end.lat - start.lat);
  const deltaLng = toRadians(end.lng - start.lng);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

export function googleMapsDirectionsUrl(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export function getLastPatrollerUpdate(user: {
  lastLocation?: { updatedAt?: Timestamp | null } | null;
  lastSeenAt?: Timestamp | null;
}) {
  return user.lastLocation?.updatedAt ?? user.lastSeenAt ?? null;
}

export function getPatrollerTrackingStatus(
  user: {
    lastLocation?: { updatedAt?: Timestamp | null } | null;
    lastSeenAt?: Timestamp | null;
  },
  options?: { staleAfterSeconds?: number }
) {
  const staleAfterSeconds = options?.staleAfterSeconds ?? 90;
  const lastUpdate = getLastPatrollerUpdate(user);

  if (!lastUpdate) {
    return {
      paused: false,
      ageSeconds: null,
      label: 'Live',
      detail: 'Waiting for first location update',
    };
  }

  const ageSeconds = Math.max(0, Math.floor((Date.now() - lastUpdate.toDate().getTime()) / 1000));
  const paused = ageSeconds >= staleAfterSeconds;

  return {
    paused,
    ageSeconds,
    label: paused ? 'Tracking paused' : 'Live',
    detail: paused ? `Last update ${formatTimeAgo(lastUpdate)}` : 'Receiving location updates',
  };
}
