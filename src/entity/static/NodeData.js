import { v4 as uuidv4 } from 'uuid';

export default class NodeData  {
    
    constructor (value, origin, links) {
        
        this.id = uuidv4().replaceAll("-", "") //uuid
        this.value = value //text
        this.origin = origin //uuid reference
        this.links = [] //array of [tie, node.id]. ex) ["reason", "someuuid"]

        this.metadata = {
            createdDatetime: null,
            modifiedDatetime: null,
            author: null,
            editors: []
        }
    }

}