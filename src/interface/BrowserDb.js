import Dexie from "dexie";

const BrowserDB = new Dexie("Navi");

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
