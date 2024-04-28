export function (original) {
    
    let behaviors = {
        
        set(target, prop, value, receiver) {
            if (target.autosave && target[prop] != value) { //autosave
                LocalDBManager.updateSession(target) //핵심.  
                console.log("appSession saved to DB")
            }
            target[prop] = value
            
            return true
        }
        
    }
    
    return new Proxy(session, appSessionBehavior);
}
