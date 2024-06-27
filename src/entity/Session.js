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
        },
        logs: []
    }

    root = {
        DB: null,
        name: null,
        getNodeById: (id) => this.root.DB.exec(`SELECT * FROM nodes WHERE id='${id}'`)[0].values,
        getNodeByValue: (value) => this.root.DB.exec(`SELECT * FROM nodes WHERE value='${value}'`)[0].values
    }
    
    selectedNode = null // nodeID
    copiedNode = null // nodeID

    settings = {
        style: {
            fontSize: 16
        }
    }

}