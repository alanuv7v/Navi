export default class Session {
    
    constructor (data) {
        if (!data) return false
        this.copy(data)
    }

    copy (data) {
        for (let [key, value] of Object.entries(data)) {
            this.temp[key] = value
        }
    }

    get platform () {
        return 
    }
    
    temp = {
        handle: null,
        network: {
            handle: null,
            DB: {
                handle: null
            }
        },
        rootHandle: null,
        adress: "",
        seedNodeID: "",
        lastNodeId: "",
        globalFilter: "All",
        logs: [],
    }

    get rootName () {
        return this.temp.rootHandle?.name || this.root?.name
    } 

    network = {
        name: null,
        DB: null,
    }

    root = {
        DB: null,
        name: null,
        getNodeById: (id) => this.root.DB.exec(`SELECT * FROM nodes WHERE id='${id}'`)[0].values,
        getNodeByValue: (value) => this.root.DB.exec(`SELECT * FROM nodes WHERE value='${value}'`)[0].values
    }
    
    selectedNode = null
    #clickedNode = null
    
    get clickedNode () {
        return this.#clickedNode
    } 
    set clickedNode (value) {
        this.#clickedNode = value 
        this.onClickedNodeChange(value)
        return true
    }
    onClickedNodeChange = () => {}
    hoveredNode = null 
    copiedNode = null 

    globalFilter = null

    settings = {
        style: {
            fontSize: 16
        },
        autosave: true,
        autosaveInterval: 10*1000,
        autosaveIntervalId: null
    }

    

}