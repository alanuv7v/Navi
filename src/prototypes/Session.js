import * as BrowserFileSystem from "../interface/BrowserFileSystem"

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
    
    temp = {
        browser: {
            networkHandle: null,
        },
        adress: "",
        seedNodeID: "",
        lastNodeId: "",
        globalFilter: "All",
        logs: [],
    }


    browser = {
        
        networkDirectoryTree: null,

        getNetworkTreeSubItem (path) {

            return BrowserFileSystem.getSubItemByPath(
                this.networkDirectoryTree,
                path
            )

        },


    }

    android = {
        temp: {}
    }

    settingsParsed = null

    network = {
        get name () {
            try {
                return this.settingsParsed["name"]
            }
            catch {
                return "unknown"
            }
        },
        DB: null,
        getNodeById: (id) => this.network.DB.exec(`SELECT * FROM nodes WHERE id='${id}'`)[0].values,
        getNodeByValue: (value) => this.network.DB.exec(`SELECT * FROM nodes WHERE value='${value}'`)[0].values
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