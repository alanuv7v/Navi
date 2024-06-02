import * as FileSystem from "../interface/FileSystem"

export default class Root {

    constructor (handle) {
        this.handle = handle
        this.initDB()
    }

    async initDB () {
        /* const reader = new FileReader()
        reader.onload = () => {
            this.DB = new SQL.Database(new Uint8Array(reader.result))
        }
        reader.readAsArrayBuffer(handle) */
        const file = await this.handle.getFile();
        const blob = new Blob([file], { type: file.type })
        this.DB = await blob.arrayBuffer()
        return this.DB
    }

    
    get name () {
        return this.handle.name
    }

    /* async docs () {
        let list = []
        for await (let handle of this.handle.values()) {
            list.push(handle)
        }
        return list
    }
    async enterance () {
        let docs = await this.docs()
        return docs.find((doc) => {return doc.name === "@root.yaml"})
    }
    async configHandle () {
        let docs = await this.docs()
        return docs.find((doc) => {return doc.name === "_config.yaml"})
    }
    async readConfig () {
        if (!configHandle) return new Error("_config.yaml is not found!")
        return await FileParser.parseDocumentHandle(configHandle)
    }
    async saveConfig () {
    }

    async createDocument (name) {
        return await FileSystem.createFile(this.handle, name, "yaml")
    } */

}

