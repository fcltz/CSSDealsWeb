import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useStore from '../store/useStore';
import { Send, User, HelpCircle, AlertCircle, CheckCircle2, Sliders, Filter } from 'lucide-react';

const CATEGORIES = [
  { id: '32', name: 'Hoodie' },
  { id: '40', name: 'Socks' },
  { id: '45', name: 'Suitcase' },
  { id: '11', name: 'Shoes' },
  { id: '33', name: 'Down Jacket' },
  { id: '12', name: 'Coat' },
  { id: '14', name: 'T-shirts' },
  { id: '15', name: 'Pants' },
  { id: '26', name: 'Hat & Bags' },
  { id: '34', name: 'Suit' },
  { id: '35', name: 'Long Sleeve' },
  { id: '39', name: 'Accessories' },
  { id: '27', name: 'Belt & Glasses' },
  { id: '30', name: 'Gloves & Scarf' },
  { id: '31', name: 'Underwear & Sleepwear' },
  { id: '44', name: 'Perfume' },
  { id: '37', name: 'Toy' },
  { id: '16', name: 'Accessories (Misc)' },
  { id: '36', name: 'Sports Goods' },
  { id: '38', name: 'Phone Case' },
  { id: '20', name: 'Watches' },
  { id: '21', name: 'Cell Phone' },
  { id: '22', name: 'Earphone' },
  { id: '23', name: 'Computer Accessories' },
  { id: '24', name: 'Audio & Video' }
];

// Mapeamento de tamanhos para cada categoria
const CATEGORY_SIZES = {
  // Calçados (Shoes)
  '11': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
  // Vestuários (Clothing)
  '12': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'], // Coat
  '14': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'], // T-shirts
  '15': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'], // Pants
  '31': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'], // Underwear & Sleepwear
  '32': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'], // Hoodie
  '33': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'], // Down Jacket
  '34': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'], // Suit
  '35': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL']  // Long Sleeve
};

// Sort alphabetically
const sortedCategories = [...CATEGORIES].sort((a, b) => a.name.localeCompare(b.name));

