import appSession from "../resource/appSession"

export default async function Query (input) {
    
    try {
        return await appSession.root.DB.exec(`SELECT * FROM nodes WHERE id=${input}`)
    }

    catch {
        return undefined
    }    

}