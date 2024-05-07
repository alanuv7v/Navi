import * as yaml from "yaml"
import * as FileSystem from "../tech/FileSystem"

export default class Document {
    constructor (handle) {
        this.handle = handle
        this.fileName = handle.name
        this.name = handle.name.slice(0, handle.name.lastIndexOf("."))
    }

    async parse () {
        let handle = this.handle
        if (await handle.queryPermission() != "granted") {
            await handle.requestPermission()
        }
        let file = await handle.getFile()
        let raw = await file.text()
        let parsed = await yaml.parse(raw)

        Object.assign(this, {file, raw, parsed})

        return {file, raw, parsed}
    }

    async write (toWrite) {
        return await FileSystem.writeToFile(this.handle, toWrite)
    }
}