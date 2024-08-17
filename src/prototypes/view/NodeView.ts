//@ts-check
import appSession from "../../appSession"
import NodeModel from "../model/NodeModel"
import refs from "../../DOMRefs"
import parseQuery from "../../utils/parseQuery"

import van from "vanjs-core"
const {div, button, input} = van.tags

import autoResizedTextarea from "./autoResizedTextarea"

import * as userActions from "../../userActions"

import { NodeDataRaw, tie } from "../data/NodeData"

export default class NodeView extends NodeModel {
    
    constructor (...data:NodeDataRaw) {
        super(...data)
    }

    onDomMount = () => {
        this.updateStyle()
        this.valueInput.autoResize()
    }

    filter:string|undefined //query statement
    planted:boolean = false
    selected:boolean = false
    opened:boolean = false
    
    openedFrom: NodeView|undefined //NodeView that opened this node
    tieFromOpenedFrom:tie|undefined

    linkedNodeViews: Array<NodeView> = []
    
    deleteReady = false
    
    
    getAdress () {
        let originPath = this?.openedFrom?.path
        if (originPath) return [...originPath, this.value]
        else return [this.value]
    }
    
    getAdressString () {
        return this.getAdress().join("/")
    }

    get isReference () {
        return this.value.startsWith(">")
    }

    get referenceQuery () {
        return this.value.slice(1)
    }
    
    get siblings ():Array<NodeView>|undefined {
        return this.openedFrom?.linkedNodeViews
    }

    get siblingsIndex ():number|undefined {
        if (!this.siblings) return 
        let res
        for (let i = 0; i < this.siblings.length; i++) {
            let s = this.siblings[i]
            if (this.id === s.id) {
                res = i
                break
            }
        }
        return res
    }

    get linkIndex () {
        if (!this.openedFrom) return 
        let res
        for (let i = 0; i < this.openedFrom.links.length; i++) {
            let link = this.openedFrom.links[i]
            if (this.tieFromOpenedFrom === link.tie && this.id === link.id) {
                res = i
                break
            }
        }
        return res
    }

    get path ():string {
        return [this.openedFrom ? [this.openedFrom.path, this.value] : this.value].flat().join("/")
    }

    get allSubNodes ():Array<NodeView> {
        return this.linkedNodeViews.map(view => {
            if (view.linkedNodeViews.length > 0) {
                return [view, ...view.allSubNodes]
            } else {
                return view
            }
        }).flat()
    }

    getAllSubNodesStats (indent=0) {
        return this.allSubNodes.map(view => {
            let view_ ={...view}
            view_.linkedNodeViews = [] //to prevent JSON stringfy error
            view_.openedFrom = undefined //to prevent JSON stringfy error
            return JSON.stringify(view_, null, indent)
        })
    }

    
    delete () {
        
        this.DOM.remove()
        this.deleteRecord()

        if (!this.openedFrom) return
        let prevId = this.openedFrom.linkedNodeViews[this.siblingsIndex as number -1]?.id
        this.openedFrom.refreshData()
        this.openedFrom.updateStyle()
        this.openedFrom.open()
        
        if (prevId) {
            this.openedFrom.linkedNodeViews.find(v => v.id === prevId)?.select()
        } else {
            this.openedFrom?.select()
        }
    }

    
    actionsDOM = div({class: "actions"},
        
        button({
            class: "linksOpener", 
            onclick: () => this.toggleOpen(),
            innerText: this.listLinkedDataToOpen().length, //TODO
            tooltip: "toggle show links"
        }),

        button({onclick: () => {
            this.deselect()
        }, tooltip: "deselect node"}, "*"/* "hide options */),
        button({onclick: () => {
            this.findNewOrigin()
        }, tooltip: "set new origin"}, "$"),
        button({onclick: async () => {
            this.showAuthContext(0)
        }, tooltip: "find full context"}, "^^"/* "show authName origin" */),
        button({onclick: async () => {
            this.showContext()
        }, tooltip: "find context"}, "^"/* "show origin" */),
        button({onclick: () => {
            let newNode = this.createBranch()
            if (!newNode) return false //this node is a reference node
            this.open()
            this.linkedNodeViews.find(v => v.id === newNode.id)?.select()
        }, tooltip: "create new branch"}, "+" /* "new branch" */),
        button({onclick: (e) => {
            console.log(this)
            if (this.deleteReady) {
                this.delete()
            } else {
                e.target.innerText = "confirm to delete!"
                this.deleteReady = true
            }
        }, onblur: (e) => {
            if (this.deleteReady) e.target.value = "delete"
        }, tooltip: "delete node"
        }, "X"/* "delete" */),
        //button("save metadata"),
        button({onclick: () => {
            if (this.opened) this.close() 
            else this.open()
        }, tooltip: "open/close"}, "<>"/* "open/close" */),
        button({onclick: () => {
            
            refs("CommandPalette").focus()
            refs("CommandPalette").placeholder = "filter..."
            
            let onArgumentsSubmit = async (event) => {
                    let actionResult = this.filter = event.target.value
                    console.log(actionResult)
                    refs("CommandPalette").placeholder = ""
                    refs("CommandPalette").removeEventListener("blur", onArgumentsSubmit)
                    this.close()
                    this.open()
                }
                
                refs("CommandPalette").addEventListener("blur", onArgumentsSubmit)
                
        }, tooltip: "filter links"}, "()"/* "filter" */),
        button({onclick: () => {userActions.Navigate.show_node_(`#${this.id}`)}, tooltip: "plant this node"}, "."/* "plant" */),
        button({
            onmousedown: () => {
                this.openTreeLoopCancelTrigger = false
                this.openTreeLoop(20, 5, () => this.openTreeLoopCancelTrigger)
            }, 
            onmouseup: () => {
                this.openTreeLoopCancelTrigger = true
            }
        }, "{")
    )

