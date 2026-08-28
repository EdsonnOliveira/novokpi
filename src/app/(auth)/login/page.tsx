'use client';

import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Carregando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
