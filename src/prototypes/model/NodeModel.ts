//@ts-check
import NodeData, { link, tie } from "../data/NodeData"
import appSession from '../../appSession'
import { escape } from "../../utils/escapeSqlQuery"
import Logger from "../view/Logger";

import { NodeDataRaw } from "../data/NodeData";

export default class NodeModel extends NodeData {

    constructor (...data: NodeDataRaw) {
        super(...data)
    }

    get context () {
        let originLink = this.links.find(link => link.tie[0] === "context")
        if (originLink) return originLink.id
        else return null
    }

    get isAuthname () {
        return this.key[0] === "@"
    }

    get authNameConflict () {
        try {
            if (appSession.network.DB.exec(`SELECT * FROM nodes WHERE value='${this.value}' AND NOT id='${this.id}'`)[0]?.values.length > 0) return true
            else return false
        }
        catch {
            return false
        }
    }
    
    createRecord () {
        if (this.isAuthname && this.authNameConflict) {
            return false
        } 
        return appSession.network.DB.exec(`INSERT INTO nodes VALUES (${
            ["id", "value", "links"].map(s => `'${typeof this[s] === "string" ? this[s] : JSON.stringify(this[s])}'`).join(", ")
        })`)
    }

    readRecord () {
        return appSession.network.DB.exec(
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
        return appSession.network.DB.exec(
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

    forget (id: string) {
        let aliveLinks = this.links.filter(l => l[1] != id)
        this.links = aliveLinks
        return this.updateRecord()
    }

    get readableLinks () {
        return this.links.map(l => {
            return {
                tie: l[0],
                id: l[1],
                value: appSession.network.DB.exec(
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
                let oppData: NodeDataRaw = Object.assign(NodeData, appSession.network.DB.exec(
                    `SELECT * FROM nodes WHERE id='${oppID}'`
                )[0].values[0])
                let model = new NodeModel(...oppData)
                model.forget(this.id)
                console.log(oppID, oppData, model)
            }
            return appSession.network.DB.exec(`DELETE FROM nodes WHERE id='${this.id}'`)
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

    addLink (tie: tie, id: string, insertIndex?: number) {
        if (insertIndex) {
            this.links.splice(insertIndex, 1, {tie, id})
        } else {
            this.links.push({tie, id})
        }
        this.updateRecord()
    }

    linkTo (tie: tie, id: string) {
        
        let newNodeModel = new NodeModel(id)
        newNodeModel.refreshData()
        this.addLink(tie, newNodeModel.id)
        let mirrorLink = tie.reverse() as tie
        newNodeModel.addLink(mirrorLink, this.id)
    }

    
    createLinkedNode (tie: tie, value: string) {
        
        let newNodeModel = new NodeModel()
        newNodeModel.createRecord()
        
        this.addLink(tie, newNodeModel.id)

        let mirrorTie = tie.reverse() as tie
        newNodeModel.addLink(mirrorTie, this.id)

        return newNodeModel

    }

    unLink (tie: tie, id: string) {
        //미완!!!!
        //update this
        let prevThisLink = this.links.find(link => link.tie === tie && link.id === this.id)
        this.links.splice(this.links.indexOf(prevThisLink!), 1)
        this.updateRecord()
        
        //update opp
        let mirrorTie = tie.toReversed() as tie
        let newNodeModel = new NodeModel(id)
        newNodeModel.refreshData()

        let prevMirroredLink = this.links.find(link => link.tie === mirrorTie && link.id === this.id)
        newNodeModel.links.splice(newNodeModel.links.indexOf(prevMirroredLink!), 1)
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
        debugger
        let prevMirroredLink = oppModel.links.find(([t, n]) => t === prevTieMirrored && n === this.id)
        oppModel.links.splice(oppModel.links.indexOf(prevMirroredLink), 1, [newTieMirrored, this.id])
        oppModel.updateRecord()
        
    }

}
