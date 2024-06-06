import { v4 as uuidv4 } from 'uuid';

export default class NodeData  {
    
    constructor (id, value, origin, links) {

        this.id = id || uuidv4().replaceAll("-", "") //uuid
        this.value = value //text
        this.origin = origin //uuid reference
        this.links = typeof links === "string" ? JSON.parse(links) : [] //array of [tie, node.id]. ex) ["reason", "someuuid"]

        this.metadata = {
            createdDatetime: null,
            modifiedDatetime: null,
            author: null,
            editors: []
        }
    }

}