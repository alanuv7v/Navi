import Dexie from "dexie";

const BrowserDB = new Dexie("Root");

BrowserDB.version(1).stores({
  sessions: `
    id,
    dateCreated,
    dateModified,
    data`,
  settings: `
    id,
    data
  `
});

export default BrowserDB
