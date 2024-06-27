import appSession from "../resource/appSession"

export default async function parseLink (input) {
    
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
        console.error(err)
        return undefined
    }    

}