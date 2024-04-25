import Dexie from "dexie";

export default DB = new Dexie("RootsDB");

DB.version(1).stores({
  roots: `
    ++id,
    usage,
    handle`,
});