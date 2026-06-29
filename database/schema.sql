-- Supabase schema for CSSDealsWeb

-- NOTA: Para salvar/retornar datas no fuso horário GMT-3 (America/Sao_Paulo),
-- execute os comandos abaixo no editor de SQL do Supabase:
-- ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';
-- ALTER ROLE authenticator SET timezone TO 'America/Sao_Paulo';
-- ALTER ROLE postgres SET timezone TO 'America/Sao_Paulo';
-- ALTER ROLE service_role SET timezone TO 'America/Sao_Paulo';

-- Tabela de Produtos
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    code TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category_id TEXT NOT NULL,
    category_name TEXT,
    source_link TEXT,
    product_url TEXT,
    cssbuy_order_id TEXT,
    cssbuy_order_no TEXT,
    creator_id TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    skus JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

-- Índices solicitados para performance
CREATE INDEX idx_products_category_id ON public.products (category_id);
CREATE INDEX idx_products_created_at ON public.products (created_at);
CREATE INDEX idx_products_last_seen ON public.products (last_seen);
CREATE INDEX idx_products_title ON public.products USING GIN (to_tsvector('english', title));

-- Trigger para atualizar `updated_at` automaticamente
CREATE OR REPLACE FUNCTION update_products_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE PROCEDURE update_products_updated_at_column();
