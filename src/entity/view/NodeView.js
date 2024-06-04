import appSession from "../resource/appSession"
import NodeModel from "../model/NodeModel"

import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

export default class Node extends NodeModel {
    
    constructor (data) {
        super(...data)
        this.render()
    }

    selected = false
    opened = false
    filter = null

    DOM = (
        div({class: `node`},
            textarea({class: "key", onclick: (event) => this.#onclick(event), onchange: (event) => {this.#onKeyChange(event)}}),
            div({class: "options"},
                button("O"),
                button("<"),
                button(">"),
                button("⇑"),
                button("⇓"),
                button("+"),
                button("X"),
                button("🌱"),
            ),
            div({class: "value"}),
        )
    )

    render () {
        
        let filteredRelations = this.relations.filter(r => r[0] === filter)
        
        for (let relation of filteredRelations) {
            let relatedNodeData = appSession.root.DB.exec(
                `SELECT * FROM nodes WHERE id=${relation.nodeID};`
            )
            let relatedNodeView = new NodeView(relatedNodeData)
            this.DOM.querySelector(".value").append(relatedNodeView)            
        }
        
    }


    open () {

        //reset value DOM
        this.DOM.querySelector(".value").innerHTML = ""

        //set this.children as an array of NodeView
        if (typeof this.value === "object" && this.value) {
            this.children = Object.entries(this.value).map(([key, value]) => {
                if (key === this.filter || !this.filter) {
                    return new NodeView(key, value, this)
                }
            })
        } 

        //append this.children DOM
        if (typeof this.value === "object" && this.value) {
            for (let childNode of this.children) {
                this.DOM.querySelector(".value").append(
                    childNode.DOM
                )
            }
        } else if (this.value) {
            this.DOM.querySelector(".value").append(textarea(
                {value: this.value, onchange: (event) => this.#onValueChange(event)}
            ))
        }
        
        //set state
        this.opened = true

    }

    close () {

        //empty DOM
        this.DOM.querySelector(".value").innerHTML = ""
        
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

    #onclick () {
        if (!this.selected ) {
            this.select()
        } else {
            this.deselect()
        }
        return this
    }

    #onKeyChange (event) {
        this.key = event.target.value
        this.localDBActions.update()
    }
    
    #onValueChange (event) {
        this.value = event.target.value
        this.localDBActions.update()
    }
    
}