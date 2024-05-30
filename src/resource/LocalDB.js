import initSqlJs from "sql.js/dist/sql-wasm"

const SQL = await initSqlJs(
    {locateFile: file => `https://sql.js.org/dist/${file}`}
)

const DB = new SQL.Database();

export default DB