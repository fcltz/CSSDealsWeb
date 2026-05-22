import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { register, authLoading, authError } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMsg('');

    if (!email || !password || !confirmPassword) {
      setLocalError('Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setLocalError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    const res = await register(email, password);
    if (res.success) {
      setSuccessMsg('Cadastro efetuado! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">CSSDeals</h2>
        <p className="auth-subtitle">Crie sua conta para receber alertas e acessar os planos</p>

        {localError && (
          <div className="error-banner">
            {localError}
          </div>
        )}

        {authError && !localError && (
          <div className="error-banner">
            {authError}
          </div>
        )}

        {successMsg && (
          <div className="success-banner">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Senha</label>
            <input
              type="password"
              className="form-control"
              placeholder="Minimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirmar Senha</label>
            <input
              type="password"
              className="form-control"
              placeholder="Repita sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={authLoading || !!successMsg}>
            {authLoading ? (
              'Carregando...'
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                <UserPlus size={18} /> Cadastrar
              </span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta? 
          <Link to="/login" className="auth-link">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
