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

    async result () {
        let targetDocumentHandle = appSession.docs.find(d => d.name === this.documentName).handle
        let document = new Document(targetDocumentHandle)
        let {parsed} = await document.parse()
        let treeData = nestedObj(parsed, this.props)
        return {document, treeData}
    }

}
        
