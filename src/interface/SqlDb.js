import initSqlJs from "sql.js";
import { v4 as uuidv4 } from 'uuid';
import * as FileSystem from "./BrowserFileSystem"
import appSession from "../appSession";

const SQL = await initSqlJs(
    //{locateFile: file => `https://sql.js.org/dist/${file}`}
    //{locateFile: file => `sqlite/${file}`}
    {locateFile: file => `${file}`} //for dist
)

export async function create(name) {

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
        '${`@${name}`}',
        '${JSON.stringify([])}'
    );`)

    console.log(DB.exec("SELECT * FROM nodes"))

    return DB
}


export async function load(input) {
    
    let blob

    if (input instanceof Blob) {

        blob = input

    } else if (input instanceof FileSystemFileHandle) {  

        await input.requestPermission()
        let file = await input.getFile();
        blob = new Blob([file], { type: file.type })
        
    }

    let dbArrayBuffer = await blob.arrayBuffer()
    let DB = new SQL.Database(new Uint8Array(dbArrayBuffer))
    return DB
    
}

export async function update () {
    const data = appSession.network.DB.export(); // Get Uint8Array of database contents
    const blob = new Blob([data], { type: 'application/octet-stream' });
    return await FileSystem.writeToFile(appSession.temp.network.handle, blob)
}
