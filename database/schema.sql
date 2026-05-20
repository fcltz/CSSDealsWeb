-- Supabase schema for CSSDealsWeb

-- Tabela de Produtos
CREATE TABLE public.productsv1 (
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
CREATE INDEX idx_productsv1_category_id ON public.productsv1 (category_id);
CREATE INDEX idx_productsv1_created_at ON public.productsv1 (created_at);
CREATE INDEX idx_productsv1_last_seen ON public.productsv1 (last_seen);
CREATE INDEX idx_productsv1_title ON public.productsv1 USING GIN (to_tsvector('english', title));

-- Trigger para atualizar `updated_at` automaticamente
CREATE OR REPLACE FUNCTION update_productsv1_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_productsv1_updated_at
BEFORE UPDATE ON public.productsv1
FOR EACH ROW EXECUTE PROCEDURE update_productsv1_updated_at_column();
