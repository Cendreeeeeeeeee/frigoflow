-- Seed some basic price data for common items
INSERT INTO pricebook (label, price, store) VALUES
('Pain de mie', 2.50, 'Coop'),
('Lait 1L', 1.80, 'Migros'),
('Œufs (6 pcs)', 3.20, 'Denner'),
('Bananes (1kg)', 2.90, 'Aldi'),
('Pommes (1kg)', 4.50, 'Lidl'),
('Pâtes 500g', 1.95, 'Coop'),
('Riz 1kg', 3.80, 'Migros'),
('Poulet (1kg)', 12.90, 'Denner'),
('Tomates (500g)', 3.50, 'Aldi'),
('Fromage râpé', 4.80, 'Lidl')
ON CONFLICT DO NOTHING;
