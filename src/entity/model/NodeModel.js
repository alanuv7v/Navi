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
            appSession.root.DB.exec(`INSERT INTO nodes VALUES (${
                [id, key, value, origin, relationsStringfied].map(s => `'${s}'`).join(", ")
            })`)
        },
        update () {
            appSession.root.DB.exec(
                `UPDATE nodes SET ${[this.id, this.key, this.value, this.origin, this.relations]}
                id=${this.id},  key=${this.id}, value=${this.id}, origin=${this.id}, relations=${this.relations}}, WHERE id=${this.id};`
            )
        },
        delete() {
            return true
        }
    }

}