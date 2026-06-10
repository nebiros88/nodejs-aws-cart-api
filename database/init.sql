CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cart_status') THEN
        CREATE TYPE cart_status AS ENUM ('OPEN', 'ORDERED');
    END IF;
END $$;

DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS carts;

CREATE TABLE carts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL,
    created_at date NOT NULL,
    updated_at date NOT NULL,
    status cart_status NOT NULL
);

CREATE TABLE cart_items (
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL,
    count integer NOT NULL CHECK (count > 0),
    PRIMARY KEY (cart_id, product_id),
    CONSTRAINT fk_cart
        FOREIGN KEY (cart_id)
        REFERENCES carts(id)
        ON DELETE CASCADE
);

INSERT INTO carts (id, user_id, created_at, updated_at, status)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE, CURRENT_DATE, 'OPEN'),
    ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', CURRENT_DATE, CURRENT_DATE, 'ORDERED');

INSERT INTO cart_items (cart_id, product_id, count)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', 2),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', 1),
    ('22222222-2222-2222-2222-222222222222', 'bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', 5);