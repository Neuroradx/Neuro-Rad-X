import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LoginForm } from '@/components/auth/login-form';

const mockPush = vi.fn();
const mockSignIn = vi.fn();
const mockGetDoc = vi.fn();
const mockToast = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignIn(...args),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
}));

vi.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock('@/hooks/use-translation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/actions/notification-actions', () => ({
  fetchUserNotifications: vi.fn().mockResolvedValue({ success: true, notifications: [] }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignIn.mockResolvedValue({
      user: {
        uid: 'user-1',
        getIdToken: () => Promise.resolve('token'),
        getIdTokenResult: () => Promise.resolve({ claims: { admin: false } }),
        signOut: vi.fn(),
      },
    });
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ status: 'approved', role: 'user' }),
    });
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => ({ isAdmin: false }) });
  });

  it('renders login form with email and password fields', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/loginForm\.emailLabel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/loginForm\.passwordLabel/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /loginForm\.submitButton/i })).toBeInTheDocument();
  });

  it('calls signInWithEmailAndPassword on submit with entered email and password', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/loginForm\.emailLabel/i);
    const passwordInput = screen.getByLabelText(/loginForm\.passwordLabel/i);
    const submitBtn = screen.getByRole('button', { name: /loginForm\.submitButton/i });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
    expect(mockSignIn.mock.calls[0][1]).toBe('test@example.com');
    expect(mockSignIn.mock.calls[0][2]).toBe('password123');
  });
});

