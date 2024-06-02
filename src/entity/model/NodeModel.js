import NodeData from "../static/NodeData"
import appSession from '../../resource/appSession';

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
        create() {
            let relationsStringfied = JSON.stringify(relations)
            return appSession.root.DB.exec(`INSERT INTO nodes VALUES (${
                [id, key, value, origin, relationsStringfied].map(s => `'${s}'`).join(", ")
            })`)
        },
        read() {
            return appSession.root.DB.exec(
                `SELECT * FROM nodes WHERE id=${this.id};`
            )
        },
        update () {
            return appSession.root.DB.exec(
                `UPDATE nodes SET ${
                    "key,value,origin,relations"
                    .split(",")
                    .map(s => s + "=" + this[s] + ", ")
                } WHERE id=${this.id};`
            )
        },
        delete() {
            return appSession.root.DB.exec(`DELETE FROM nodes WHERE id=${this.id}`)
        },
    }

}