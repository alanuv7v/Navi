import initSqlJs from "sql.js/dist/sql-wasm"
export default class Root {

    constructor (handle) {
        this.handle = handle
        this.initDB()
    }

    async initDB () {

        const SQL = await initSqlJs(
            {locateFile: file => `https://sql.js.org/dist/${file}`}
        )
    
        const file = await this.handle.getFile();
        const blob = new Blob([file], { type: file.type })
        let dbArrayBuffer = await blob.arrayBuffer()
        this.DB = new SQL.Database(new Uint8Array(dbArrayBuffer))
        return this.DB
        
    }

    
    get name () {
        return this.handle.name
    }

}

