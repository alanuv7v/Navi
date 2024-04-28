export async function parseDocumentHandle(handle) {
    if (!(await handle.queryPermission()) === "granted") {
        await handle.requestPermission()
    }
    let docFile = await handle.getFile()
    let docRaw = await docFile.text()
    let docObj = await yaml.parse(docRaw)
    return docObj
}