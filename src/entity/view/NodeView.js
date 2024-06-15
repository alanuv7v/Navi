import appSession from "../../resource/appSession"
import NodeModel from "../model/NodeModel"
import refs from "../../resource/DOMRefs"
import parseQuery from "../../tech/parseQuery"

import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import autoResizedTextarea from "../../tech/gui/autoResizedTextarea"

import * as userActions from "../../natural/userActions"


export default class NodeView extends NodeModel {
    
    constructor (...data) {
        super(...data)
        this.updateStyle()
    }

    onDomMount = () => {
        Array.from(this.DOM.querySelectorAll(".autoResize"))?.forEach(d => d.autoResize())
    }

    selected = false
    opened = false
    filter = null
    openedFrom = null //id of a node that opened this node

    deleteReady = false

    DOM = (
        div({class: "link"},
            div({class: "node"},
                div({class: "h-flex"},
                    button({
                        class: "linksOpener", 
                        onclick: () => this.toggleOpen(),
                        innerText: this.links.filter(link => link[0].split("/")[1] != "_origin").length
                    }),
                    autoResizedTextarea({
                        class: "value", 
                        value: this.value, 
                        onclick: (event) => this.#onclick(event), 
                        onchange: (event) => {this.#onValueChange(event)},
                    }),
                    ),
                    div({class: "options"},
                    button({onclick: () => {
                        this.deselect()
                    }, tooltip: "deselect node"}, "*"/* "hide options */),
                    div({class: "data"},
                        button({onclick: async () => {
                            this.showAuthOrigin(0)
                        }, tooltip: "find authentic origin"}, "^^"/* "show authName origin" */),
                        button({onclick: async () => {
                            this.showOrigin()
                        }, tooltip: "find origin"}, "^"/* "show origin" */),
                        button({onclick: () => {
                            this.createBranch("")
                            this.open()
                        }, tooltip: "create new branch"}, "+" /* "new branch" */),
                        button({onclick: () => {
                            this.createLinkedNode("")
                            this.open()
                        }, tooltip: "create new link"}, "~"/* "new link" */),
                        /* input({onblur: async (event) => {
                            let queryString = event.target.value
                            let res = await parseQuery(queryString)
                            if (!res) return false
                            let targetNodeData = res[0]
                            this.linkTo(targetNodeData[0])
                            this.open()
                        }, placeholder: "linkTo"}), */
                        button({onclick: (e) => {
                            console.log(this)
                            if (this.deleteReady) {
                                this.deleteRecord()
                                this.DOM.remove()
                            } else {
                                e.target.innerText = "confirm to delete!"
                                this.deleteReady = true
                            }
                        }, onblur: (e) => {
                            if (this.deleteReady) e.target.value = "delete"
                        }, tooltip: "delete node"
                        }, "X"/* "delete" */),
                        //button("save metadata"),
                    ),
                    div({class: "view"},
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
                        button({onclick: () => {userActions.Navigate.showNode(`#${this.id}`)}, tooltip: "plant this node"}, "."/* "plant" */),
                    )
                ),
                div({class: "links"}),
            ),
            div({class: "tie"})
        )
    )


    render () {
        this.refreshData()
        this.DOM.querySelector(".value").value = this.value
        this.close()
        this.open()
    }

    delete () {
        this.deleteRecord()
        this.DOM.remove()
    }


    open (replacers=[]) {

        //clear DOM
        if (this.opened) this.close()

        // return if no links
        if (!this.links || this.links.length < 1) return

        //reset links DOM
        this.DOM.querySelector(".links").innerHTML = ""

        //append linkedNodeViews to links DOM
        this.links
            .map((link) => {
                try {
                    let tie = link[0].split("/").join("\n")
                    let res = appSession.root.getNodeById(link[1])
                    return {tie, data: res[0]}
                } catch {
                    return undefined
                }
            })
            .filter(link => link.data)
            .filter(link => link.data[0] != this.openedFrom)
            .filter(link => link.data[0] != this.origin)
            .filter(link => {
                return link.data[1] === this.filter || !this.filter
            })
            .map(({tie, data}) => {
                return {
                    tie,
                    view: replacers.find(r => r.id === data[0]) || new NodeView(...data)
                }
            })
            .forEach(({tie, view}) => {
                view.openedFrom = this.id
                this.DOM.querySelector(".tie").innerText = tie
                this.DOM.querySelector(".links").append(view.DOM)
                view.onDomMount()
            }
        )
        
        //set state
        this.opened = true

    }

    close () {

        //empty DOM
        this.DOM.querySelector(".links").innerHTML = ""
        
        //set state
        this.opened = false
    
    }

    select() {
        console.log(this)
        if (appSession.selectedNode) {
            appSession.selectedNode.deselect()
        }
        this.DOM.classList.add("selected")
        appSession.selectedNode = this
        this.DOM.querySelector("textarea.value.input").focus()
        this.selected = true
    }

    deselect() {
        this.DOM.classList.remove("selected")
        appSession.selectedNode = null
        this.selected = false
    }

    plant () {
        refs("Editor").innerHTML = ""
        refs("Editor").append(this.DOM)
        this.onDomMount()
    }

    toggleOpen () {
        if (!this.opened) {
            this.open()
        } else {
            this.close()
        }
    }

    async showOrigin () {
        if (!this.origin) return false
        let res = (await parseQuery(`#${this.origin}`))
        let originNodeView = new NodeView(...res[0])
        originNodeView.plant()
        originNodeView.open([this])
        originNodeView.select()
        return originNodeView
    }

    async showAuthOrigin (i) {
        
        if (i >= 10/* max find */) {
            return false
        }

        let lastOrigin = await this.showOrigin()
                
        if (!lastOrigin.authName) {
            i++
            lastOrigin.showAuthOrigin(i)
        } else {
            return lastOrigin
        }

    }

    #onclick () {
        if (!this.selected ) {
            this.select()
        } /* else {
            this.deselect()
        } */
    }
    
    #onValueChange (event) {
        this.value = event.target.value
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

    updateStyle () {
        try {
            if (this.isAuthname) {
                this.DOM.classList.add("authName")
            } else {
                this.DOM.classList.remove("authName")
            }
        } catch (err) {
            console.error(err)
        }
    }
    
}