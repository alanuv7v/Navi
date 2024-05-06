import DB from "../Resources/DB"
import { DateTime } from "luxon"

//"CRUD"

export async function getSessions() {
    return await DB.sessions.toArray()
}

export async function getLastSession() {
    // let sessionsNewToOld = await DB.sessions.orderBy("id").reverse().toArray()
    // if (!sessionsNewToOld.length > 0) return undefined
    // const lastSession = sessionsNewToOld[0]
    return await DB.sessions.get(1)
}

export async function saveSession(session) {
    return await DB.sessions.put(
        {   
            id: 1,
            key: "lastOpened",
            dateCreated: session?.dateCreated,
            dateModified: DateTime.now().toISO(),
            data: session.serialize()
        }
    )
}
