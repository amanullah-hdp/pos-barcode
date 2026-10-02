CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  shop_name TEXT NOT NULL DEFAULT 'Barcode',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  logo_path TEXT,
  receipt_footer TEXT NOT NULL DEFAULT 'Thank you for shopping!',
  payment_methods_json TEXT NOT NULL DEFAULT '{"cash":true,"card":true,"wallet":true,"bank_transfer":true}',
  db_path TEXT,
  day_closed_date TEXT,
  receipt_brand TEXT NOT NULL DEFAULT 'BARCODE',
  till_no TEXT NOT NULL DEFAULT '1',
  staff_id TEXT NOT NULL DEFAULT '1',
  cashier_name TEXT NOT NULL DEFAULT 'Cashier',
  receipt_terms TEXT NOT NULL DEFAULT '',
  feedback_whatsapp TEXT NOT NULL DEFAULT '',
  receipt_powered_by TEXT NOT NULL DEFAULT 'www.cubexretail.com'
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  parent_id INTEGER REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS staff (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  staff_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT,
  name TEXT NOT NULL,
  brand_id INTEGER REFERENCES brands(id),
  category_id INTEGER REFERENCES categories(id),
  cost_cents INTEGER NOT NULL DEFAULT 0,
  price_cents INTEGER NOT NULL DEFAULT 0,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  receipt_number INTEGER NOT NULL UNIQUE,
  customer_id INTEGER REFERENCES customers(id),
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  total_cents INTEGER NOT NULL,
  shop_discount_cents INTEGER NOT NULL DEFAULT 0,
  staff_id INTEGER REFERENCES staff(id),
  staff_code TEXT,
  staff_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

CREATE TABLE IF NOT EXISTS sale_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  label TEXT NOT NULL,
  qty INTEGER NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  line_total_cents INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  is_open_price INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS day_closes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_date TEXT NOT NULL UNIQUE,
  expected_cash_cents INTEGER NOT NULL,
  counted_cash_cents INTEGER NOT NULL,
  variance_cents INTEGER NOT NULL,
  notes TEXT,
  closed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
