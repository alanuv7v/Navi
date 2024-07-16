import NodeData from "../static/NodeData"
import appSession from '../../resource/appSession';
import { escape } from "../../tech/escapeSqlQuery"
import Logger from "../../tech/gui/Logger";

export default class NodeModel extends NodeData {

    constructor (...data) {
        super(...data)
        //should sync all these with the LocalDB automatically
    }

    get context () {
        let originLink = this.links.find(link => link[0].split("/")[1] === "context")
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
        console.log(`UPDATE nodes SET ${
            ["value", "links"]
                .map(s => {
                    return `${s}='${typeof this[s] === "string" ? 
                    escape(this[s])
                    : escape(JSON.stringify(this[s]))}'`
                })
                .join(", ")
        } WHERE id='${this.id}';`)
        return appSession.root.DB.exec(
            `UPDATE nodes SET ${
                ["value", "links"]
                    .map(s => {
                        return `${s}='${typeof this[s] === "string" ? 
                        escape(this[s])
                        : escape(JSON.stringify(this[s]))}'`
                    })
                    .join(", ")
            } WHERE id='${this.id}';`
        )
    }

    forget (id) {
        let aliveLinks = this.links.filter(l => l[1] != id)
        this.links = aliveLinks
        return this.updateRecord()
    }

    get readableLinks () {
        return this.links.map(l => {
            return {
                tie: l[0],
                id: l[1],
                value: appSession.root.DB.exec(
                    `SELECT value FROM nodes WHERE id='${l[1]}'`
                )[0]?.values?.at(0)?.at(0) || "unknown"
            }
        })
    }

    deleteRecord () {
        try {
            // remove this node from other nodes data
            for (let link of this.links) { //remove mirror links
                let oppID = link[1]
                let oppData = appSession.root.DB.exec(
                    `SELECT * FROM nodes WHERE id='${oppID}'`
                )[0].values[0]
                let model = new NodeModel(...oppData)
                model.forget(this.id)
                console.log(oppID, oppData, model)
            }
            return appSession.root.DB.exec(`DELETE FROM nodes WHERE id='${this.id}'`)
        } catch (err) {
            Logger.log(err, "error")    
        }
    }

    refreshData() {
        let newData = this.readRecord()[0]
        let newValues = newData.values[0]
        for (let i=0; i < newData.columns.length; i++) {
            let prop = newData.columns[i] 
            if (prop === "id") {
                //do nothing
            } else if (prop === "links") {
                this[prop] = JSON.parse(newValues[i])
            } else {
                this[prop] = newValues[i]
            }
        }
        return this
    }

    addLink (tie, nodeID, index) {
        if (index) {
            this.links.splice(index, 1, [tie, nodeID])
        } else {
            this.links.push([tie, nodeID])
        }
        this.updateRecord()
    }

    linkTo (tie, nodeID) {

        let mirrorTie = structuredClone(tie.split("/")).reverse().join("/")
        
        let newNodeModel = new NodeModel(nodeID, null, [])
        newNodeModel.refreshData()
        
        this.addLink(tie, newNodeModel.id)
        newNodeModel.addLink(mirrorTie, this.id)
    }

    
    createLinkedNode (tie, value) {
        
        let newNodeModel = new NodeModel(null, value, [])
        newNodeModel.createRecord()
        
        this.addLink(tie, newNodeModel.id)

        let mirrorTie = structuredClone(tie.split("/")).reverse().join("/")
        newNodeModel.addLink(mirrorTie, this.id)

    }

    deleteLink (tie, nodeID) {
        //미완!!!!
        //update this
        let prevThisLink = this.links.find(([t, n]) => t === tie && n === this.id)
        this.links.splice(this.links.indexOf(prevThisLink), 1)
        this.updateRecord()
        
        //update opp
        let mirrorTie = structuredClone(tie.split("/")).reverse().join("/")
        let newNodeModel = new NodeModel(nodeID, null, [])
        newNodeModel.refreshData()

        let prevMirroredLink = newNodeModel.links.find(([t, n]) => t === mirrorTie && n === this.id)
        newNodeModel.links.splice(newNodeModel.links.indexOf(prevMirroredLink), 1)
        newNodeModel.updateRecord()

    }
    
    changeTie (prevTie, newTie, oppID) {
        
        let prevTieMirrored = structuredClone(prevTie.split("/")).reverse().join("/")
        let newTieMirrored = structuredClone(newTie.split("/")).reverse().join("/")

        //update this
        let prevThisLink = this.links.find(([t, n]) => t === prevTie && n === oppID)
        this.links.splice(this.links.indexOf(prevThisLink), 1, [newTie, oppID])
        this.updateRecord()

        //update opp

        let oppModel = new NodeModel(oppID, null, [])
        oppModel.refreshData()

        let prevMirroredLink = oppModel.links.find(([t, n]) => t === prevTieMirrored && n === this.id)
        oppModel.links.splice(oppModel.links.indexOf(prevMirroredLink), 1, [newTieMirrored, this.id])
        oppModel.updateRecord()
        
    }

}
