import appSession from "../resource/appSession"
import Logger from "./gui/Logger"

export default async function parseQuery (input) {
    
    try {

        console.log(input)
        let startLetter = input[0]
        let mid = input.slice(1)

        let conditionMatches = {
            "@": `value='@${mid}'` ,
            "#": `id='${mid}'`
        }

        return (await appSession.root.DB.exec(
            `SELECT * FROM nodes WHERE ${
                conditionMatches[startLetter] || `value='${input}'`
            }`
        ))[0]?.values

    }

    catch (err) {
        Logger.log(`failed to parse query: ${input}. details: ${err}`, "error")
        return undefined
    }

}