import Tree from "../entity/Tree"
import appSession from "../resource/appSession"
import * as LocalDBManager from "../Directors/LocalDB"

export default function (originalObject) {
    
    
    let behaviors = {
        
        set(target, prop, value, receiver) {
            console.log("autosaving: ", target, prop, value)
            if (target.autosave && target[prop] != value) { //autosave
                LocalDBManager.saveSession(appSession) //핵심.  
                console.log("appSession saved to DB")
            }
            target[prop] = value
            
            return true
        }
        
    }

    originalObject.autosave = true
    
    return new Proxy(originalObject, behaviors);
}
