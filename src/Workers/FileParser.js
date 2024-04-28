import * as yaml from "yaml"

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