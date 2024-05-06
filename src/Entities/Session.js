import Tree from "./Tree"
import AutosaveProxy from "../Workers/AutosaveProxy"

export default class Session {
    
    constructor (data) {
        if (data) this.copy(data)
    }

    copy (data) {
        for (let e of Object.entries(data)) {
            this[e[0]] = e[1]
        }
    }

    adress = null

    root = null 

    seed = null

    tree = new Tree(this.data?.treeData)
    
}