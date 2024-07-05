import NodeData from "../static/NodeData"
import appSession from '../../resource/appSession';
import { escape } from "../../tech/escapeSqlQuery"
import Logger from "../../tech/gui/Logger";

export default class NodeModel extends NodeData {

    constructor (...data) {
        super(...data)
        //should sync all these with the LocalDB automatically
    }

    get origin() {
        let originLink = this.links.find(link => link[0].split("/")[1] === "_origin")
        if (originLink) return originLink[1]
        else return null
    }

    get isAuthname () {
        return this.value[0] === "@"
    }

    get authNameConflict () {
        try {
            if (appSession.root.DB.exec(`SELECT * FROM nodes WHERE value='${this.value}' AND NOT id='${this.id}'`)[0]?.values.length > 0) return true
            else return false
        }
        catch {
            return false
        }
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
        if (this.isAuthname && this.authNameConflict) {
            return false
        } 
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
        if (this.isAuthname && this.authNameConflict) {
            return false
        } 
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
        try {
            // remove this node from other nodes data
            for (let link of this.links) { //remove mirror links
                let oppID = link[1]
                let oppLinks = JSON.parse(appSession.root.DB.exec(
                    `SELECT links FROM nodes WHERE id='${oppID}'`
                    )[0].values[0])
    
                for (let i=0; i<oppLinks.length; i++) {

                    console.log(oppLinks[i])

                    if (oppLinks[i][1]===this.id) {
                        //delete the link with this
                        oppLinks.splice(i, 1) 
                        //update the opposite node
                        appSession.root.DB.exec(
                            `UPDATE nodes SET links='${
                                escape(JSON.stringify(oppLinks))
                            }' WHERE id='${oppID}'`
                        )
                    }
                }
            }
        } catch (err) {
            Logger.log(err, "error")    
        }
        return appSession.root.DB.exec(`DELETE FROM nodes WHERE id='${this.id}'`)
    }

    refreshData() {
        let newData = this.readRecord()[0].values[0]
        for (let i=0; i < newData.length; i++) {
            let prop = ["id", "value", "links"][i] 
            if (prop === "links") {
                this[prop] = JSON.parse(newData[i])
            } else {
                this[prop] = newData[i] 
            }
        }
        return this
    }

    addLink (tie, nodeID) {
        let _tie = tie?.join("/") || "_/_"
        this.links.push([_tie, nodeID])
        this.updateRecord()
    }

    linkTo (tie, nodeID) {

        tie = tie || ["_", "_"] // [this, that]
        let mirrorTie = structuredClone(tie).reverse()
        
        let newNodeModel = new NodeModel(nodeID, null, [])
        newNodeModel.refreshData()
        
        this.addLink(tie, newNodeModel.id)
        this.updateRecord()

        newNodeModel.addLink(mirrorTie, this.id)
        newNodeModel.updateRecord()

    }



    createLinkedNode (tie, value) {
        tie = tie || ["_", "_"] // [this, that]
        let mirrorTie = structuredClone(tie).reverse()
        
        let newNodeModel = new NodeModel(null, value, [])
        newNodeModel.createRecord()
        
        this.addLink(tie, newNodeModel.id)
        this.updateRecord()

        newNodeModel.addLink(mirrorTie, this.id)
        newNodeModel.updateRecord()
    }

    createBranch (value) {

        return this.createLinkedNode (["_origin", "_value"], value)
        
    }

}
