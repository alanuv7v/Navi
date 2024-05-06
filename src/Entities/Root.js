export default class Root {

    constructor (handle) {
        this.handle = handle
    }
    
    get name () {
        return this.handle.name
    }

    async docs () {
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

}

