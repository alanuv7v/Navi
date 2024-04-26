import Dexie from "dexie";

const DB = new Dexie("RootDB");

DB.version(1).stores({
  sessions: `
    ++id,
    dateCreated,
    dateModified,
    handle`,
});

export default DB
