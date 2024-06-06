import initSqlJs from "sql.js/dist/sql-wasm"
export default class Root {

    constructor (name, DB) {
        this.name = name
        this.DB = DB
    }

}

