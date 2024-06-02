import NodeData from "../static/NodeData"

export default class NodeModel extends NodeData {

    constructor (data) {
        super(...data)
        //should sync all these with the LocalDB automatically
    }
    
    path () {
        let originPath = this?.origin?.path()
        if (originPath) return [...originPath, this.key]
        else return [this.key]
    }
    
    pathString () {
        return this.path().join("/")
    }
    
    localData = {
        update () {

        },
        delete() {
            return true
        }
    }

    changeOrigin (value) {
        //change this.origin
        //change previous origin's children
        
        return true
    }

}