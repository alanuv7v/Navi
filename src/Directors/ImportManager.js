import * as FileParser from "../Workers/FileParser"
import * as Translator from "../Workers/Translator"

export async function readConfig(docs) {
    let configHandle = docs.find((doc) => {return doc.name === "_config.yaml"})?.handle
    if (!configHandle) return new Error("_config.yaml is not found!")
    return await FileParser.parseDocumentHandle(configHandle)
}

export function getRoot(docs) {
    return docs.find((doc) => {return doc.name === "@root.yaml"})?.handle
}

export function getTreeDataFromQuery(queryString) {
    let [targetDocumentName, targetProps] = Translator.queryToDocumentAndProps(queryString)
    let targetDocument = appSession.docs.find(d => d.name === targetDocumentName)
    let treeData = nestedObj(targetDocument, targetProps)
    return treeData
}

export async function listAllFilesAndDirs(dirHandle) {
    const files = [];
    for await (let [name, handle] of dirHandle) {
        const {kind} = handle;
        if (handle.kind === 'directory') {
            files.push({name, handle, kind, children: await listAllFilesAndDirs(handle)});
        } else {
            files.push({name, handle, kind});
        }
    }
    return files;
}