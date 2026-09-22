const path = require('path');
const fs = require('fs');
const { createRequire } = require('module');

const isSea = typeof process.versions.sea !== 'undefined';

const appDir = isSea ? path.dirname(process.execPath) : path.resolve(__dirname,'../..');

let Database;

if(isSea){ //is in compiled
    const requireExternal = createRequire(
        path.join(appDir, 'package.json')
    );

    Database = requireExternal('better-sqlite3');

}else {

    Database = require('better-sqlite3');

}

//const appDir = path.dirname(process.execPath);
const dataDir = path.join(appDir, 'data');
//const dataDir = path.join(process.cwd(), 'data');

if(!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir, {
        recursive: true
    });
}

const dbPath = path.join(dataDir, 'driver.db');

console.log('Base de datos', dbPath);

const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        message_id TEXT UNIQUE NOT NULL,

        type TEXT NOT NULL,

        payload TEXT NOT NULL,

        status TEXT NOT NULL DEFAULT 'PENDING',

        attempts INTEGER NOT NULL DEFAULT 0,
        
        last_error TEXT,
        
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

        sent_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_messages_status
    ON messages(status, id);

    CREATE TABLE IF NOT EXISTS orders (
        num_order TEXT PRIMARY KEY,

        identification TEXT NOT NULL,

        name_1 TEXT NOT NULL,

        name_2 TEXT,

        lastname_1 TEXT,

        lastname_2 TEXT,

        date_of_birth TEXT,

        service TEXT,

        -- gender TEXT NOT NULL CHECK (gender IN ('M','F','O')),

        gender TEXT,
        
        status TEXT,
        
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP

    );

    CREATE INDEX IF NOT EXISTS idx_orders_num_order
    ON orders(num_order);

    CREATE TABLE IF NOT EXISTS order_test (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        num_order TEXT NOT NULL,

        test_code TEXT NOT NULL,

        sample TEXT ,

        code_universal TEXT,

        code_analyzer TEXT,

        consecutive INTEGER NOT NULL,

        create_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_order_test_order
    ON order_test(num_order);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_order_test_unique
    ON order_test(num_order,test_code);

    CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_order TEXT NOT NULL,
        id_test TEXT NOT NULL,
        unit TEXT,
        result TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        analyzer TEXT,
        sample TEXT,
        consecutive INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'PENDING'
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_result_unique
    ON results(id_order,id_test);

     CREATE TABLE IF NOT EXISTS analyzers (
        id_analyzer TEXT PRIMARY KEY,
        name_analyzer TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        port NUMBER NOT NULL,
        -- connection_type TEXT NOT NULL CHECK (connection_type IN ('Serial','TCP','Files')),
        connection_type TEXT,
        file_server TEXT,
        protocol TEXT,
        driver TEXT
    );

    `);


    console.log('SQLLite iniciado correctamente')

module.exports = db;