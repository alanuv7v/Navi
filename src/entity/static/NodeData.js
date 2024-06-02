import { v4 as uuidv4 } from 'uuid';
import appSession from '../../resource/appSession';

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
    }

}