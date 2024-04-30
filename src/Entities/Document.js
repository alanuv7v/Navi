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
        this.file = await handle.getFile()
        this.raw = await file.text()
        this.parsed = await yaml.parse(raw)
    }


}