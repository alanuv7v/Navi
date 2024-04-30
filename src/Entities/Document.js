export class Document {
    constructor (handle) {
        this.handle = handle
        this.fileName = handle.name
        this.name = handle.name.slice(0, handle.name.lastIndexOf("."))
        this.raw = 
        this.parsed = 
    }
}