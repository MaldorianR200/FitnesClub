import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

export async function initializeDatabase(): Promise<Database> {
  if (db) return db;

  db = await open({
    filename: './fitness.db',
    driver: sqlite3.Database
  });
//   registration_date TEXT DEFAULT (datetime('now'))
  await db.exec(`

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    registration_date TEXT DEFAULT (datetime('now')),
    update_date TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT, -- №Клиента
    username TEXT NOT NULL,                   -- ФИО
    birth_date TEXT,                      -- ДатаРождения
    phone TEXT,
    email TEXT UNIQUE,
    address TEXT,
    registration_date TEXT DEFAULT (datetime('now')),
    update_date TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS managers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    position TEXT,
    registration_date TEXT DEFAULT (datetime('now')),
    update_date TEXT DEFAULT (datetime('now'))
  );


    CREATE TABLE IF NOT EXISTS trainers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      phone TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      registration_date TEXT DEFAULT (datetime('now')),
      update_date TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,                   -- НазвУслуги
      description TEXT,                      -- Описание
      price REAL NOT NULL,                   -- Цена
      trainer_id INTEGER NOT NULL,
      FOREIGN KEY (trainer_id) REFERENCES trainers(id)

    );

    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      trainer_id INTEGER NOT NULL,
      manager_id INTEGER NOT NULL,
      visit_date TEXT NOT NULL,
      FOREIGN KEY (client_id) REFERENCES clients (id),
      FOREIGN KEY (trainer_id) REFERENCES trainers (id)
    );

    CREATE TABLE IF NOT EXISTS service_payments (
      visit_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      final_price REAL NOT NULL,
      discount REAL DEFAULT 0.0,
      PRIMARY KEY (visit_id, service_id),
      FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );
  `);



  console.log('SQLite database initialized');
  return db;
}
