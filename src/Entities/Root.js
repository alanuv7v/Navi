export default class Root {
    constructor (handle) {
        this.handle = handle
        this.docs = 
    }
    get root () {
        this.docs.find((doc) => {return doc.name === "@root.yaml"})?.handle
    }
    get configHandle {
        return this.docs.find((doc) => {return doc.name === "_config.yaml"})?.handle
    }
    getConfig = async () => {
        if (!configHandle) return new Error("_config.yaml is not found!")
        return await FileParser.parseDocumentHandle(configHandle)
    }
    saveConfig = async () => {
    }

}