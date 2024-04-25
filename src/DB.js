import Dexie from "dexie";

export default DB = new Dexie("RootDB");

DB.version(1).stores({
  roots: `
    ++id,
    usage,
    handle`,
});