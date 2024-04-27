import Tree from "./Tree"


export default class Session {
    
    constructor (data) {
        this.data = data
    }

    tree = new Tree(this, this.data?.treeData)

    clipboard = {
        data: [],
        get lastItem () {
            return this.data[this.data.length-1]
        }
    }
    
}