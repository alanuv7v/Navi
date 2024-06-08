import appSession from "../resource/appSession"

export default async function parseQuery (input) {
    
    try {
        console.log(input)
        return (await appSession.root.DB.exec(`SELECT * FROM nodes WHERE value='${input}'`))[0]?.values
    }

    catch (err) {
        console.error(err)
        return undefined
    }    

}