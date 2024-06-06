import NodeData from "../static/NodeData"
import appSession from '../../resource/appSession';

export default class NodeModel extends NodeData {

    constructor (...data) {
        super(...data)
        //should sync all these with the LocalDB automatically
    }
    
    getAdress () {
        let originPath = this?.originNode?.path()
        if (originPath) return [...originPath, this.value]
        else return [this.value]
    }
    
    getAdressString () {
        return this.getAdress().join("/")
    }
    
    createRecord () {
        return appSession.root.DB.exec(`INSERT INTO nodes VALUES (${
            ["id", "value", "origin", "links"].map(s => `'${typeof this[s] === "string" ? this[s] : JSON.stringify(this[s])}'`).join(", ")
        })`)
    }

    readRecord () {
        return appSession.root.DB.exec(
            `SELECT * FROM nodes WHERE id='${this.id}';`
        )
    }

    updateRecord () {
        return appSession.root.DB.exec(
            `UPDATE nodes SET ${
                ["value", "origin", "links"]
                    .map(s => {
                        return `${s} = '${typeof this[s] === "string" ? this[s] : JSON.stringify(this[s])}'`
                    })
                    .join(", ")
            } WHERE id='${this.id}';`
        )
    }

    deleteRecord () {
        return appSession.root.DB.exec(`DELETE FROM nodes WHERE id=${this.id}`)
    }

    addLink (tie, nodeID) {
        this.links.push([tie, nodeID])
        this.updateRecord()
    }

    addNewLinkedNode (tie) {
        let _tie = tie || "_:_"
        
        let newNodeModel = new NodeModel(null, "", this.id, [])
        
        newNodeModel.createRecord()
        
        this.addLink(_tie, newNodeModel.id)
        newNodeModel.addLink(_tie, this.id)

        this.updateRecord()
        newNodeModel.updateRecord()
    }

}