export default class SessionData {
    
    constructor (data) {
        if (!data) return false
        this.copy(data)
    }

    copy (data) {
        for (let [key, value] of Object.entries(data)) {
            this.temp[key] = value
        }
    }
    
    temp = {
        handle: null,
        rootHandle: null,
        adress: "",
        seedNodeID: "",
        viewOptions: {
            globalFilter: "All"
        }    
    }

    root = null
    
    selectedNode = null // nodeID
    copiedNode = null // nodeID

}