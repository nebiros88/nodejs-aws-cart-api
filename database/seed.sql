INSERT INTO users (id, name, password)
VALUES ('f3c6f72e-60bb-4ebc-af04-7706a55df71b', 'nebiros88', 'TEST_PASSWORD');

INSERT INTO carts (id, user_id, created_at, updated_at, status)
VALUES ('e1899dde-558d-4e5e-9084-06417daebabf', 'f3c6f72e-60bb-4ebc-af04-7706a55df71b', now(), now(), 'OPEN');

INSERT INTO cart_items (cart_id, product_id, count)
VALUES ('e1899dde-558d-4e5e-9084-06417daebabf', '979716c3-9e6b-4b0d-a527-6d15d6a923ef', 1);

INSERT INTO orders (id, user_id, cart_id, payment, delivery, comments, status, total)
VALUES 
  ('cd90d54e-f81c-4e8d-a2d4-26223ca3b6a6',
   'f3c6f72e-60bb-4ebc-af04-7706a55df71b', 
   'e1899dde-558d-4e5e-9084-06417daebabf',
   '{"type": "credit_card"}',
   '{"address": "2404 Sheehan Dr, Naperville, IL 60564", "name": "John"}',
   'test order',
   'OPEN',
   '19.99');