import * as LocalDBManager from "./Directors/LocalDBManager"

function createSessionProxy(session) {
    
    let appSessionBehavior = {
        
        set(target, prop, value, receiver) {
            
            if (target.autosave) { //autosave
                console.log("appSession setter activated")
                console.trace()
                console.log(target, target[prop], value)
                if (target[prop] != value) {
                    LocalDBManager.updateSession(session) //핵심.  
                    console.log("appSession saved to DB")
                }
            }
            target[prop] = value
            
            return true
        }
        
    }
    
    return new Proxy(session, appSessionBehavior);
}

const appSession = createSessionProxy({})

export default appSession