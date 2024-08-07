import BrowserDB from "./BrowserDb"
import { DateTime } from "luxon"
import appSession from "../appSession"

//"CRUD"

export async function getAllSessions() {
    return await BrowserDB.sessions.toArray()
}

export async function clearAllSessions() {
    return await BrowserDB.sessions.clear()
}

export async function getSession(id) {
    return await BrowserDB.sessions.get(id)
}

export async function getLastSession() {
    return await BrowserDB.sessions.get("lastUsed")
}

export async function saveSession(id, session) {
    let _id = id || "lastUsed"
    let _session = session || appSession
    return await BrowserDB.sessions.put(
        {   
            id: _id,
            dateCreated: _session?.dateCreated,
            dateModified: DateTime.now().toISO(),
            data: _session.temp
        }
    )
}

