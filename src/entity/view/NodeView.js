import appSession from "../../resource/appSession"
import NodeModel from "../model/NodeModel"
import refs from "../../resource/DOMRefs"

import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

export default class NodeView extends NodeModel {
    
    constructor (data) {
        super(...data)
        this.render()
    }

    selected = false
    opened = false
    filter = null

    linkedNodeViews = []

    DOM = (
        div({class: `node`},
            textarea({
                class: "value", 
                onclick: (event) => this.#onclick(event), 
                onchange: (event) => {this.#onValueChange(event)}
            }),
            div({class: "options"},
                div({class: "data"},
                    button("add link"),
                    button("delete node"),
                    button("set origin"),
                ),
                div({class: "view"},
                    button("filter"),
                    button("plant"),
                )
            ),
            div({class: "links"}),
        )
    )

    render () {
        
        let filteredLinks = this.links.filter(r => r[0] === filter)
        
        for (let relation of filteredLinks) {
            let relatedNodeData = appSession.root.DB.exec(
                `SELECT * FROM nodes WHERE id=${relation.nodeID};`
            )
            let relatedNodeView = new NodeView(relatedNodeData)
            this.DOM.querySelector(".value").append(relatedNodeView)            
        }
        
    }


    open () {

        if (!this.links || this.links.length < 1) return

        //reset links DOM
        this.DOM.querySelector(".links").innerHTML = ""

        //append linkedNodeViews to links DOM
        this.linkedNodeViews = this.links
            .filter(link => link.value === this.filter || !this.filter)
            .map(link => {
                let res = query(link)
                new NodeView(res.value, res.origin, res.links)
            })

        this.linkedNodeViews.forEach(v => 
            this.DOM.querySelector(".links").append(
                v.DOM
            )
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
    }

    #onclick () {
        if (!this.selected ) {
            this.select()
        } else {
            this.deselect()
        }
        return this
    }
    
    #onValueChange (event) {
        this.value = event.target.value
        this.localDBActions.update()
    }
    
}