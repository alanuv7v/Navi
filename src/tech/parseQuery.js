import appSession from "../resource/appSession"

export default async function parseQuery (input) {
    
    try {
        return (await appSession.root.DB.exec(`SELECT * FROM nodes WHERE value='${input}'`)).map(a => a.values)
    }

    catch {
        return undefined
    }    

}