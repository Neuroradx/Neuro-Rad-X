import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminLayout from './layout';
import { onAuthStateChanged } from 'firebase/auth';

// Simulamos el comportamiento de Firebase
describe('Admin Security Guard', () => {
    it('Muestra "Acceso Denegado" si el usuario NO tiene el claim de admin', async () => {
        // 1. Simulamos que el usuario está logueado pero NO es admin
        (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
            callback({
                uid: 'user-123',
                getIdTokenResult: () => Promise.resolve({ claims: { admin: false } }),
            });
            return () => { };
        });

        render(
            <AdminLayout>
                <div data-testid="admin-content">Contenido Secreto</div>
            </AdminLayout>
        );

        // 2. Verificamos que aparezca el mensaje de bloqueo (chequeamos la clave de traducción)
        await waitFor(() => {
            expect(screen.getByText('admin.accessDenied.title')).toBeInTheDocument();
        });

        // 3. Verificamos que NO se vea el contenido secreto
        expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });

    it('Permite ver el contenido si el usuario SÍ es admin', async () => {
        // Simulamos que el usuario SÍ es admin
        (onAuthStateChanged as any).mockImplementation((auth: any, callback: any) => {
            callback({
                uid: 'admin-123',
                getIdTokenResult: () => Promise.resolve({ claims: { admin: true } }),
            });
            return () => { };
        });

        render(
            <AdminLayout>
                <div data-testid="admin-content">Contenido Secreto</div>
            </AdminLayout>
        );

        await waitFor(() => {
            expect(screen.getByTestId('admin-content')).toBeInTheDocument();
        });
    });
});
