// src/app/auth/register/page.tsx
import { Suspense } from 'react';
import { RegistrationForm } from "@/components/auth/registration-form";

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <RegistrationForm />
        </Suspense>
    );
}