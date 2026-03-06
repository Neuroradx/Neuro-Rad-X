import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock de Firebase (para no conectarse a la nube real en los tests)
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    onAuthStateChanged: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

vi.mock('@/hooks/use-translation', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        language: 'es',
    }),
}));
