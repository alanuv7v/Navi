import * as yaml from "yaml"

export default class Directory {
    all() {
        
    }
    find() {
        
    }
    parse() {

    }
}

export async function parseDocumentHandle(handle) {
    console.log(handle)
    if (await handle.queryPermission() != "granted") {
        await handle.requestPermission()
    }
    let file = await handle.getFile()
    let raw = await file.text()
    let parsed = await yaml.parse(raw)
    return {file, raw, parsed}
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