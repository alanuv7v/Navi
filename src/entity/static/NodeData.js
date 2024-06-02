import { v4 as uuidv4 } from 'uuid';
import LocalDB from "../../resource/LocalDB"

export default class NodeData  {
    
    constructor (key, value, origin, relations) {
        
        this.id = uuidv4().replaceAll("-", "") //uuid
        this.key = key //text
        this.value = value //text
        this.origin = origin //uuid reference
        this.relations = relations //[[tie.id, endIndex, node id ref], ...]
        //JSON.stringify([[tie.id, endIndex, node id ref], ...])
        //`'[["1231",0,"01234"],["4221",1,"01234"]]'`

        this.metadata = {
            createdDatetime: null,
            modifiedDatetime: null,
            author: null,
            editors: []
        }

        let relationsStringfied = JSON.stringify(relations)

        LocalDB.exec(`INSERT INTO nodes VALUES (${
            [id, key, value, origin, relationsStringfied].map(s => `'${s}'`).join(", ")
        })`)
        //LocalDB.exec(`INSERT INTO nodes_metadata VALUES ${Object.values(this.metadata).join(" ")}`)

    }

}