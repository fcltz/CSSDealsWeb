import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Check, Sparkles, Shield, Zap, Clock } from 'lucide-react';

const PLANS_DATA = [
  {
    id: 'vip',
    name: 'VIP Pro',
    price: '0',
    currency: 'R$',
    period: '/mês',
    description: 'O plano mais robusto para profissionais e revendedores.',
    icon: Sparkles,
    features: [
      'Tudo do plano Padrão',
      'Alertas individuais ultra velozes',
      'Opções de filtros para tipos de alertas',
      'Acesso a produtos exclusivos antes de todos',
      'Suporte VIP no Discord 24/7'
    ],
    buttonText: 'Assinar VIP Pro',
    featured: true
  },
  {
    id: 'standard',
    name: 'Padrão',
    price: '0',
    currency: 'R$',
    period: '/mês',
    description: 'Alertas individuais instantâneos direto no seu Discord!',
    icon: Zap,
    features: [
      'Tudo do plano Gratuito',
      'Alertas individuais em tempo real',
      'Notificação por DM do Discord',
      'Configuração simples pelo ID do Discord',
      'Suporte prioritário por email'
    ],
    buttonText: 'Assinar Padrão',
    featured: false
  },
  {
    id: 'free',
    name: 'Gratuito',
    price: '0',
    currency: 'R$',
    period: '/mês',
    description: 'Acesso básico aos produtos no marketplace via painel web.',
    icon: Shield,
    features: [
      'Produtos novos: atraso de 30 min.',
      'Acesso ao marketplace web',
      'Filtros de categoria e preços',
      'Pesquisa de produtos',
      'Visualização das imagens originais'
    ],
    buttonText: 'Plano Atual',
    featured: false
  }
];

export default function Plans() {
  const { token, profile, subscribePlan, authLoading } = useStore();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const currentPlan = profile?.plan || 'free';

  const handleSelectPlan = async (planId) => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (planId === currentPlan) {
      return;
    }

    setSuccessMessage('');
    setErrorMessage('');

    const res = await subscribePlan(planId);
    if (res.success) {
      setSuccessMessage(`Parabéns! Você assinou o plano ${planId.toUpperCase()} com sucesso!`);
      // Rola para o topo para ver o banner de sucesso
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMessage(res.error || 'Erro ao processar assinatura.');
    }
  };

  return (
    <div className="page-content">
      <div className="plans-wrapper">
        <div className="plans-header">
          <h2>Planos & Assinaturas</h2>
          <p>Escolha o melhor plano para receber ofertas e monitorar novidades no Discord em tempo real</p>
        </div>

        {successMessage && (
          <div className="success-banner" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="error-banner" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
            {errorMessage}
          </div>
        )}

        <div className="plans-grid">
          {PLANS_DATA.map((plan) => {
            const IconComponent = plan.icon;
            const isCurrent = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`plan-card ${plan.featured ? 'featured' : ''} ${isCurrent ? 'active-plan' : ''}`}
              >
                {plan.featured && <span className="plan-badge">Popular</span>}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span className="plan-name">{plan.name}</span>
                  <IconComponent
                    size={28}
                    color={plan.featured ? 'var(--accent-primary)' : 'var(--text-secondary)'}
                  />
                </div>

                <div className="plan-price-container">
                  <span className="plan-currency">{plan.currency}</span>
                  <span className="plan-price">{plan.price}</span>
                  <span className="plan-period">{plan.period}</span>
                </div>

                <p className="plan-desc">{plan.description}</p>

                <ul className="plan-features-list">
                  {plan.features.map((feature, idx) => {
                    const isDelay = feature.includes('atraso');
                    return (
                      <li
                        key={idx}
                        className="plan-feature-item"
                        style={isDelay ? { color: '#f59e0b', fontWeight: '600' } : {}}
                      >
                        {isDelay ? (
                          <Clock size={16} className="plan-feature-icon" style={{ color: '#f59e0b' }} />
                        ) : (
                          <Check size={16} className="plan-feature-icon" />
                        )}
                        <span>{feature}</span>
                      </li>
                    );
                  })}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={authLoading}
                  className={`plan-action-btn ${isCurrent ? 'active' : ''} ${plan.featured ? 'featured-btn' : ''}`}
                  style={{
                    backgroundColor: isCurrent ? 'var(--accent-primary)' : '',
                    color: isCurrent ? 'white' : '',
                    borderColor: isCurrent ? 'var(--accent-primary)' : '',
                    cursor: isCurrent ? 'default' : 'pointer'
                  }}
                >
                  {isCurrent ? 'Seu Plano Ativo' : token ? plan.buttonText : 'Entrar para Assinar'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
