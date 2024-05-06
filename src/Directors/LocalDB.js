import DB from "../Resources/DB"
import { DateTime } from "luxon"

//"CRUD"

export async function saveSession(newSession) {
    
    let now = DateTime.now()
    await DB.sessions.add(
        {
            dateCreated: now.toISO(),
            dateModified: now.toISO(),
            data: newSession
        }
    )
    return true
    
}

export async function getSessions() {
    return await DB.sessions.toArray()
}

export async function getLastSession() {
    // let sessionsNewToOld = await DB.sessions.orderBy("id").reverse().toArray()
    // if (!sessionsNewToOld.length > 0) return undefined
    // const lastSession = sessionsNewToOld[0]
    return await DB.sessions.get(1)
}


export async function updateSession(session) {
    let now = DateTime.now()
    return await DB.sessions.update(
        1,
        {   
            dateCreated: session?.dateCreated,
            dateModified: now.toISO(),
            data: session
        })
}
