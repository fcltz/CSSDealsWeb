const supabase = require('../database/supabaseClient');

// Helper para lidar com erros de tabela inexistente de forma amigável
function handleDbError(err, res) {
  if (err.message && err.message.includes("Could not find the table 'public.profiles'")) {
    return res.status(500).json({ 
      error: 'Tabela public.profiles não encontrada no banco de dados Supabase.',
      details: 'Por favor, execute o script SQL fornecido em "database/schema.sql" no editor de SQL do painel do Supabase para criar as tabelas e triggers necessários.'
    });
  }
  return res.status(500).json({ error: err.message });
}

async function signUp(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase não está configurado no backend.' });
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const user = data.user;
    if (user) {
      const now = new Date().toISOString();
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          plan: 'free',
          alert_categories: [],
          alert_sizes: [],
          created_at: now,
          updated_at: now
        });

      if (profileError && !profileError.message.includes('duplicate key')) {
        // Se for outro erro que não seja chave duplicada (ex: tabela inexistente)
        return handleDbError(profileError, res);
      }
    }

    res.status(201).json({ 
      message: 'Cadastro realizado com sucesso! Verifique seu email se a confirmação estiver ativada.',
      user 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function signIn(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    if (!supabase) {
      return res.status(500).json({ error: 'Supabase não está configurado no backend.' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Garante que o perfil do usuário exista na tabela profiles ao fazer login
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileErr) {
      if (profileErr.code === 'PGRST116') {
        const now = new Date().toISOString();
        const { error: insertErr } = await supabase
          .from('profiles')
          .insert({ 
            id: data.user.id, 
            email: data.user.email, 
            plan: 'free',
            alert_categories: [],
            alert_sizes: [],
            created_at: now,
            updated_at: now
          });
        if (insertErr) return handleDbError(insertErr, res);
      } else {
        return handleDbError(profileErr, res);
      }
    }

    res.json({
      session: data.session,
      user: data.user
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getProfile(req, res) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        const now = new Date().toISOString();
        const { data: newProfile, error: insertErr } = await supabase
          .from('profiles')
          .insert({ 
            id: req.user.id, 
            email: req.user.email, 
            plan: 'free',
            alert_categories: [],
            alert_sizes: [],
            created_at: now,
            updated_at: now
          })
          .select()
          .single();
        if (insertErr) return handleDbError(insertErr, res);
        return res.json(newProfile);
      }
      return handleDbError(error, res);
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateDiscordId(req, res) {
  const { discord_id } = req.body;
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ discord_id, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return handleDbError(error, res);
    }

    res.json({ message: 'ID do Discord atualizado com sucesso!', profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updatePlan(req, res) {
  const { plan } = req.body;
  if (!plan) {
    return res.status(400).json({ error: 'O plano é obrigatório.' });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ plan, updated_at: new Date().toISOString() })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return handleDbError(error, res);
    }

    res.json({ message: `Plano atualizado para ${plan} com sucesso!`, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateAlertFilters(req, res) {
  const { alert_categories, alert_sizes } = req.body;
  
  if (!Array.isArray(alert_categories) || !alert_sizes || typeof alert_sizes !== 'object' || Array.isArray(alert_sizes)) {
    return res.status(400).json({ error: 'Os filtros devem ser enviados no formato correto (categories: array, sizes: object).' });
  }

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ 
        alert_categories, 
        alert_sizes, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return handleDbError(error, res);
    }

    res.json({ message: 'Filtros de alerta atualizados com sucesso!', profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  signUp,
  signIn,
  getProfile,
  updateDiscordId,
  updatePlan,
  updateAlertFilters
};
