//@ts-check
import { v4 as uuidv4 } from 'uuid';
import { unescape } from '../../utils/escapeSqlQuery';

export type NodeDataRaw = [
    id?: string, 
    key?: string, 
    value?: string, 
    valueType?: string, 
    links?: string
]
    

export type tie = [from: string, to: string]
export type link = {tie: tie, id: string}

export default class NodeData  {

    id: string;
    key: string;
    value: string;
    valueType: string;
    links: Array<link>
    
    constructor (
        ...data: NodeDataRaw
    ) {
        const [id, key, value, valueType, links] = data
        // @ts-ignore
        this.id = id || uuidv4().replaceAll("-", "") //uuid
        this.key = key || ""
        this.value = unescape(value) || ""
        this.valueType = valueType || "string"
        this.links = typeof links === "string" ? 
            JSON.parse(unescape(links)) : [] //array of [tie, node.id]. ex) ["reason", "someuuid"]
        /* this.metadata = {
            createdDatetime: null,
            modifiedDatetime: null,
            author: null,
            editors: []
        } */
    }

}
