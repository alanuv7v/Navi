import initSqlJs from "sql.js";
import { v4 as uuidv4 } from 'uuid';
import * as BrowserFileSystem from "./BrowserFileSystem"
import appSession from "../appSession";

export type SqlJsDb = {
    exec: (input: string) => Array<any>,
    export: () => Uint8Array
}

const SQL = await initSqlJs(
    //{locateFile: file => `https://sql.js.org/dist/${file}`}
    //{locateFile: file => `sqlite/${file}`}
    {locateFile: file => `${file}`} //for dist
)

export async function create(name: string): Promise<SqlJsDb> {

    const DB = new SQL.Database();

    //create "nodes" table 
    DB.run(`
    CREATE TABLE nodes (
        id CHAR(32),
        key TEXT,
        value TEXT,
        valueType TEXT,
        links TEXT
    );
    `); //id와 origin은 나중에 CHAR()로 바꾸고 길이제한 걸고 uuid로 변경
    
    //save root NodeData to the db
    DB.run(`
    INSERT INTO nodes VALUES (
        '${uuidv4().replaceAll("-", "")}',
        '${`@${name}`}',
        null,
        null,
        '${JSON.stringify([])}'
    );`)

    console.log(DB.exec("SELECT * FROM nodes"))

    return DB
}


export async function blobToDb(input) {
    
    let blob

    if (input instanceof Blob) {

        blob = input

    } else if (input instanceof FileSystemFileHandle) {  
        // @ts-expect-error
        await input?.requestPermission()
        let file = await input.getFile();
        blob = new Blob([file], { type: file.type })
        
    }

    let dbArrayBuffer = await blob.arrayBuffer()
    let DB = new SQL.Database(new Uint8Array(dbArrayBuffer))
    return DB
    
}

export async function update () {
    if (!appSession.network.DB) return false
    console.log(appSession.network.DB, appSession.network.DB.exec('select * from nodes')[0].values)
    const data = await appSession.network.DB.export(); // Get Uint8Array of database contents
    const blob = new Blob([data], { type: 'application/octet-stream' });
    return await BrowserFileSystem.writeToFile(appSession.browser.getNetworkTreeSubItem("database").handle, blob)
}
