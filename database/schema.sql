-- Supabase schema for CSSDealsWeb

-- Tabela de Produtos
CREATE TABLE public.productsv2 (
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
CREATE INDEX idx_productsv2_category_id ON public.productsv2 (category_id);
CREATE INDEX idx_productsv2_created_at ON public.productsv2 (created_at);
CREATE INDEX idx_productsv2_last_seen ON public.productsv2 (last_seen);
CREATE INDEX idx_productsv2_title ON public.productsv2 USING GIN (to_tsvector('english', title));

-- Trigger para atualizar `updated_at` automaticamente
CREATE OR REPLACE FUNCTION update_productsv2_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_productsv2_updated_at
BEFORE UPDATE ON public.productsv2
FOR EACH ROW EXECUTE PROCEDURE update_productsv2_updated_at_column();
