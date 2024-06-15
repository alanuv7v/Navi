import appSession from "../../resource/appSession"
import NodeModel from "../model/NodeModel"
import refs from "../../resource/DOMRefs"
import parseQuery from "../../tech/parseQuery"

import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import autoResizedTextarea from "../../tech/gui/autoResizedTextarea"

import * as userActions from "../../natural/UserActions"


export default class NodeView extends NodeModel {
    
    constructor (...data) {
        super(...data)
    }

    init = () => {
        Array.from(this.DOM.querySelectorAll(".autoResize"))?.forEach(d => d.autoResize())
    }

    selected = false
    opened = false
    filter = null
    openedFrom = null //id of a node that opened this node

    get origin() {
        let originLink = this.links.find(link => link[0].split("/")[1] === "_origin")
        if (originLink) return originLink[1]
        else return null
    }

    linkedNodeViews = []
    deleteReady = false

    DOM = (
        div({class: `node`},
            div({class: "h-flex"},
                button({
                    class: "linksOpener", 
                    onclick: () => this.toggleOpen(),
                    innerText: this.links.length
                }),
                autoResizedTextarea({
                    class: "value", 
                    value: this.value, 
                    onclick: (event) => this.#onclick(event), 
                    onchange: (event) => {this.#onValueChange(event)}
                }),
            ),
            div({class: "options"},
                div({class: "data"},
                    button({onclick: () => {
                        this.createBranch("")
                        this.open()
                    }}, "new branch"),
                    button({onclick: () => {
                        this.createLinkedNode("")
                        this.open()
                    }}, "new link"),
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
                        } else {
                            e.target.innerText = "confirm to delete!"
                            this.deleteReady = true
                        }
                    }, onblur: (e) => {
                        if (this.deleteReady) e.target.value = "delete"
                    }
                    }, "delete"),
                    //button("save metadata"),
                ),
                div({class: "view"},
                    button({onclick: () => {
                        if (this.opened) this.close() 
                        else this.open()
                    }}, "open/close"),
                    input({placeholder: "filter"}),
                    button({onclick: () => {userActions.Navigate.showNode(`#${this.id}`)}}, "plant"),
                )
            ),
            div({class: "links"}),
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


    open () {

        //clear DOM
        if (this.opened) this.close()

        // return if no links
        if (!this.links || this.links.length < 1) return

        //reset links DOM
        this.DOM.querySelector(".links").innerHTML = ""

        //append linkedNodeViews to links DOM
        this.linkedNodeViews = this.links
            .map((link) => {
                let res = appSession.root.getNodeById(link[1])
                return res[0]
            })
            .filter(nodeData => nodeData[0] != this.openedFrom)
            .filter(nodeData => nodeData[0] != this.origin)
            .filter(nodeData => {
                return nodeData[1] === this.filter || !this.filter
            })
            .map(data => new NodeView(...data))

        this.linkedNodeViews.forEach(v => {
                v.openedFrom = this.id
                this.DOM.querySelector(".links").append(v.DOM)
                v.init()
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
        this.init()
    }

    toggleOpen () {
        if (!this.opened) {
            this.open()
        } else {
            this.close()
        }
    }

    #onclick () {
        if (!this.selected ) {
            this.select()
        } else {
            this.deselect()
        }
    }
    
    #onValueChange (event) {
        this.value = event.target.value
        this.updateRecord()
    }
    
}