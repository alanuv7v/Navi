import initSqlJs from "sql.js/dist/sql-wasm"

export async function create() {
        
    const SQL = await initSqlJs(
        {locateFile: file => `https://sql.js.org/dist/${file}`}
    )

    const DB = new SQL.Database();

    //create "nodes" table 
    DB.run(`
    CREATE TABLE nodes (
        id CHAR(32),
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        origin CHAR(32),
        relations TEXT
    );
    `); //id와 origin은 나중에 CHAR()로 바꾸고 길이제한 걸고 uuid로 변경


    //create "ties" table 
    DB.run(`
    CREATE TABLE ties (
        id CHAR(32),
        end0 TEXT NOT NULL,
        end1 TEXT NOT NULL
    );
    `);

    return DB
}