export default function Profile() {
  const { token, user, profile, fetchProfile, updateDiscordId, updateAlertFilters, authLoading, authError } = useStore();
  const navigate = useNavigate();
  
  const [discordId, setDiscordId] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenDropdownId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [token, navigate]);

  useEffect(() => {
    if (profile) {
      setDiscordId(profile.discord_id || '');
      setSelectedCategories(Array.isArray(profile.alert_categories) ? profile.alert_categories.map(String) : []);
      
      const alertSizesObj = (profile.alert_sizes && typeof profile.alert_sizes === 'object' && !Array.isArray(profile.alert_sizes))
        ? profile.alert_sizes
        : {};
      
      const cleanedSizes = {};
      Object.keys(alertSizesObj).forEach(key => {
        cleanedSizes[String(key)] = Array.isArray(alertSizesObj[key]) ? alertSizesObj[key].map(String) : [];
      });
      setSelectedSizes(cleanedSizes);
    }
  }, [profile]);

  const handleSaveDiscord = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setLocalError('');

    if (discordId.trim() !== '' && !/^\d+$/.test(discordId.trim())) {
      setLocalError('O ID do Discord deve conter apenas números.');
      return;
    }

    const res = await updateDiscordId(discordId.trim());
    if (res.success) {
      setSuccessMessage('Configurações do Discord salvas com sucesso!');
    } else {
      setLocalError(res.error || 'Erro ao salvar ID do Discord.');
    }
  };

  const handleSaveFilters = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setLocalError('');

    // Limpa chaves vazias ou desmarcadas do alert_sizes
    const cleanedSizes = {};
    Object.keys(selectedSizes).forEach(catId => {
      if (selectedCategories.includes(String(catId)) && Array.isArray(selectedSizes[catId]) && selectedSizes[catId].length > 0) {
        cleanedSizes[catId] = selectedSizes[catId];
      }
    });

    const res = await updateAlertFilters(selectedCategories, cleanedSizes);
    if (res.success) {
      setSuccessMessage('Filtros de alerta atualizados com sucesso!');
    } else {
      setLocalError(res.error || 'Erro ao salvar filtros.');
    }
  };

  const handleToggleCategory = (catId) => {
    setSelectedCategories(prev => 
      prev.includes(catId) 
        ? prev.filter(id => id !== catId)
        : [...prev, catId]
    );
  };

  const handleToggleSize = (catId, size) => {
    setSelectedSizes(prev => {
      const currentSizes = Array.isArray(prev[catId]) ? prev[catId] : [];
      const updatedSizes = currentSizes.includes(size)
        ? currentSizes.filter(s => s !== size)
        : [...currentSizes, size];
      
      return {
        ...prev,
        [catId]: updatedSizes
      };
    });
  };

  if (!user || !profile) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  const hasAlerts = profile.plan !== 'free';

  return (
    <div className="page-content">
      <div className="profile-wrapper">
        <h2 className="page-title">Configurações da Conta</h2>

        {successMessage && (
          <div className="success-banner">
            {successMessage}
          </div>
        )}

        {(localError || authError) && (
          <div className="error-banner">
            {localError || authError}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user.email ? user.email[0].toUpperCase() : <User />}
            </div>
            <div className="profile-title-container">
              <h3>{user.email}</h3>
              <p>ID do usuário: {user.id}</p>
            </div>
          </div>

          {/* Plano Atual */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 className="profile-section-title">Status da Assinatura</h4>
            <div className="plan-summary-box">
              <div className="plan-info-detail">
                <h4>Plano {profile.plan}</h4>
                <p>
                  {profile.plan === 'free' 
                    ? 'Acesso limitado ao painel web. Atualize para receber alertas.'
                    : 'Acesso completo com alertas no Discord ativados!'}
                </p>
              </div>
              <Link to="/plans" className="change-plan-link">
                Alterar Plano
              </Link>
            </div>
          </div>

                    {/* Status dos Alertas */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 className="profile-section-title">Status dos Alertas por Discord</h4>
            {hasAlerts ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} /> Seu plano permite receber alertas individuais por Direct Message (DM)!
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#eab308', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600 }}>
                <AlertCircle size={18} /> Seu plano (Gratuito) não inclui alertas individuais por DM. <Link to="/plans" style={{ textDecoration: 'underline', color: 'var(--accent-primary)' }}>Assine um plano pago</Link> para receber alertas.
              </div>
            )}
          </div>

          {/* Acesso ao Servidor VIP do Discord */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h4 className="profile-section-title">Acesso ao Servidor do Discord</h4>
            {hasAlerts ? (
              <div style={{ 
                padding: '1.25rem', 
                backgroundColor: 'rgba(88, 101, 242, 0.1)', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid rgba(88, 101, 242, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#5865f2' }}>
                    Servidor VIP Liberado!
                  </h5>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Como membro premium, você tem acesso ao nosso canal exclusivo com feeds de ofertas instantâneos.
                  </p>
                </div>
                <a 
                  href="https://discord.gg/cssdeals" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="discord-btn"
                  style={{ textDecoration: 'none', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  Entrar no Servidor
                </a>
              </div>
            ) : (
              <div style={{ 
                padding: '1.25rem', 
                backgroundColor: 'var(--bg-tertiary)', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border-color)',
                opacity: 0.75,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Servidor VIP (Bloqueado)
                  </h5>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                    O acesso ao Servidor VIP do Discord é restrito para assinantes de planos pagos.
                  </p>
                </div>
                <button 
                  disabled
                  style={{ 
                    padding: '0.5rem 1rem', 
                    fontSize: '0.85rem', 
                    backgroundColor: 'var(--border-color)', 
                    color: 'var(--text-tertiary)', 
                    border: 'none', 
                    borderRadius: 'var(--radius-md)', 
                    cursor: 'not-allowed' 
                  }}
                >
                  Bloqueado
                </button>
              </div>
            )}
          </div>

          {/* Configuração Discord */}
          <div style={{ marginBottom: '2.5rem', opacity: hasAlerts ? 1 : 0.65 }}>
            <h4 className="profile-section-title">Receber Alertas de Produtos no Discord</h4>
            <div className="discord-config-box">
              <p className="discord-desc">
                Digite o seu <strong>ID de Usuário do Discord</strong> para que o nosso bot envie alertas de ofertas e novos cadastros diretamente no seu chat privado.
              </p>

              <form onSubmit={handleSaveDiscord}>
                <div className="discord-input-container">
                  <input
                    type="text"
                    disabled={!hasAlerts}
                    className="form-control discord-input"
                    placeholder={hasAlerts ? "Ex: 345678912345678912" : "Bloqueado - Faça upgrade para liberar"}
                    value={discordId}
                    onChange={(e) => setDiscordId(e.target.value)}
                  />
                  <button type="submit" className="discord-btn" disabled={authLoading || !hasAlerts}>
                    <Send size={16} /> Salvar ID
                  </button>
                </div>
              </form>

              <div className="discord-instructions">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  <HelpCircle size={14} /> Como conseguir o ID do seu Perfil no Discord:
                </div>
                <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <li>Abra o Discord e acesse as <strong>Configurações do Usuário</strong> (ícone de engrenagem).</li>
                  <li>Vá em <strong>Avançado</strong> (no menu lateral esquerdo) and ative o <strong>Modo Desenvolvedor</strong>.</li>
                  <li>Feche as configurações. Clique com o botão direito no seu avatar/nome de usuário em qualquer servidor ou chat e selecione <strong>Copiar ID do Usuário</strong>.</li>
                  <li>Cole o número copiado no campo acima e salve as configurações.</li>
                </ol>
                <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>
                  Nota: Certifique-se de que sua conta de Discord permite receber Mensagens Diretas (DMs) de membros de servidores em comum.
                </div>
              </div>
            </div>
          </div>

          {/* Filtros de Alerta */}
          <div>
            <h4 className="profile-section-title">Filtros personalizados de alertas</h4>
            <div className="discord-config-box" style={{ opacity: hasAlerts ? 1 : 0.65 }}>
              <p className="discord-desc">
                Selecione as categorias que deseja monitorar. Se alguma categoria tiver tamanhos específicos (como calçados ou roupas), você poderá marcar quais tamanhos deseja receber. Se nenhum tamanho for marcado, você receberá todos.
              </p>

              <form onSubmit={handleSaveFilters}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', fontWeight: 700 }}>
                    <Sliders size={14} /> Categorias Monitoradas
                  </label>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
                    gap: '1rem',
                    marginTop: '0.75rem'
                  }}>
                    {sortedCategories.map(cat => {
                      const hasSizes = CATEGORY_SIZES[cat.id] !== undefined;
                      const isChecked = selectedCategories.includes(String(cat.id));
                      const catSizes = CATEGORY_SIZES[cat.id] || [];
                      
                      return (
                        <div 
                          key={cat.id} 
                          onClick={() => hasAlerts && handleToggleCategory(String(cat.id))}
                          className="category-filter-card"
                          style={{ 
                            padding: '1rem', 
                            border: `1.5px solid ${isChecked ? 'var(--accent-primary)' : 'var(--border-color)'}`, 
                            borderRadius: 'var(--radius-md)', 
                            backgroundColor: isChecked ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-secondary)',
                            boxShadow: isChecked ? '0 0 10px rgba(59, 130, 246, 0.1)' : 'none',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.75rem',
                            cursor: hasAlerts ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span 
                              style={{ 
                                fontSize: '0.875rem',
                                fontWeight: isChecked ? 600 : 500,
                                color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)',
                                userSelect: 'none'
                              }}
                            >
                              {cat.name}
                            </span>
                            
                            {/* Checkbox customizado */}
                            <div 
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '4px',
                                border: `1.5px solid ${isChecked ? 'var(--accent-primary)' : 'var(--text-tertiary)'}`,
                                backgroundColor: isChecked ? 'var(--accent-primary)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {isChecked && (
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1.5 4L4 6.5L8.5 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </div>
                          </div>

                          {/* Seletor de Tamanhos específico para esta categoria se marcada */}
                          {isChecked && hasSizes && (
                            <div 
                              onClick={(e) => e.stopPropagation()} // Impede o clique nos tamanhos de desmarcar a categoria
                              style={{ 
                                position: 'relative',
                                marginTop: '0.25rem',
                                width: '100%'
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(openDropdownId === cat.id ? null : cat.id);
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                  padding: '0.5rem 0.75rem',
                                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: 'var(--radius-md)',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                <span>
                                  {(selectedSizes[cat.id] || []).length > 0
                                    ? `${(selectedSizes[cat.id] || []).length} selecionado(s)`
                                    : 'Todos os tamanhos'}
                                </span>
                                <svg 
                                  width="10" 
                                  height="6" 
                                  viewBox="0 0 10 6" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{
                                    transform: openDropdownId === cat.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s ease'
                                  }}
                                >
                                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>

                              {openDropdownId === cat.id && (
                                <div style={{ 
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  right: 0,
                                  backgroundColor: 'var(--bg-secondary)',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid var(--border-color)',
                                  boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                                  padding: '0.65rem',
                                  zIndex: 100,
                                  marginTop: '0.25rem',
                                  maxHeight: '160px',
                                  overflowY: 'auto'
                                }}>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                    {catSizes.map(size => {
                                      const sizeList = selectedSizes[cat.id] || [];
                                      const isSizeChecked = sizeList.includes(size);
                                      
                                      return (
                                        <label 
                                          key={size}
                                          style={{ 
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            padding: '0.2rem 0.5rem',
                                            backgroundColor: isSizeChecked ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                            color: isSizeChecked ? 'white' : 'var(--text-primary)',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            cursor: hasAlerts ? 'pointer' : 'not-allowed',
                                            border: '1px solid var(--border-color)',
                                            fontWeight: isSizeChecked ? 600 : 400,
                                            userSelect: 'none'
                                          }}
                                        >
                                          <input 
                                            type="checkbox"
                                            style={{ display: 'none' }}
                                            disabled={!hasAlerts}
                                            checked={isSizeChecked}
                                            onChange={() => handleToggleSize(cat.id, size)}
                                          />
                                          {size}
                                        </label>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="discord-btn" 
                  disabled={authLoading || !hasAlerts}
                  style={{ 
                    backgroundColor: hasAlerts ? '#10b981' : 'var(--text-tertiary)',
                    cursor: hasAlerts ? 'pointer' : 'not-allowed',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Filter size={16} /> Salvar Filtros
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
