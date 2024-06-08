import initSqlJs from "sql.js/dist/sql-wasm"
import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from "./FileSystem"
import appSession from "../resource/appSession";

export async function create() {
        
    const SQL = await initSqlJs(
        {locateFile: file => `https://sql.js.org/dist/${file}`}
    )

    const DB = new SQL.Database();

    //create "nodes" table 
    DB.run(`
    CREATE TABLE nodes (
        id CHAR(32),
        value TEXT NOT NULL,
        links TEXT
    );
    `); //id와 origin은 나중에 CHAR()로 바꾸고 길이제한 걸고 uuid로 변경
    
    //save root NodeData to the db
    DB.run(`
    INSERT INTO nodes VALUES (
        '${uuidv4().replaceAll("-", "")}',
        '${"root"}',
        '${JSON.stringify([])}'
    );`)

    console.log(DB.exec("SELECT * FROM nodes"))

    return DB
}


export async function load(handle) {

    const SQL = await initSqlJs(
        {locateFile: file => `https://sql.js.org/dist/${file}`}
    )
    await handle.requestPermission()
    const file = await handle.getFile();
    const blob = new Blob([file], { type: file.type })
    let dbArrayBuffer = await blob.arrayBuffer()
    let DB = new SQL.Database(new Uint8Array(dbArrayBuffer))
    return DB
    
}

export async function update () {
    const data = appSession.root.DB.export(); // Get Uint8Array of database contents
    const blob = new Blob([data], { type: 'application/octet-stream' });
    return await FileSystem.writeToFile(appSession.temp.rootHandle, blob)
}