    linksDOM = div({class: "links"})

    valueInput: autoResizedTextarea = new autoResizedTextarea({
        class: "key", 
        value: this.key, 
        onclick: (event) => this.#onclick(), 
        onauxclick: (event) => this.#onauxclick(event), 
        onchange: (event) => {this.#onkeychange(event)},
        onkeydown: (event) => this.#onkeydown(event),
        onselect: (event) => this.#onselect(event),
        onfocus: ((e) => {
            e.preventDefault();
            e.target.focus({preventScroll: true});
        })
    })

    tieDOM = input({class: "tieInput", placeholder: "from/to", 
        
        disabled: (this.planted || this.isReference),

        onclick: (event) => {
            event.target.value = event.target.value.split(" ----- ").join("/")
        },

        onblur: (event) => {
            event.target.value = event.target.value.split("/").join(" ----- ")
        },

        onchange: (event) => {

            if (!this.openedFrom || this.planted || this.isReference) return false
            
            let prevTie = structuredClone(this.tieFromOpenedFrom) as tie
            let newTie = event.target.value.split("/") as tie

            this.changeTie(prevTie, newTie, this.openedFrom!.id)
            
            event.target.value = event.target.value.split("/").join(" ----- ")
            this.decideTieDisplay()
            
        }
    })

    DOM = div({
        class: "node", 
        onmouseenter: (event) => this.#onHover(event),
        oncontextmenu: (event) => event.preventDefault(),
    },
        div({class: "overlay"},
        ),
        div({class: "main"},
            
            div({class: "selectionIndicator"}),
            
            div(
                
                this.tieDOM, 

                this.valueInput.DOM,

                div({class: "options"},
                    this.actionsDOM
                ),
                
            )
        ),
        this.linksDOM
    )

    listLinkedDataToOpen (): Array<{tie: tie, data: NodeDataRaw}> {
        
        if (this.isReference) {
            return parseQuery(this.referenceQuery).map(data => [
                {tie: ["reference", ""], data}
            ])
        } else {
            //append linkedNodeViews to links DOM
            return this.links
            .map((link) => {
                let tie = link.tie
                let res = appSession.network.getNodeById(link.id)
                if (tie && res) return {tie, data: res[0]}
            })
            .filter(link => link != undefined)
            .filter(link => link.data[0] != this.openedFrom?.id)
            /* .filter(link => {
                let tie = link.tie
                //let key = link.data[1]
                //return key === this.filter || !this.filter
                return tie === appSession.globalFilter || tie === this.filter || !this.filter
            }) */
        }
    }

    async open (replacers:Array<NodeView>=[], options={}) {

        const defaultOptions = {
            softAppear: false
        }

        options = {...defaultOptions, ...options}

        //clear DOM
        if (this.opened) this.close()
        //reset links DOM
        this.linksDOM.innerHTML = ""

        this.linkedNodeViews = this.listLinkedDataToOpen()
            .map(({tie, data}) => {
                return {
                    tie,
                    view: replacers?.find(r => r.id === data[0]) || new NodeView(...data)
                }
            }).map(({tie, view}) => {
                view.openedFrom = this
                view.tieFromOpenedFrom = tie
                return view
            })

        this.linkedNodeViews.forEach(view => {
            //@ts-expect-error
            if (options.softAppear) {
                view.DOM.classList.add("appear")
            }
            this.linksDOM.append(view.DOM)
            view.onDomMount()
        })

        //set state
        this.opened = true

        this.updateStyle()

        return this.linkedNodeViews

    }

    close () {

        //empty DOM
        this.linksDOM.innerHTML = ""
        
        //set state
        this.opened = false
    }

    select () {

        console.log(this)

        //deselct the prev
        if (appSession.selectedNode) {
            appSession.selectedNode.deselect()
        }

        //style
        this.DOM.classList.add("selected")
        
        //set state
        this.selected = true
        appSession.selectedNode = this
        appSession.temp.lastNodeId = this.id
        
        //focus
        //@ts-ignore
        this.DOM.querySelector("textarea.key")?.focus()

        //show options
        this.showOptions()

        this.showTie()

    }

    deselect () {
        this.DOM.classList.remove("selected")
        appSession.selectedNode = undefined
        this.selected = false
        /* this.optionSleep = true */
        this.hideOptions()
        
        this.decideTieDisplay()
    }

    plant () {
        refs("Nodes").innerHTML = ""
        refs("Nodes").append(this.DOM)
        this.planted = true
        this.onDomMount()
    }

    toggleOpen () {
        if (!this.opened) {
            this.open()
        } else {
            this.close()
        }
    }

    async showContext () {
        if (!this.context) return false
        let res = (await parseQuery(`#${this.context}`))
        let contextView = new NodeView(...res[0])
        
        contextView.plant()
        contextView.open([this])
        contextView.select()

        return contextView
    }

    async showAuthContext (i) {
        
        if (i >= 10/* max find */) {
            return false
        }

        let lastOrigin = await this.showContext()
        
        if (lastOrigin && !lastOrigin.isAuthname) {
            i++
            lastOrigin.showAuthContext(i)
        } else {
            return lastOrigin
        }

    }

    moveLinkIndex (toAdd) {
        
        if (!this.openedFrom || !this.siblings || !this.siblingsIndex || !this.tieFromOpenedFrom) return

        if (toAdd === 0) return false
        let toSwapWith = this.siblings[this.siblingsIndex + toAdd]
        console.log(toSwapWith.value)
        let targetIndex = toSwapWith?.linkIndex
        if (!targetIndex || targetIndex < -1 || targetIndex > this.openedFrom.links.length) return false
        this.openedFrom.links.splice(this.linkIndex, 1) //delete pre-existing self
        this.openedFrom.links.splice(targetIndex, 0, {tie: this.tieFromOpenedFrom, id: this.id}) //insert self
        console.log(this.openedFrom.links)
        this.openedFrom.updateRecord()

    }

    moveUp () {
        if (!this.openedFrom || !this.siblings || !this.siblingsIndex || !this.tieFromOpenedFrom) return
        //move perm data
        let res = this.moveLinkIndex(-1)
        //move temp data
        let prevSiblingsIndex = this.siblingsIndex
        this.openedFrom.linkedNodeViews.splice(prevSiblingsIndex, 1) //delete pre-existing self
        this.openedFrom.linkedNodeViews.splice(prevSiblingsIndex - 1, 0, this) //insert self
        //move DOM
        this.DOM.parentNode!.insertBefore(this.DOM, this.DOM.previousSibling)
        this.select()
        return res
    }

    moveDown () {
        if (!this.openedFrom || !this.siblingsIndex) return
        //move data
        let res = this.moveLinkIndex(1)
        //move temp data
        let prevSiblingsIndex = this.siblingsIndex
        this.openedFrom.linkedNodeViews.splice(prevSiblingsIndex, 1) //delete pre-existing self
        this.openedFrom.linkedNodeViews.splice(prevSiblingsIndex + 1, 0, this) //insert self
        //move DOM
        if (this.DOM.nextSibling) {
            this.DOM.parentNode!.insertBefore(this.DOM, this.DOM.nextSibling.nextSibling) 
        } else {
            this.DOM.parentNode!.insertBefore(this.DOM, null) //to the end
        }

        this.select()
        return res
    }

    findNewOrigin () {
        this.DOM.classList.add("finding-new-origin")
        appSession.onClickedNodeChange = (nodeView) => {
            this.reOrigin(nodeView.id, nodeView)
        }
        this.select()
    }

    reOrigin (newOriginId, newOriginView) {
        if (this.id === newOriginId) return false
        //move data
        let newModel = new NodeModel(newOriginId)
        newModel.refreshData()
        newModel.addLink(this.tieFromOpenedFrom!, this.id)
        
        //move DOM
        if (!newOriginView) return
        newOriginView.refreshData()
        newOriginView.open()
        //end finding new origin
        appSession.onClickedNodeChange = () => {}
        this.DOM.classList.remove("finding-new-origin")
        this.select()

        if (!this.openedFrom) return true
        this.openedFrom.links.splice(this.linkIndex, 1)
        this.openedFrom.updateRecord()
        //move temp data
        this.openedFrom.linkedNodeViews.splice(this.siblingsIndex!, 1)
        this.openedFrom.open()
        return true
    }

    createBranch () {
        if (this.isReference) return false
        return this.createLinkedNode (["context", ""])
    }

    showTie () {
        if (this.planted || this.isReference) {
            this.tieDOM.disabled = true
            this.tieDOM.value = "! planted"
        }
        this.tieDOM.style.display = "inline-block"
    }

    decideTieDisplay () {
        this.tieDOM.style.display = 
            !this.tieFromOpenedFrom 
            || this.tieFromOpenedFrom[0] === "context" 
            || this.planted 
            ? "none" : "inline-block" //if the tie is "context/", do not display tieDOM
    }

    updateStyle () {
        try {
            
            this.decideTieDisplay()
            this.tieDOM.value = this.tieFromOpenedFrom ? 
                this.tieFromOpenedFrom
                .join(" ----- ") : ""
            
            if (this.isAuthname) {
                this.DOM.classList.add("authName")
            } else {
                this.DOM.classList.remove("authName")
            }
            
            if (this.isReference) {
                this.DOM.classList.add("reference")
            } else {
                this.DOM.classList.remove("reference")
            }

            let linksOpener: HTMLButtonElement = this.DOM.querySelector(".linksOpener")!
            linksOpener.innerText = String(this.listLinkedDataToOpen().length)

        } catch (err) {
            console.error(err)
        }
    }
    
    #onclick () {
        this.toggleOptionsDisplay()
        if (!this.selected ) {
            this.select()
        }
        appSession.clickedNode = this
        /* if (this.optionSleep) {
            this.optionSleep = false
        } else {
            this.toggleOptionsDisplay()
        } */
    }

