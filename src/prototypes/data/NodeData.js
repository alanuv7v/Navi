import { v4 as uuidv4 } from 'uuid';
import { unescape } from '../../utils/escapeSqlQuery';

export default class NodeData  {
    
    constructor (id, value, links) {

        this.id = id || uuidv4().replaceAll("-", "") //uuid
        this.value = unescape(value) || "" //encodeURIcomponent(text). if the value starts with "%", this node is authentic, meaning that no node that shares the same value can be created.
        this.links = typeof links === "string" ? 
            JSON.parse(unescape(links))
            : [] //array of [tie, node.id]. ex) ["reason", "someuuid"]

        this.metadata = {
            createdDatetime: null,
            modifiedDatetime: null,
            author: null,
            editors: []
        }
    }

}
