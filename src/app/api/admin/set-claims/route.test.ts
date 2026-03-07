import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/admin/set-claims/route';

vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
    getUser: vi.fn(),
    setCustomUserClaims: vi.fn(),
  },
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
      })),
    })),
  },
}));

vi.mock('@/lib/admin-emails.json', () => ({ default: ['admin@test.com'] }));

import { adminAuth, adminDb } from '@/lib/firebase-admin';

describe('POST /api/admin/set-claims', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminDb.collection).mockReturnValue({
      doc: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ exists: false }),
        set: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      })),
    } as any);
  });

  it('returns 401 when Authorization header is missing', async () => {
    const res = await POST(new Request('http://localhost/api/admin/set-claims', {
      method: 'POST',
      headers: {},
    }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toContain('Authorization');
  });

  it('returns 401 when Bearer token is missing', async () => {
    const res = await POST(new Request('http://localhost/api/admin/set-claims', {
      method: 'POST',
      headers: { Authorization: 'Invalid' },
    }));
    expect(res.status).toBe(401);
  });

  it('returns 403 when email is not in allowlist', async () => {
    vi.mocked(adminAuth.verifyIdToken!).mockResolvedValue({ uid: 'user-1' } as any);
    vi.mocked(adminAuth.getUser!).mockResolvedValue({
      email: 'other@test.com',
      displayName: 'Other',
    } as any);

    const res = await POST(new Request('http://localhost/api/admin/set-claims', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
    }));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toMatch(/allowlist|denied/i);
  });

  it('returns 200 and sets claims when email is in allowlist', async () => {
    vi.mocked(adminAuth.verifyIdToken!).mockResolvedValue({ uid: 'admin-1' } as any);
    vi.mocked(adminAuth.getUser!).mockResolvedValue({
      email: 'admin@test.com',
      displayName: 'Admin',
    } as any);
    vi.mocked(adminAuth.setCustomUserClaims!).mockResolvedValue(undefined);

    const res = await POST(new Request('http://localhost/api/admin/set-claims', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.email).toBe('admin@test.com');
    expect(adminAuth.setCustomUserClaims).toHaveBeenCalledWith('admin-1', { admin: true });
  });
});
