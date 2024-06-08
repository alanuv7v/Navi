import NodeData from "../static/NodeData"
import appSession from '../../resource/appSession';
import { escape } from "../../tech/escapeSqlQuery"

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
            ["id", "value", "links"].map(s => `'${typeof this[s] === "string" ? this[s] : JSON.stringify(this[s])}'`).join(", ")
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
                ["value", "links"]
                    .map(s => {
                        return `${s} = '${typeof this[s] === "string" ? 
                        escape(this[s])
                        : escape(JSON.stringify(this[s]))}'`
                    })
                    .join(", ")
            } WHERE id='${this.id}';`
        )
    }

    deleteRecord () {
        return appSession.root.DB.exec(`DELETE FROM nodes WHERE id=${this.id}`)
    }

    refreshData() {
        let newData = this.readRecord()[0].values[0]
        for (let i=0; i < newData.length; i++) {
            let prop = ["id", "value", "origin", "links"][i] 
            if (prop === "links") {
                this[prop] = JSON.parse(newData[i])
            } else {
                this[prop] = newData[i] 
            }
        }
        return this
    }

    linkTo (tie, nodeID) {
        let _tie = tie.join("/") || "_/_"
        this.links.push([_tie, nodeID])
        this.updateRecord()
    }

    createLinkedNode (tie, value) {
        tie = tie || ["_", "_"]
        let mirrorTie = tie.reverse()
        
        let newNodeModel = new NodeModel(null, value, [this.id])
        newNodeModel.createRecord()
        
        this.linkTo(tie, newNodeModel.id)
        this.updateRecord()

        newNodeModel.linkTo(mirrorTie, this.id)
        newNodeModel.updateRecord()
        
    }

}
