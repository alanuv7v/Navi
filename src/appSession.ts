import Session from "./prototypes/Session"
import objectDeepOperation from "./utils/objectDeepOperation"

const appSession: Session = objectDeepOperation(
    new Session(),
    (obj:Object) => Object.seal(obj),
    (path:string) => ["/temp/logs"].includes(path)
) //seal deep down every obj

export default appSession

