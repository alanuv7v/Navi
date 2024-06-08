import RootData from "../static/RootData"

export default class RootModel extends RootData {

    constructor (...data) {
        super(...data)
    }

    getNodeById (id) {
        this.DB.exec(`SELECT * FROM nodes WHERE id=${id}`)[0].values
    }
    
    getNodeByValue (value) {
        this.DB.exec(`SELECT * FROM nodes WHERE value=${value}`)[0].values
    }
}


