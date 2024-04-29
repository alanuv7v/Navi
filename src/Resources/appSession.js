import * as LocalDBManager from "../Directors/LocalDataManager"
import Session from "../Entities/Session"

function createSessionProxy(session) {
    
    let appSessionBehavior = {
        
        set(target, prop, value, receiver) {
            if (target.autosave && target[prop] != value) { //autosave
                LocalDBManager.updateSession(target) //핵심.  
                console.log("appSession saved to DB")
            }
            target[prop] = value
            
            return true
        }
        
    }
    Object.defineProperty(session, "original", {
        get() {
          return session;
        }
      })
    
    return new Proxy(session, appSessionBehavior);
}
console.log(new Session())
const appSession = createSessionProxy(new Session())

export default appSession