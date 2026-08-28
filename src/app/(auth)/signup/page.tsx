'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLoading(true);
      setError(null);

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      router.push('/onboarding');
      router.refresh();
    },
    [email, fullName, password, router, supabase.auth],
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
                      <h4 className="mt-3 mb-1 fw-semibold text-white fs-18">Criar conta</h4>
                      <p className="text-muted fw-medium mb-0">Comece a usar o Novo KPI</p>
                    </div>
                  </div>
                  <div className="card-body">
                    <form className="my-4" onSubmit={handleSubmit}>
                      <div className="form-group mb-2">
                        <label className="form-label" htmlFor="fullName">
                          Nome completo
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
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
                          minLength={6}
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
                              {loading ? 'Criando...' : 'Criar conta'}
                              <i className="iconoir-user-plus ms-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                    <div className="text-center mb-2">
                      <p className="text-muted">
                        Já tem conta?{' '}
                        <Link href="/login" className="text-primary ms-2">
                          Entrar
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
