import Session from "./prototypes/Session"
import objectDeepOperation from "./utils/objectDeepOperation"

const appSession = objectDeepOperation(
    new Session(), 
    obj => Object.seal(obj),
    path => ["/temp/logs"].includes(path)
) //seal deep down every obj

export default appSession

