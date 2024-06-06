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
    
    temp = {
        handle: null,
        root: null,
        adress: "",
        seedNodeID: "",
        viewOptions: {
            globalFilter: "All"
        }    
    }
    
    selectedNode = null // nodeID
    copiedNode = null // nodeID

}