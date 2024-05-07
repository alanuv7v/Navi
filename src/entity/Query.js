import appSession from "../resource/appSession"
import Document from "./Document"
import nestedObj from "../tech/nestedObj"

export default class Query  {

    constructor (input) {
        this.input = input
    }

    get path () {
        return this.input.split("/")
    }

    get pathString () {
        return this.input
        // Should be more advanced than this
    }

    get documentName () {
        return this.path[0].split(".")[0]
    }

    get props () {
        return this.path.slice(1)
    }

    async parse () {
        try {
            let docs = await appSession.root.docs()
            let targetDocumentHandle = docs.find(d => d.name === this.documentName + ".yaml")
            let document = new Document(targetDocumentHandle)
            let {parsed} = await document.parse()
            let treeData = nestedObj(parsed, this.props)
            return {document, treeData}
        }
        catch {
            return undefined
        }
    }

}