import * as BrowserFileSystem from "../interface/BrowserFileSystem"

import { SqlJsDb } from "../interface/SqlJsDb"
import NodeView from "./view/NodeView"

export default class Session {
    
    constructor (tempData?:Object) {
        if (tempData) this.overrideTempData(tempData)
    }

    overrideTempData (data:Object) {
        for (let [key, value] of Object.entries(data)) {
            this.temp[key] = value
        }
    }
    
    temp = {
        browser: {
            networkHandle: undefined as FileSystemHandle | undefined,
        },
        adress: "" as string,
        seedNodeID: "" as string,
        lastNodeId: "" as string,
        globalFilter: "All" as string,
        logs: [] as Array<any>,
    }

    browser = {
        
        networkDirectoryTree: undefined,

        getNetworkTreeSubItem (path: string) {
            return BrowserFileSystem.getSubItemByPath(
                this.networkDirectoryTree,
                path
            )

        },


    }

    android = {
        temp: {}
    }

    settingsParsed: Object | undefined = undefined 

    network = ((session: Session) => {

        return {
            get name () : string {
                if (session.settingsParsed) {
                    return session.settingsParsed["name"]
                }
                else {
                    return "unknown"
                }
            },
            DB: undefined as SqlJsDb | undefined,
            getNodeById: (id) => this.network.DB!.exec(`SELECT * FROM nodes WHERE id='${id}'`)[0].values,
            getNodeByValue: (value) => this.network.DB!.exec(`SELECT * FROM nodes WHERE value='${value}'`)[0].values
        }

    })(this) //outer this를 가져오기 위한 개고생
    
    selectedNode: NodeView | undefined
    hoveredNode: NodeView | undefined
    copiedNode: NodeView | undefined

    #clickedNode: NodeView | undefined
    
    get clickedNode () {
        return this.#clickedNode
    } 
    set clickedNode (value) {
        this.#clickedNode = value 
        this.onClickedNodeChange(value)
    }

    onClickedNodeChange: Function = () => {}

    globalFilter: string|undefined

    settings = {
        style: {
            fontSize: 16 as number
        },
        autosave: true as boolean,
        autosaveInterval: 10*1000 as number,
        autosaveIntervalId: -1 as number
    }

    

}