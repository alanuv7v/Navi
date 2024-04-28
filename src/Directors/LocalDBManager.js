import DB from "../Resources/DB"
import { DateTime } from "luxon"
import Session from "../Entities/Session"

//"CRUD"

export async function createSession() {
    
    let now = DateTime.now()
    let lastSession = getLastSession()
    let id = lastSession?.id ? lastSession.id + 1 : 1
    let newSession = new Session()
    newSession.id = id
    
    DB.sessions.add(
        {
            dateCreated: now.toISO(),
            dateModified: now.toISO(),
            data: newSession
        }
    )

    return newSession
    
}

export async function getSessions() {
    return await DB.sessions.toArray()
}

export async function getLastSession() {
    let sessionsNewToOld = await DB.sessions.orderBy("id").reverse().toArray()
    if (!sessionsNewToOld.length > 0) return undefined
    const lastSession = sessionsNewToOld[0]
    return lastSession
}


export async function updateSession(session) {
    console.log(session)
    if (!session?.id) throw new Error(`tried to override session data in DB but the current session's id is not provided`)
    let now = DateTime.now()
    //now.toISO() example: '2024-04-28T15:00:06.297+09:00'
    return await DB.sessions.put(
        {
            id: session.id,
            dateCreated: session?.dateCreated,
            dateModified: now.toISO(),
            data: session
        })
}
