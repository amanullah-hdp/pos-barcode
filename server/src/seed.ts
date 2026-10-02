import { BARCODE_PWD_ISB_PROFILE } from './defaults/shopProfile.js';
import { getDb } from './db.js';

type ProductSeed = {
  sku: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  cost_cents: number;
  price_cents: number;
  stock_qty: number;
  low_stock_threshold: number;
};

const products: ProductSeed[] = [
  {
    sku: 'PERF-001',
    barcode: '8901001001001',
    name: 'Blue Oud 50ml',
    brand: 'Armaf',
    category: 'Perfumes',
    cost_cents: 350000,
    price_cents: 550000,
    stock_qty: 12,
    low_stock_threshold: 3,
  },
  {
    sku: 'PERF-002',
    barcode: '8901001001002',
    name: 'Club de Nuit Intense 105ml',
    brand: 'Armaf',
    category: 'Perfumes',
    cost_cents: 420000,
    price_cents: 650000,
    stock_qty: 2,
    low_stock_threshold: 3,
  },
  {
    sku: 'BELT-001',
    barcode: '8901001001003',
    name: 'Leather Belt 32',
    brand: 'Generic',
    category: 'Belts',
    cost_cents: 80000,
    price_cents: 150000,
    stock_qty: 8,
    low_stock_threshold: 2,
  },
  {
    sku: 'BELT-002',
    barcode: '8901001001004',
    name: 'Reversible Belt 34',
    brand: 'Generic',
    category: 'Belts',
    cost_cents: 95000,
    price_cents: 180000,
    stock_qty: 5,
    low_stock_threshold: 2,
  },
  {
    sku: 'SHOE-001',
    barcode: '8901001001005',
    name: 'Formal Shoe UK 9',
    brand: 'Bata',
    category: 'Shoes',
    cost_cents: 450000,
    price_cents: 750000,
    stock_qty: 4,
    low_stock_threshold: 2,
  },
  {
    sku: 'SHOE-002',
    barcode: '8901001001006',
    name: 'Casual Sneaker UK 10',
    brand: 'Servis',
    category: 'Shoes',
    cost_cents: 380000,
    price_cents: 620000,
    stock_qty: 6,
    low_stock_threshold: 2,
  },
  {
    sku: 'TEE-001',
    barcode: '8901001001007',
    name: 'Cotton Tee M',
    brand: 'Nike',
    category: 'Clothes',
    cost_cents: 120000,
    price_cents: 250000,
    stock_qty: 20,
    low_stock_threshold: 5,
  },
  {
    sku: 'TEE-002',
    barcode: '8901001001008',
    name: 'Cotton Tee L',
    brand: 'Nike',
    category: 'Clothes',
    cost_cents: 120000,
    price_cents: 250000,
    stock_qty: 15,
    low_stock_threshold: 5,
  },
  {
    sku: 'JEAN-001',
    barcode: '8901001001009',
    name: 'Denim Jeans 32',
    brand: 'Levis',
    category: 'Clothes',
    cost_cents: 280000,
    price_cents: 450000,
    stock_qty: 7,
    low_stock_threshold: 3,
  },
  {
    sku: 'WATCH-001',
    barcode: '8901001001010',
    name: 'Analog Watch',
    brand: 'Casio',
    category: 'Accessories',
    cost_cents: 350000,
    price_cents: 550000,
    stock_qty: 3,
    low_stock_threshold: 2,
  },
  { sku: 'PERF-003', barcode: '8901001001011', name: 'Silver Oud 100ml', brand: 'Rasasi', category: 'Perfumes', cost_cents: 280000, price_cents: 420000, stock_qty: 10, low_stock_threshold: 3 },
  { sku: 'PERF-004', barcode: '8901001001012', name: 'Amber Musk 50ml', brand: 'Armaf', category: 'Perfumes', cost_cents: 300000, price_cents: 480000, stock_qty: 8, low_stock_threshold: 2 },
  { sku: 'PERF-005', barcode: '8901001001013', name: 'Oud Wood Intense', brand: 'Lattafa', category: 'Perfumes', cost_cents: 250000, price_cents: 390000, stock_qty: 14, low_stock_threshold: 4 },
  { sku: 'BELT-003', barcode: '8901001001014', name: 'Canvas Belt 30', brand: 'Generic', category: 'Belts', cost_cents: 60000, price_cents: 120000, stock_qty: 12, low_stock_threshold: 3 },
  { sku: 'BELT-004', barcode: '8901001001015', name: 'Dress Belt 36', brand: 'Generic', category: 'Belts', cost_cents: 90000, price_cents: 165000, stock_qty: 9, low_stock_threshold: 2 },
  { sku: 'SHOE-003', barcode: '8901001001016', name: 'Loafer UK 8', brand: 'Bata', category: 'Shoes', cost_cents: 520000, price_cents: 820000, stock_qty: 5, low_stock_threshold: 2 },
  { sku: 'SHOE-004', barcode: '8901001001017', name: 'Sports Runner 42', brand: 'Servis', category: 'Shoes', cost_cents: 400000, price_cents: 680000, stock_qty: 7, low_stock_threshold: 2 },
  { sku: 'SHOE-005', barcode: '8901001001018', name: 'Sandals 41', brand: 'Servis', category: 'Shoes', cost_cents: 220000, price_cents: 350000, stock_qty: 11, low_stock_threshold: 3 },
  { sku: 'TEE-003', barcode: '8901001001019', name: 'Polo Shirt M', brand: 'Adidas', category: 'Clothes', cost_cents: 180000, price_cents: 320000, stock_qty: 18, low_stock_threshold: 5 },
  { sku: 'TEE-004', barcode: '8901001001020', name: 'Polo Shirt L', brand: 'Adidas', category: 'Clothes', cost_cents: 180000, price_cents: 320000, stock_qty: 16, low_stock_threshold: 5 },
  { sku: 'JEAN-002', barcode: '8901001001021', name: 'Denim Jeans 34', brand: 'Levis', category: 'Clothes', cost_cents: 290000, price_cents: 470000, stock_qty: 8, low_stock_threshold: 3 },
  { sku: 'HOOD-001', barcode: '8901001001022', name: 'Zip Hoodie M', brand: 'H&M', category: 'Clothes', cost_cents: 220000, price_cents: 390000, stock_qty: 10, low_stock_threshold: 3 },
  { sku: 'HOOD-002', barcode: '8901001001023', name: 'Zip Hoodie L', brand: 'H&M', category: 'Clothes', cost_cents: 220000, price_cents: 390000, stock_qty: 9, low_stock_threshold: 3 },
  { sku: 'BAG-001', barcode: '8901001001024', name: 'Crossbody Bag', brand: 'Michael Kors', category: 'Bags', cost_cents: 850000, price_cents: 1450000, stock_qty: 4, low_stock_threshold: 1 },
  { sku: 'BAG-002', barcode: '8901001001025', name: 'Tote Bag Medium', brand: 'Zara', category: 'Bags', cost_cents: 350000, price_cents: 580000, stock_qty: 6, low_stock_threshold: 2 },
  { sku: 'ACC-001', barcode: '8901001001026', name: 'Sunglasses Classic', brand: 'Ray-Ban', category: 'Accessories', cost_cents: 450000, price_cents: 720000, stock_qty: 5, low_stock_threshold: 2 },
  { sku: 'ACC-002', barcode: '8901001001027', name: 'Leather Wallet', brand: 'Generic', category: 'Accessories', cost_cents: 150000, price_cents: 280000, stock_qty: 15, low_stock_threshold: 4 },
  { sku: 'ACC-003', barcode: '8901001001028', name: 'Premium Socks 3pk', brand: 'Generic', category: 'Accessories', cost_cents: 45000, price_cents: 85000, stock_qty: 30, low_stock_threshold: 8 },
  { sku: 'CAP-001', barcode: '8901001001029', name: 'Embroidered Cap', brand: 'New Era', category: 'Accessories', cost_cents: 120000, price_cents: 220000, stock_qty: 12, low_stock_threshold: 3 },
  { sku: 'PERF-006', barcode: '8901001001030', name: 'Rose Oud 75ml', brand: 'Al Haramain', category: 'Perfumes', cost_cents: 380000, price_cents: 590000, stock_qty: 6, low_stock_threshold: 2 },
  { sku: 'WATCH-002', barcode: '8901001001031', name: 'Digital Sports Watch', brand: 'Casio', category: 'Watches', cost_cents: 280000, price_cents: 420000, stock_qty: 7, low_stock_threshold: 2 },
  { sku: 'WATCH-003', barcode: '8901001001032', name: 'Dress Watch Silver', brand: 'Citizen', category: 'Watches', cost_cents: 520000, price_cents: 780000, stock_qty: 4, low_stock_threshold: 1 },
  { sku: 'JEW-001', barcode: '8901001001033', name: 'Sterling Ring Size 8', brand: 'Generic', category: 'Jewelry', cost_cents: 180000, price_cents: 320000, stock_qty: 6, low_stock_threshold: 2 },
  { sku: 'JEW-002', barcode: '8901001001034', name: 'Pearl Earrings', brand: 'Generic', category: 'Jewelry', cost_cents: 95000, price_cents: 175000, stock_qty: 10, low_stock_threshold: 3 },
  { sku: 'JEW-003', barcode: '8901001001035', name: 'Gold Plated Bracelet', brand: 'Generic', category: 'Jewelry', cost_cents: 120000, price_cents: 220000, stock_qty: 8, low_stock_threshold: 2 },
  { sku: 'KIDS-001', barcode: '8901001001036', name: 'Kids Tee Age 6-7', brand: 'H&M', category: 'Kids Wear', cost_cents: 80000, price_cents: 150000, stock_qty: 14, low_stock_threshold: 4 },
  { sku: 'KIDS-002', barcode: '8901001001037', name: 'Kids Jeans Age 8-9', brand: 'Levis', category: 'Kids Wear', cost_cents: 140000, price_cents: 260000, stock_qty: 9, low_stock_threshold: 3 },
  { sku: 'KIDS-003', barcode: '8901001001038', name: 'Kids Sneaker UK 2', brand: 'Servis', category: 'Kids Wear', cost_cents: 220000, price_cents: 380000, stock_qty: 6, low_stock_threshold: 2 },
  { sku: 'OUT-001', barcode: '8901001001039', name: 'Bomber Jacket M', brand: 'Zara', category: 'Outerwear', cost_cents: 350000, price_cents: 580000, stock_qty: 5, low_stock_threshold: 2 },
  { sku: 'OUT-002', barcode: '8901001001040', name: 'Wool Coat L', brand: 'H&M', category: 'Outerwear', cost_cents: 480000, price_cents: 790000, stock_qty: 3, low_stock_threshold: 1 },
  { sku: 'OUT-003', barcode: '8901001001041', name: 'Puffer Vest XL', brand: 'North Face', category: 'Outerwear', cost_cents: 420000, price_cents: 690000, stock_qty: 4, low_stock_threshold: 1 },
  { sku: 'SPORT-001', barcode: '8901001001042', name: 'Training Shorts M', brand: 'Nike', category: 'Sportswear', cost_cents: 110000, price_cents: 210000, stock_qty: 16, low_stock_threshold: 4 },
  { sku: 'SPORT-002', barcode: '8901001001043', name: 'Gym Track Suit M', brand: 'Adidas', category: 'Sportswear', cost_cents: 240000, price_cents: 420000, stock_qty: 8, low_stock_threshold: 2 },
  { sku: 'SPORT-003', barcode: '8901001001044', name: 'Running Tee L', brand: 'Puma', category: 'Sportswear', cost_cents: 130000, price_cents: 240000, stock_qty: 12, low_stock_threshold: 3 },
  { sku: 'EYE-001', barcode: '8901001001045', name: 'Aviator Sunglasses', brand: 'Ray-Ban', category: 'Eyewear', cost_cents: 380000, price_cents: 620000, stock_qty: 5, low_stock_threshold: 2 },
  { sku: 'EYE-002', barcode: '8901001001046', name: 'Reading Glasses +2.0', brand: 'Generic', category: 'Eyewear', cost_cents: 45000, price_cents: 95000, stock_qty: 20, low_stock_threshold: 5 },
  { sku: 'GIFT-001', barcode: '8901001001047', name: 'Perfume Gift Set 3pc', brand: 'Armaf', category: 'Gift Sets', cost_cents: 550000, price_cents: 890000, stock_qty: 5, low_stock_threshold: 2 },
  { sku: 'GIFT-002', barcode: '8901001001048', name: 'Belt & Wallet Combo', brand: 'Generic', category: 'Gift Sets', cost_cents: 180000, price_cents: 320000, stock_qty: 7, low_stock_threshold: 2 },
  { sku: 'SCARF-001', barcode: '8901001001049', name: 'Pashmina Shawl', brand: 'Generic', category: 'Scarves', cost_cents: 160000, price_cents: 290000, stock_qty: 11, low_stock_threshold: 3 },
  { sku: 'SCARF-002', barcode: '8901001001050', name: 'Silk Scarf Print', brand: 'Zara', category: 'Scarves', cost_cents: 95000, price_cents: 180000, stock_qty: 9, low_stock_threshold: 2 },
  { sku: 'PERF-007', barcode: '8901001001051', name: 'Attar Roll-On 12ml', brand: 'Al Haramain', category: 'Perfumes', cost_cents: 65000, price_cents: 120000, stock_qty: 22, low_stock_threshold: 6 },
  { sku: 'BAG-003', barcode: '8901001001052', name: 'Backpack Laptop 15"', brand: 'North Face', category: 'Bags', cost_cents: 420000, price_cents: 680000, stock_qty: 5, low_stock_threshold: 2 },
  { sku: 'BELT-005', barcode: '8901001001053', name: 'Braided Belt 32', brand: 'Generic', category: 'Belts', cost_cents: 70000, price_cents: 135000, stock_qty: 10, low_stock_threshold: 3 },
  { sku: 'SHOE-006', barcode: '8901001001054', name: 'Chelsea Boot UK 9', brand: 'Bata', category: 'Shoes', cost_cents: 580000, price_cents: 920000, stock_qty: 3, low_stock_threshold: 1 },
  { sku: 'TEE-005', barcode: '8901001001055', name: 'Linen Shirt M', brand: 'Zara', category: 'Clothes', cost_cents: 200000, price_cents: 360000, stock_qty: 7, low_stock_threshold: 2 },
  { sku: 'PERF-008', barcode: '8901001001056', name: 'Hayaati Black 100ml', brand: 'Lattafa', category: 'Perfumes', cost_cents: 320000, price_cents: 510000, stock_qty: 9, low_stock_threshold: 3 },
  { sku: 'PERF-009', barcode: '8901001001057', name: 'Baccarat Rouge 60ml', brand: 'Generic', category: 'Perfumes', cost_cents: 290000, price_cents: 460000, stock_qty: 7, low_stock_threshold: 2 },
  { sku: 'SHOE-007', barcode: '8901001001058', name: 'Slip-On UK 10', brand: 'Servis', category: 'Shoes', cost_cents: 260000, price_cents: 410000, stock_qty: 8, low_stock_threshold: 2 },
  { sku: 'SHOE-008', barcode: '8901001001059', name: 'High Top UK 11', brand: 'Nike', category: 'Shoes', cost_cents: 480000, price_cents: 760000, stock_qty: 4, low_stock_threshold: 1 },
  { sku: 'BAG-004', barcode: '8901001001060', name: 'Clutch Evening', brand: 'Michael Kors', category: 'Bags', cost_cents: 620000, price_cents: 980000, stock_qty: 3, low_stock_threshold: 1 },
  { sku: 'BELT-006', barcode: '8901001001061', name: 'Suede Belt 38', brand: 'Generic', category: 'Belts', cost_cents: 110000, price_cents: 195000, stock_qty: 6, low_stock_threshold: 2 },
  { sku: 'TEE-006', barcode: '8901001001062', name: 'Graphic Tee XL', brand: 'Nike', category: 'Clothes', cost_cents: 140000, price_cents: 270000, stock_qty: 13, low_stock_threshold: 4 },
  { sku: 'JEAN-003', barcode: '8901001001063', name: 'Slim Jeans 36', brand: 'Levis', category: 'Clothes', cost_cents: 300000, price_cents: 490000, stock_qty: 6, low_stock_threshold: 2 },
  { sku: 'OUT-004', barcode: '8901001001064', name: 'Denim Jacket M', brand: 'Levis', category: 'Outerwear', cost_cents: 380000, price_cents: 620000, stock_qty: 5, low_stock_threshold: 2 },
  { sku: 'SPORT-004', barcode: '8901001001065', name: 'Yoga Leggings M', brand: 'Adidas', category: 'Sportswear', cost_cents: 160000, price_cents: 290000, stock_qty: 10, low_stock_threshold: 3 },
  { sku: 'KIDS-004', barcode: '8901001001066', name: 'Kids Hoodie Age 10', brand: 'H&M', category: 'Kids Wear', cost_cents: 130000, price_cents: 230000, stock_qty: 8, low_stock_threshold: 2 },
  { sku: 'WATCH-004', barcode: '8901001001067', name: 'Smart Band Pro', brand: 'Xiaomi', category: 'Watches', cost_cents: 180000, price_cents: 320000, stock_qty: 11, low_stock_threshold: 3 },
  { sku: 'JEW-004', barcode: '8901001001068', name: 'CZ Pendant Set', brand: 'Generic', category: 'Jewelry', cost_cents: 220000, price_cents: 380000, stock_qty: 5, low_stock_threshold: 2 },
  { sku: 'ACC-004', barcode: '8901001001069', name: 'Leather Gloves L', brand: 'Generic', category: 'Accessories', cost_cents: 85000, price_cents: 160000, stock_qty: 7, low_stock_threshold: 2 },
  { sku: 'ACC-005', barcode: '8901001001070', name: 'Tie & Pocket Set', brand: 'Generic', category: 'Accessories', cost_cents: 75000, price_cents: 145000, stock_qty: 9, low_stock_threshold: 2 },
  { sku: 'GIFT-003', barcode: '8901001001071', name: 'Skincare Gift Box', brand: 'Generic', category: 'Gift Sets', cost_cents: 240000, price_cents: 420000, stock_qty: 4, low_stock_threshold: 1 },
  { sku: 'SCARF-003', barcode: '8901001001072', name: 'Wool Muffler', brand: 'Generic', category: 'Scarves', cost_cents: 110000, price_cents: 210000, stock_qty: 10, low_stock_threshold: 3 },
  { sku: 'EYE-003', barcode: '8901001001073', name: 'Blue Light Glasses', brand: 'Generic', category: 'Eyewear', cost_cents: 65000, price_cents: 130000, stock_qty: 14, low_stock_threshold: 4 },
  { sku: 'FORM-001', barcode: '8901001001074', name: 'Blazer 40R Navy', brand: 'Zara', category: 'Formal Wear', cost_cents: 550000, price_cents: 890000, stock_qty: 3, low_stock_threshold: 1 },
  { sku: 'FORM-002', barcode: '8901001001075', name: 'Dress Shirt 15.5', brand: 'H&M', category: 'Formal Wear', cost_cents: 170000, price_cents: 310000, stock_qty: 8, low_stock_threshold: 2 },
];