    optionSleep = false
    optionShown = false
    
    toggleOptionsDisplay () {
        //toggle the visibility of options
        if (this.optionShown) {
            this.hideOptions()
        } else {
            this.showOptions()
        }
    }

    showOptions () {
        this.DOM.classList.add("option-shown")
        this.optionShown = true
    }

    hideOptions () {
        this.DOM.classList.remove("option-shown")
        this.optionShown = false
    }

    #onauxclick (event) {
        event.preventDefault()
        event.stopPropagation()
        this.toggleOptionsDisplay()
    }
    
    #onkeychange (event) {
        this.key = event.target.value
        if (this.isAuthname && this.authNameConflict) {
            console.log(this.DOM, event.target)
            this.DOM.classList.add("error")
            event.target.value += "  // this authentic name conflicts pre-existing nodedata record!"
            return false
        } 
        this.DOM.classList.remove("error")
        this.updateRecord()
        this.updateStyle()

    }

    #onHover (event) {
        appSession.hoveredNode = this
    }

    #onkeydown (event) {

        if (event.key === "Enter" && event.shiftKey) {
            
            //new sibling added
            if (this.openedFrom) {
                event.preventDefault()
                this.openedFrom.createBranch()
                this.openedFrom.open()
                this.openedFrom.linkedNodeViews.slice(-1)[0]?.select()
            }
            
        } else if (event.key === "Enter" && event.altKey) {
            
            //edit value
            
        } else if (event.key === "ArrowUp" && event.altKey && event.shiftKey) {

            this.moveUp()
            
        } else if (event.key === "ArrowDown" && event.altKey && event.shiftKey) {
            
            this.moveDown()

        } else if (event.key === "ArrowRight" && event.altKey && event.shiftKey) {
            
            let newNode = this.createBranch()
            if (!newNode) return false
            this.open()
            this.linkedNodeViews.find(v => v.id === newNode.id)?.select()

        } else if (event.key === "Backspace" && event.target.value.length <= 0) {
            
            this.delete()
            event.preventDefault()
            
        } else if (event.key === "ArrowUp" && event.altKey) {

            if (!this.siblings || !this.siblingsIndex) return false
            this.siblings[this.siblingsIndex-1]?.select()
            
        } else if (event.key === "ArrowDown" && event.altKey) {
            
            if (!this.siblings || !this.siblingsIndex) return false
            this.siblings[this.siblingsIndex+1]?.select()

        } else if (event.key === "ArrowLeft" && event.altKey && event.ctrlKey) {
            
            event.preventDefault()
            if (!this.openedFrom) {
                this.showContext()
            }
            this.openedFrom?.select()

        } else if (event.key === "ArrowRight" && event.altKey && event.ctrlKey) {

            event.preventDefault()
            if (!this.opened) this.open()
            this.linkedNodeViews[0]?.select()
        } else if (event.key.startsWith("Arrow") && event.target.selectionStart === event.target.selectionEnd) { 
        
            let pos = event.target.selectionStart
            let lines = event.target.value.split("\n")
            let lastLineStart = lines.slice(0, -1).reduce((acc, l) => acc + l.length, 0) + (Math.max(lines.length - 1, 0) * "\n".length)

            let atTheTopLine = pos <= lines[0].length
            let atTheBottomLine = pos >= lastLineStart
            
            console.log(pos, lines, lastLineStart, atTheTopLine, atTheBottomLine)
            
            if (event.key === "ArrowUp" && atTheTopLine) {
                if (!this.siblings || !this.siblingsIndex) return false
                this?.siblings[this.siblingsIndex-1]?.select()
            }
            else if (event.key === "ArrowDown" && atTheBottomLine) {
                if (!this.siblings || !this.siblingsIndex) return false
                this?.siblings[this.siblingsIndex+1]?.select()
            }
        } 
            
    }

    #onselect (event) {
    }

    openTreeLoopCancelTrigger = false

    async openTreeLoop (maxOpenCount=20, maxDepths=5, isCanceled, options?) {

        const defualtOptions = {
            siblingOpenDelay: 1000,
            depthOpenDelay: 1000
        }

        options = {...defualtOptions, ...options}
        
        if (!this.opened) await this.open(undefined, {softAppear: true})
        
        let lastDepth = this.linkedNodeViews
        let depthCount = 0
        let openCount = 0
        
        async function openDepthLoop () {
            
            async function openViews (views) {
                function timeout(ms) {
                    return new Promise(resolve => setTimeout(() => resolve(ms), ms));
                }
                for await (let view of views) {
                    if (isCanceled()) break
                    await timeout(view.open(null, {softAppear: true}))
                    await timeout(options.depthOpenDelay)
                    console.log(view.value)
                }
                return views
            }
            
            if (isCanceled()) return

            if (!lastDepth || lastDepth.length <= 0) {
                return
            }
            await openViews(lastDepth)
            let depthDown = lastDepth.map(v => v.linkedNodeViews).flat()
            
            openCount += lastDepth.length
            depthCount++
            
            if (depthCount > maxDepths || openCount > maxOpenCount) {
                return
            } else {
                lastDepth = depthDown
                openDepthLoop()
            }

            console.log({lastDepth, depthCount, maxDepths, openCount, maxOpenCount})
        }

        await openDepthLoop()

    }

    removeView () {
        this.DOM.remove()
        if (!this.openedFrom || !this.siblings || !this.siblingsIndex) return false
        this.openedFrom.linkedNodeViews.splice(this.siblingsIndex, 1) 
    }

    lateFilter () {
        //필터가 뒤늦게 적용됬을때 DOM 지우고 this.linkedNodeViews에서 제거
    }

    treeLateFilter (maxViews=50) {
        
        let viewCount = 0
        
        function loop (view) {
            view.lateFilter()
            for (const linkedView of view.linkedNodeViews) {
                if (viewCount > maxViews) break
                viewCount ++
                loop(linkedView)
            }
        }

        loop(this)

    }
}