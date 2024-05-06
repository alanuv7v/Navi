import appSession from "../Resources/appSession"
import Document from "./Document"

export default class Query  {

    constructor (string) {
        this.string = string
    }

    get path () {
        return this.string.split("/")
    }

    get documentName () {
        return this.path[0]
    }

    get props () {
        return this.path.slice(1)
    }

    async document () {
        try {
            let docs = await appSession.root.docs()
            let targetDocumentHandle = docs.find(d => d.name === this.documentName)
            return new Document(targetDocumentHandle)
        }
        catch {
            return undefined
        }
    }

    async treeData () {
        try {
            let {parsed} = await this.document.parse()
            let treeData = nestedObj(parsed, this.props)
            return treeData
        } 
        catch {
            return undefined
        }
    }

}
        
