// This is the final product.

// This file must import components from other modules
// and merely display and organize them to show the final output to the cilent, not creating one.



//test

// Dynamically import the WebAssembly module

/* import sql from "./tech/sqlite/sqlite3"
console.log(sql)
window.sql = await sql()
//const { default: initSqlJs } = await import("./tech/sqlite/sqlite3.wasm?init"); */

import sqlJs from "sql.js"
window.sqlJs = sqlJs

const SQL = await initSqlJs(
    {locateFile: file => `https://sql.js.org/dist/${file}`}
)
const db = new SQL.Database();
window.SQL = SQL
window.db = db

// Execute a single SQL string that contains multiple statements
let sqlstr = "CREATE TABLE hello (a int, b char); \
INSERT INTO hello VALUES (0, 'hello'); \
INSERT INTO hello VALUES (1, 'world');";
db.run(sqlstr); // Run the query without returning anything

// Prepare an sql statement
const statement = db.prepare("SELECT * FROM hello WHERE a=:aval AND b=:bval");

// Bind values to the parameters and fetch the results of the query
const result = statement.getAsObject({':aval' : 1, ':bval' : 'world'});
console.log(result); // Will print {a:1, b:'world'}


db.exec("CREATE TABLE nodes (id int, key char, value char)");
db.exec("INSERT INTO nodes VALUES (0, 'Alan', 'This is me');");
db.exec("SELECT * FROM nodes");


/* 

window.initSqlJs({
    locateFile: filename => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${filename}`
}).then(function(SQL){
    // Create a database
    var db = new SQL.Database();

    // Create a table
    db.run("CREATE TABLE test (col1, col2);");

    // Insert two rows: (1,111) and (2,222)
    db.run("INSERT INTO test VALUES (?,?), (?,?)", [1, 111, 2, 222]);

    // Prepare an SQL statement
    var stmt = db.prepare("SELECT * FROM test WHERE col1 BETWEEN ? AND ?");
    stmt.bind([1, 2]);

    // Fetch the results of the query
    while (stmt.step()) {
        var row = stmt.getAsObject();
        console.log("Row: ", row);
    }
    stmt.free(); // Free the resources allocated to this statement
}).catch(function(err){
    console.error("Failed to initialize SQL.js:", err);
});
 */

//test end

import van from "vanjs-core"

import * as UserActions from "./natural/UserActions"
import init from "./natural/init"
import CommandsIO from "./tech/CommandsIO"

//below is for debugging


import DB from "./resource/DB"
import DOM from "./resource/DOM"
import appSession from "./resource/appSession"
import * as LocalDB from "./interface/LocalDB"

window._debug = {
    DOM,
    UserActions,
    appSession,
    DB,
    LocalDB
}

//

const App = DOM

van.add(document.body, App)

new CommandsIO("UserActions", UserActions)
new CommandsIO("Context", {})

await init()

export default App

import * as yaml from "yaml"
console.log(yaml.stringify({
    "8fsa": 0,
    "2asfd": 0,
    "1fasf": 0,
    "3saf": 0,
    3: 0,
    2: 0,
    1: 0

}))
