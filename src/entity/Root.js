import * as FileSystem from "../interface/FileSystem"

export default class Root {

    constructor (handle) {
        this.handle = handle
        this.initDB()
    }

    async initDB () {
        const file = await this.handle.getFile();
        const blob = new Blob([file], { type: file.type })
        this.DB = await blob.arrayBuffer()
        return this.DB
    }

    
    get name () {
        return this.handle.name
    }

}

