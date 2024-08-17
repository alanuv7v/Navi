//@ts-check
import NodeData, { tie } from "../data/NodeData"
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
            if (appSession.network.DB?.exec(`SELECT * FROM nodes WHERE key='${this.key}' AND NOT id='${this.id}'`)[0]!.values.length > 0) return true
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
        return appSession.network.DB!.exec(`INSERT INTO nodes VALUES (${
            ["id", "key", "value", "valueType", "links"].map(s => `'${typeof this[s] === "string" ? this[s] : JSON.stringify(this[s])}'`).join(", ")
        })`)
    }

    readRecord () {
        return appSession.network.DB!.exec(
            `SELECT * FROM nodes WHERE id='${this.id}';`
        )
    }

    updateRecord () {
        if (this.isAuthname && this.authNameConflict) {
            return false
        }
        console.log(`UPDATE nodes SET ${
            ["key", "value", "valueType", "links"]
                .map(s => {
                    return `${s}='${typeof this[s] === "string" ? 
                    escape(this[s])
                    : escape(JSON.stringify(this[s]))}'`
                })
                .join(", ")
        } WHERE id='${this.id}';`)
        return appSession.network.DB!.exec(
            `UPDATE nodes SET ${
                ["key", "value", "valueType", "links"]
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

    deleteRecord () {
        // remove this node from other nodes data
        for (let link of this.links) { //remove mirror links
            
            let oppID = link[1]
            let oppQueryRes = appSession.network.DB!.exec(
                `SELECT * FROM nodes WHERE id='${oppID}'`
            )[0]
            
            if (!oppQueryRes) continue

            let oppData: NodeDataRaw = oppQueryRes.values[0]
            let model = new NodeModel(...oppData)
            model.forget(this.id)
            console.log(oppID, oppData, model)
        }
        return appSession.network.DB!.exec(`DELETE FROM nodes WHERE id='${this.id}'`)
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

    
    createLinkedNode (tie: tie) {
        
        let newNodeModel = new NodeModel()
        newNodeModel.createRecord()
        
        this.addLink(tie, newNodeModel.id)

        let mirrorTie = structuredClone(tie).toReversed() as tie
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
    
    changeTie (prevTie: tie, newTie: tie, oppID: string) {
        
        let prevTieMirrored = prevTie.toReversed() as tie
        let newTieMirrored = newTie.toReversed() as tie

        //update this
        let prevThisLink = this.links.find(link => link.tie === prevTie && link.id === oppID)
        if (!prevThisLink) return false

        this.links.splice(
            this.links.indexOf(prevThisLink), 
            1, 
            {tie: newTie, id: oppID}
        )

        this.updateRecord()

        //update opp

        let oppModel = new NodeModel(oppID)
        oppModel.refreshData()
        
        let prevMirroredLink = this.links.find(link => link.tie === prevTieMirrored && link.id === this.id)
        if (!prevMirroredLink) return false

        oppModel.links.splice(
            oppModel.links.indexOf(prevMirroredLink), 
            1, 
            {tie: newTieMirrored, id: this.id}
        )
        oppModel.updateRecord()
        
    }

}
