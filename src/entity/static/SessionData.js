export default class SessionData {
    
    constructor (data) {
        if (!data) return false
        this.copy(data)
    }

    copy (data) {
        for (let [key, value] of Object.entries(data)) {
            this[key] = value
        }
    }

    handle = null //fileHandle
    
    root = null // Root

    adress = ""

    seedNodeID = ""

    selectedNodeID = null // nodeID

    copiedNodeID = null // nodeID

    viewOptions = {
        globalFilter: "All"
    }
    
}