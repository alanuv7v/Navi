import Tree from "./Tree"

export default class Session {
    
    constructor (data) {
        this.data = data
    }

    tree = new Tree()

    clipboard = {
        data: [],
        get lastItem () {
            return this.data[this.data.length-1]
        }
    }
    
}