
import * as SQLite from 'expo-sqlite';

export type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
};

let dbPromise: ReturnType<typeof SQLite.openDatabaseAsync> | null = null;

async function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('beauty-vault.db');
  }

  return dbPromise;
}

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDatabase();

  return db.getAllAsync<Product>(
    'SELECT * FROM products ORDER BY id DESC;'
  );
}

export async function addProduct(
  product: Omit<Product, 'id' | 'createdAt'>
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO products (name, brand, category, price, quantity)
     VALUES (?, ?, ?, ?, ?);`,
    product.name,
    product.brand,
    product.category,
    product.price,
    product.quantity
  );
}


export async function deleteProduct(id: number): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    'DELETE FROM products WHERE id = ?;',
    id
  );
}
