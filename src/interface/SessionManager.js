import BrowserDB from "../resource/BrowserDB"
import { DateTime } from "luxon"

//"CRUD"

export async function getSessions() {
    return await BrowserDB.sessions.toArray()
}

export async function getSession(id) {
    return await BrowserDB.sessions.get(id)
}

export async function getLastSession() {
    // let sessionsNewToOld = await DB.sessions.orderBy("id").reverse().toArray()
    // if (!sessionsNewToOld.length > 0) return undefined
    // const lastSession = sessionsNewToOld[0]
    return await BrowserDB.sessions.get(1)
}

export async function saveSession(session) {
    return await BrowserDB.sessions.put(
        {   
            id: 1,
            key: "lastOpened",
            dateCreated: session?.dateCreated,
            dateModified: DateTime.now().toISO(),
            data: session.serialize()
        }
    )
}


export async function clearSessions() {
    return await BrowserDB.sessions.clear()
}
