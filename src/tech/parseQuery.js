import appSession from "../resource/appSession"
import Logger from "./gui/Logger"
import NodeData from "../entity/static/NodeData"
import { unescape } from "./escapeSqlQuery"

function simpleQuery (input) {
    
    let startLetter = input[0]
    let mid = input.slice(1)

    let conditionMatches = {
        "@": `value='@${mid}'`,
        "#": `id='${mid}'`
    }

    return (appSession.root.DB.exec(
        `SELECT * FROM nodes WHERE ${
            conditionMatches[startLetter] || `value='${input}'`
        }`
    ))[0]?.values

}

export default async function parseQuery (input) {
    
    try {

        let querySegments = input.split("/")
        let firstRes = simpleQuery(querySegments[0])
        
        if (querySegments.length === 1) return firstRes
        let context = firstRes[0]
        let contextLinks = (new NodeData(...context)).links
        let lastSegmentLinks = contextLinks
        let foundLinkData
        
        for (let i=1; i < querySegments.length; i++) {
            let targetQuerySegment = querySegments[i]
            let segmentMatch = lastSegmentLinks.find(link => {
                let linkId = link[1] /* [tie, id] */
                let linkData = simpleQuery("#" + linkId)[0]
                let linkValue = unescape(linkData[1])
                if (targetQuerySegment === linkValue) {
                    console.log(linkId, linkData, linkValue, i, querySegments.length)
                    if (i === (querySegments.length-1)) return [linkData]
                    lastSegmentLinks = JSON.parse(unescape(linkData[2]))
                }
            })
            if (!segmentMatch) return false //중간에 끊김
        }
    }

    catch (err) {
        Logger.log(`failed to parse query: ${input}. details: ${err}`, "error")
        return undefined
    }

}