import appSession from "./resource/appSession"

//Wheel event
document.addEventListener("wheel", (event) => {
    
    if (!event.altKey) return false

    let targetNodeView = /* appSession.hoveredNode ||  */appSession.selectedNode
    if (!targetNodeView) return false

    let navigateSiblings = !event.shiftKey
    
    event.preventDefault()


    
    console.log(event.altKey, event.shiftKey, targetNodeView.value)

    try {
        if (navigateSiblings) {
            
            let siblings = targetNodeView.originView.linkedNodeViews
            let thisIndex = siblings.indexOf(targetNodeView)
            
            console.log(siblings)
    
            if (event.deltaY > 0) {
                siblings[thisIndex + 1].select()
            } else {
                siblings[thisIndex - 1].select()
            }
    
            return true
        }
    
        if (event.deltaY > 0) {
    
            if (targetNodeView.opened) {
                targetNodeView.linkedNodeViews.at(0).select()
            } else {
                targetNodeView.open()
                targetNodeView.linkedNodeViews.at(0).select()
            }
    
        } else {
    
            if (targetNodeView.originView) {
                targetNodeView.originView.select()
            } else {
                targetNodeView.showOrigin()
            }
    
        }
    } catch {
        
    }

}, {passive: false})