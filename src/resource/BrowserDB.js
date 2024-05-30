import Dexie from "dexie";

const BrowserDB = new Dexie("Root");

BrowserDB.version(1).stores({
  sessions: `
    ++id,
    key,
    dateCreated,
    dateModified,
    data`,
});

export default BrowserDB
