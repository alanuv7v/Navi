import { v4 as uuidv4 } from 'uuid';

export default class NodeData  {
    
    constructor (id, value, links, authentic) {

        this.id = id || uuidv4().replaceAll("-", "") //uuid
        this.value = value //text. if the value starts with "%", this node is authentic, meaning that no node that shares the same value can be created.
        this.links = typeof links === "string" ? JSON.parse(links) : [] //array of [tie, node.id]. ex) ["reason", "someuuid"]

        this.metadata = {
            createdDatetime: null,
            modifiedDatetime: null,
            author: null,
            editors: []
        }
    }

}
