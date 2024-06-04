import Root from "./Root"
import Seed from "./Seed"
import Tree from "./Tree"

export default class Session {
    
    constructor (data) {
        if (!data) return false
        this.copy(data)
    }

    data = {
        handle: null
    }


    copy (data) {
        for (let [key, value] of Object.entries(data)) {
            if (value?.handle) {
                this[key].handle = value.handle
            }
        }
    }

    serialize () {
        let result = {}
        for (let [key, value] of Object.entries(this)) {
            if (value?.handle) {
                result[key] = {
                    handle: value.handle
                }
            }
        }
        return result
    }

    adress = ""

    root = null

    seed = null

    tree = new Tree(this.data?.treeData)

    selectedNode = null

    copiedNode = null

    viewOptions = {
        globalFilter: "All"
    }
    
}