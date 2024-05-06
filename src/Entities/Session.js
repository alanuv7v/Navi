import Root from "./Root"
import Seed from "./Seed"
import Tree from "./Tree"

export default class Session {
    
    constructor (data) {
        if (data) this.copy(data)
    }

    copy (data) {
        for (let [key, value] of Object.entries(data)) {
            if (value.handle) {
                this[key].handle = value.handle
            }
        }
    }

    adress = ""

    root = new Root()

    seed = new Seed()

    tree = new Tree(this.data?.treeData)
    
}