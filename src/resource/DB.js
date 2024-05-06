import Dexie from "dexie";

const DB = new Dexie("Root");

DB.version(1).stores({
  sessions: `
    ++id,
    key,
    dateCreated,
    dateModified,
    data`,
});

export default DB