const customers = [
  { name: 'Ahmed Khan', phone: '03001234567', email: 'ahmed@example.com' },
  { name: 'Sara Ali', phone: '03211234567', email: null },
  { name: 'Walk-in Regular', phone: '03331234567', email: null },
];

function brandId(db: ReturnType<typeof getDb>, name: string): number {
  const row = db.prepare('SELECT id FROM brands WHERE name = ?').get(name) as { id: number } | undefined;
  if (row) return row.id;
  return Number(db.prepare('INSERT INTO brands (name) VALUES (?)').run(name).lastInsertRowid);
}

function categoryId(db: ReturnType<typeof getDb>, name: string): number {
  const row = db.prepare('SELECT id FROM categories WHERE name = ?').get(name) as { id: number } | undefined;
  if (row) return row.id;
  return Number(db.prepare('INSERT INTO categories (name) VALUES (?)').run(name).lastInsertRowid);
}

function productIdBySku(db: ReturnType<typeof getDb>, sku: string): number | null {
  const row = db.prepare('SELECT id FROM products WHERE sku = ?').get(sku) as { id: number } | undefined;
  return row?.id ?? null;
}

export function seedDemo() {
  const db = getDb();
  const force =
    process.env.BARCODE_POS_SEED_CONFIRM === '1' || process.argv.includes('--force');
  const existingSales = (db.prepare('SELECT COUNT(*) AS c FROM sales').get() as { c: number }).c;
  if (existingSales > 0 && !force) {
    throw new Error(
      'Refusing to seed: database already has sales. Set BARCODE_POS_SEED_CONFIRM=1 or pass --force to wipe demo data.',
    );
  }

  db.transaction(() => {
    db.prepare('DELETE FROM sale_lines').run();
    db.prepare('DELETE FROM sales').run();
    db.prepare('DELETE FROM day_closes').run();
    db.prepare('UPDATE settings SET day_closed_date = NULL WHERE id = 1').run();

    const p = BARCODE_PWD_ISB_PROFILE;

    db.prepare(
      `UPDATE settings SET
        shop_name = ?,
        address = ?,
        phone = ?,
        receipt_footer = ?,
        receipt_brand = ?,
        till_no = ?,
        staff_id = ?,
        cashier_name = ?,
        receipt_terms = ?,
        feedback_whatsapp = ?,
        receipt_powered_by = ?
       WHERE id = 1`,
    ).run(
      p.shop_name,
      p.address,
      p.phone,
      p.receipt_footer,
      p.receipt_brand,
      p.till_no,
      p.staff_id,
      p.cashier_name,
      p.receipt_terms,
      p.feedback_whatsapp,
      p.receipt_powered_by,
    );

    const upsertProduct = db.prepare(
      `INSERT INTO products (sku, barcode, name, brand_id, category_id, cost_cents, price_cents, stock_qty, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(sku) DO UPDATE SET
         barcode = excluded.barcode,
         name = excluded.name,
         brand_id = excluded.brand_id,
         category_id = excluded.category_id,
         cost_cents = excluded.cost_cents,
         price_cents = excluded.price_cents,
         stock_qty = excluded.stock_qty,
         low_stock_threshold = excluded.low_stock_threshold,
         updated_at = datetime('now')`,
    );

    for (const p of products) {
      upsertProduct.run(
        p.sku,
        p.barcode,
        p.name,
        brandId(db, p.brand),
        categoryId(db, p.category),
        p.cost_cents,
        p.price_cents,
        p.stock_qty,
        p.low_stock_threshold,
      );
    }

    db.prepare('DELETE FROM customers').run();
    const insertCustomer = db.prepare('INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)');
    const customerIds: number[] = [];
    for (const c of customers) {
      customerIds.push(Number(insertCustomer.run(c.name, c.phone, c.email).lastInsertRowid));
    }

    let receipt = Number(
      (db.prepare("SELECT value FROM meta WHERE key = 'receipt_seq'").get() as { value: string }).value,
    );

    const insertSale = db.prepare(
      `INSERT INTO sales (receipt_number, customer_id, payment_method, payment_reference, total_cents, created_at)
       VALUES (?, ?, ?, ?, ?, datetime('now', ?))`,
    );
    const insertLine = db.prepare(
      `INSERT INTO sale_lines (sale_id, product_id, label, qty, unit_price_cents, line_total_cents, is_open_price)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
    );

    const sampleSales = [
      {
        customer_id: customerIds[0],
        payment_method: 'cash',
        payment_reference: null,
        offset: '-2 hours',
        lines: [
          { sku: 'PERF-001', qty: 1 },
          { sku: 'BELT-001', qty: 1 },
        ],
      },
      {
        customer_id: null,
        payment_method: 'card',
        payment_reference: null,
        offset: '-1 hours',
        lines: [{ sku: 'TEE-001', qty: 2 }],
      },
      {
        customer_id: customerIds[1],
        payment_method: 'wallet',
        payment_reference: 'JC-998877',
        offset: '-30 minutes',
        lines: [{ sku: 'SHOE-001', qty: 1 }],
      },
    ];

    for (const sale of sampleSales) {
      receipt += 1;
      let total = 0;
      const lineData: { product_id: number; label: string; qty: number; unit: number; total: number }[] = [];
      for (const line of sale.lines) {
        const prod = products.find((p) => p.sku === line.sku)!;
        const pid = productIdBySku(db, line.sku)!;
        const lineTotal = prod.price_cents * line.qty;
        total += lineTotal;
        lineData.push({
          product_id: pid,
          label: prod.name,
          qty: line.qty,
          unit: prod.price_cents,
          total: lineTotal,
        });
        db.prepare('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?').run(line.qty, pid);
      }

      const saleId = Number(
        insertSale.run(
          receipt,
          sale.customer_id,
          sale.payment_method,
          sale.payment_reference,
          total,
          sale.offset,
        ).lastInsertRowid,
      );

      for (const ld of lineData) {
        insertLine.run(saleId, ld.product_id, ld.label, ld.qty, ld.unit, ld.total);
      }
    }

    db.prepare("UPDATE meta SET value = ? WHERE key = 'receipt_seq'").run(String(receipt + 1));
  })();

  const counts = {
    products: (db.prepare('SELECT COUNT(*) AS c FROM products').get() as { c: number }).c,
    customers: (db.prepare('SELECT COUNT(*) AS c FROM customers').get() as { c: number }).c,
    sales: (db.prepare('SELECT COUNT(*) AS c FROM sales').get() as { c: number }).c,
  };

  return counts;
}

const isMain = process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js');
if (isMain) {
  const counts = seedDemo();
  console.log('Demo data seeded:', counts);
  console.log('Try barcodes 8901001001001–8901001001075 on Register.');
  console.log('PERF-002 is low stock (2 left, threshold 3).');
}
