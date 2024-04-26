import DB from "../Resources/DB"

export async function getSessions () {
    console.log(DB)
    return await DB.sessions.toArray()
}

export async function getLastSession() {
    const sessions = await getSessions()
    return sessions[sessions.length - 1]
}

export async function getLastTreeData () {
    return await getLastSession()?.tree?.data
}