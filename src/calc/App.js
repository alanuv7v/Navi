import global from "../global/global"
import { listAllFilesAndDirs } from "./global/utils"
import * as yaml from 'yaml'
import { log } from "./Logs"

export async function openRoot(handle) {
    global.root = handle
    global.docs = await listAllFilesAndDirs(handle)
    if (!(await handle.queryPermission()) === "granted") {
      await handle.requestPermission()
    } 
    return true
}
  
export async function openLastOpenedRoot() {
    if (global.DB.roots.where("usage").equals("lastOpenedRoot").toArray().length > 0) { 
        let lastOpenedRootHandle = (await global.DB.roots.where("usage").equals("lastOpenedRoot").toArray())[0].handle
        await openRoot(lastOpenedRootHandle)
        global.config = await parseDocumentHandle(global.docs.find((doc) => {return doc.name === "_config.yaml"}).handle)
        console.log(global.config.root, global.docs)
        let rootDoc = await global.docs.find((doc) => {return doc.name === global.root.config.root}).handle
        openDoc(rootDoc).then(() => {
        global.RootIO.innerText = "root: " + global.thisDoc.name
        })
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

export async function openDocument(handle) {
    if (!(await handle.queryPermission()) === "granted") {
        await handle.requestPermission()
    } 
    let docFile = await handle.getFile()
    let docRaw = await docFile.text()
    global.thisDoc.original = docRaw
    global.thisDoc.parsed = yaml.parse(docRaw)
    global.thisDoc.name = pureFilename(handle.name)

    updateEditor(global.thisDoc.parsed, [])
    log(`Successfully opened the document [${global.thisDoc.name}]`)
    return true
}
  