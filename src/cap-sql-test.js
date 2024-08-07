import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
const db = await CapacitorSQLite.createConnection("myDB", false, "no-encryption", 1);
await db.open();

// Example: Creating a table
await db.execute(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT
  )
`);

// Example: Inserting data
await db.run(`INSERT INTO users (name, email) VALUES (?, ?)`, ["John Doe", "john@example.com"]);

// Example: Querying data
const res = await db.query(`SELECT * FROM users`);
console.log(res.values);

await db.close();

try {
    await db.open();
    // Perform database operations
    await db.close();
} catch (e) {
    console.error("Error: ", e);
}


/* 
!!
@capacitor-community/sqlite 리포를 보니, 웹에서는 sql.js로 작동하는듯 하다.
즉 이 래퍼 모듈을 쓰면 내가 새로 래퍼 모듈을 만들거나, 웹 환경에 맞춘 코드를 재작성할 필요가 없다.
근데 gpt에게 물어보니 indexedDB 대신 on-mem으로 하려면 추가 셋업이 필요하다.

아닌가...

씨펄 알고보니 jeep-sqlite라는 lib을 사용하는데, 얘는 IndexedDB에 저장하고 sql.js를 인터페이스?로 사용하는 것 같다.
결국 IndexedDB를 쓰는거다.
알아보니 IndexedDB가 하드의 50%까지도 쓸 수 있다고는 하는데... 나름 온-디스크고...
그래도 이걸 원한게 아닌데.

래퍼 클래스를 만들까, sql.js를 포기할까?

*/
