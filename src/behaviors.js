import appSession from "./resource/appSession"

//Wheel event
document.addEventListener("wheel", (event) => {
    
    if (!event.altKey) return false

    let targetNodeView = /* appSession.hoveredNode ||  */appSession.selectedNode
    if (!targetNodeView) return false

    let navigateSiblings = !event.shiftKey
    
    event.preventDefault()


    
    
    try {
        console.log(navigateSiblings)
        if (navigateSiblings) {
            
            console.log(targetNodeView, targetNodeView.openedFrom)
            let siblings = targetNodeView.openedFrom.linkedNodeViews
            let thisIndex = siblings.indexOf(targetNodeView)
                
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
    
            if (targetNodeView.openedFrom) {
                targetNodeView.openedFrom.select()
            } else {
                targetNodeView.showContext()
            }
    
        }
    } catch (err) {
        console.error(err)
    }

}, {passive: false})


document.addEventListener("keydown", (event) => {
    let key = event.key
    console.log(key)
    if (key === "s")
})