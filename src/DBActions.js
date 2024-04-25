import DB from "./DB";

async function getSessions () {
    return await DB.sessions.toArray()
}
async function getLastSession() {
    const sessions = await getSessions()
    return sessions[sessions.length - 1]
}

async function getLastTree() {
    return new Tree(await getLastSession().Tree.data)
}