import appSession from "../appSession"
import Logger from "../prototypes/view/Logger"
import NodeData from "../prototypes/static/NodeData"
import { unescape } from "./escapeSqlQuery"

function simpleQuery (input) {
    
    let startLetter = input[0]
    let mid = input.slice(1)

    let conditionMatches = {
        "@": `value='@${mid}'`,
        "#": `id='${mid}'`
    }

    return appSession.network.DB.exec(
        `SELECT * FROM nodes WHERE ${
            conditionMatches[startLetter] || `value='${input}'`
        }`
    )[0]?.values

}

export default async function parseQuery (input) {

    debugger
    
    try {

        let querySegments = input.split("/")
        let context = simpleQuery(querySegments[0])[0]
        let contextLinks = (new NodeData(...context)).links
        
        let lastSegmentMatch = context
        let lastSegmentLinks = contextLinks
        
        if (querySegments.length === 1) return [context]

        //find nodeData for each segments
        for (let i=1; i < querySegments.length; i++) {
            let targetQuerySegment = querySegments[i]
            lastSegmentLinks.forEach(link => {
                let linkId = link[1] /* [tie, id] */
                let linkData = simpleQuery("#" + linkId)[0]
                let linkValue = unescape(linkData[1])
                if (targetQuerySegment === linkValue) {
                    lastSegmentLinks = JSON.parse(unescape(linkData[2]))
                    lastSegmentMatch = linkData
                }
            })
            console.log(lastSegmentMatch)
            if (!lastSegmentMatch) {
                return false
            } 
            else {
                //if last segment match found, return segment match
                if (i === (querySegments.length-1)) { 
                    break
                }
            }
        }
        
        return [lastSegmentMatch]

    }

    catch (err) {
        Logger.log(`failed to parse query: ${input}. details: ${err}`, "error")
        return undefined
    }

}