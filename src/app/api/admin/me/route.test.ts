import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/admin/me/route';

vi.mock('@/lib/firebase-admin', () => ({
  adminAuth: {
    verifyIdToken: vi.fn(),
  },
  adminDb: null,
}));

vi.mock('@/lib/auth-helpers', () => ({
  verifyAdminRole: vi.fn(),
}));

import { adminAuth } from '@/lib/firebase-admin';
import { verifyAdminRole } from '@/lib/auth-helpers';

describe('GET /api/admin/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with isAdmin: false when no token', async () => {
    const res = await GET(new Request('http://localhost/api/admin/me'));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isAdmin).toBe(false);
    expect(adminAuth?.verifyIdToken).not.toHaveBeenCalled();
  });

  it('returns 200 with isAdmin: false when token is invalid', async () => {
    vi.mocked(adminAuth!.verifyIdToken).mockRejectedValue(new Error('Invalid token'));

    const res = await GET(new Request('http://localhost/api/admin/me', {
      headers: { Authorization: 'Bearer bad-token' },
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isAdmin).toBe(false);
  });

  it('returns 200 with isAdmin: true when token valid and user is admin', async () => {
    vi.mocked(adminAuth!.verifyIdToken).mockResolvedValue({ uid: 'admin-1' } as any);
    vi.mocked(verifyAdminRole).mockResolvedValue(true);

    const res = await GET(new Request('http://localhost/api/admin/me', {
      headers: { Authorization: 'Bearer valid-token' },
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isAdmin).toBe(true);
    expect(verifyAdminRole).toHaveBeenCalledWith('admin-1');
  });

  it('returns 200 with isAdmin: false when token valid but user is not admin', async () => {
    vi.mocked(adminAuth!.verifyIdToken).mockResolvedValue({ uid: 'user-1' } as any);
    vi.mocked(verifyAdminRole).mockResolvedValue(false);

    const res = await GET(new Request('http://localhost/api/admin/me', {
      headers: { Authorization: 'Bearer valid-token' },
    }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.isAdmin).toBe(false);
  });
});
