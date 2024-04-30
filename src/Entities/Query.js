import appSession from "../Resources/appSession"

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

    result = () => {
        let document = appSession.docs.find(d => d.name === this.string)
        //let treeData = nestedObj(document.parsed, this.props)
        return {document, treeData}
    }

}