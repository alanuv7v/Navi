import global from "../global/global"
import { listAllFilesAndDirs, pureFileName } from "./global/utils"
import * as yaml from 'yaml'
import { log } from "./Logs"
import * as Editor from "./Editor"

export async function openRoot(handle) {
    global.root = handle
    global.docs = await listAllFilesAndDirs(handle)
    global.root.config = await parseDocumentHandle(global.docs.find((doc) => {return doc.name === "_config.yaml"}).handle)
    if (!(await handle.queryPermission()) === "granted") {
      await handle.requestPermission()
    } 
    return true
}
  
export async function openLastOpenedRoot() {
    let lastOpenedRootInDB = await global.DB.roots.where("usage").equals("lastOpenedRoot").toArray()
    console.log(lastOpenedRootInDB, lastOpenedRootInDB.length)
    if (lastOpenedRootInDB.length > 0) { 
        
        let lastOpenedRootHandle = (await global.DB.roots.where("usage").equals("lastOpenedRoot").toArray())[0].handle
        
        await openRoot(lastOpenedRootHandle)
        console.log(global.root.config, global.docs)

        let rootDocumentHandle = await global.docs.find((doc) => {return doc.name === global.root.config.root}).handle
        global.DOM.rootIO.innerText = "root: " + pureFileName(rootDocumentHandle.name)
        
        Editor.open(rootDocumentHandle)

    } else {
        log("Open a root to explore and edit.")
    }
}

export async function parseDocumentHandle(handle) {
    if (!(await handle.queryPermission()) === "granted") {
        await handle.requestPermission()
    } 
    let docFile = await handle.getFile()
    let docRaw = await docFile.text()
    return await yaml.parse(docRaw)
}

  