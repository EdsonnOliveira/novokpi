'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }

      const redirectTo = searchParams.get('redirect') ?? '/dashboard';
      router.push(redirectTo);
      router.refresh();
    },
    [email, password, router, searchParams, supabase.auth],
  );

  return (
    <div className="container-xxl">
      <div className="row vh-100 d-flex justify-content-center">
        <div className="col-12 align-self-center">
          <div className="card-body">
            <div className="row">
              <div className="col-lg-4 mx-auto">
                <div className="card">
                  <div className="card-body p-0 bg-black auth-header-box rounded-top">
                    <div className="text-center p-3">
                      <Link href="/login" className="logo logo-admin">
                        <img
                          src="/dastone/images/logo-sm.png"
                          height={50}
                          alt="logo"
                          className="auth-logo"
                        />
                      </Link>
                      <h4 className="mt-3 mb-1 fw-semibold text-white fs-18">Novo KPI</h4>
                      <p className="text-muted fw-medium mb-0">Entre na sua loja</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <form className="my-4" onSubmit={handleSubmit}>
                      <div className="form-group mb-2">
                        <label className="form-label" htmlFor="email">
                          E-mail
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="password">
                          Senha
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Sua senha"
                          required
                        />
                      </div>
                      {error ? (
                        <div className="alert alert-danger py-2 mt-3 mb-0">{error}</div>
                      ) : null}
                      <div className="form-group mb-0 row">
                        <div className="col-12">
                          <div className="d-grid mt-3">
                            <button className="btn btn-primary" type="submit" disabled={loading}>
                              <i className="iconoir-log-in me-1" aria-hidden="true" />
                              {loading ? 'Entrando...' : 'Entrar'}</button>
                          </div>
                        </div>
                      </div>
                    </form>
                    <div className="text-center mb-2">
                      <p className="text-muted">
                        Primeira vez?{' '}
                        <Link href="/signup" className="text-primary ms-2">
                          Criar conta
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
