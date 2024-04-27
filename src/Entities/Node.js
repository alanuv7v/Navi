import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import appSession from "../appSession"

export default class Node  {

    constructor (key, value, parent) {
        
        //value = can be children
        //parent reference is needed to override modified data to the parent value

        this.key = key
        this.value = value
        this.parent = parent
        this.update()
        console.log(key, value, parent)

    }
    
    path = []
    pathString = this.path.join("/")

    DOM = div({class: "node"},
        textarea({class: "key", onclick: () => this.onclick()}),
        div({class: "value"}),
    )

    parent = null

    update() {

        this.DOM.querySelector(".key").value = this.key

        const addValue = () => {
            this.DOM.querySelector(".value").append(textarea(this.value))
        }
        const addChildren = () => {
            for (let [key, value] of Object.entries(this.value)) {
                let childNode = new Node(key, value, this)
                this.DOM.querySelector(".value").append(
                    childNode.DOM
                )
            }
        }
        if (typeof this.value === "object") {
            addChildren()
        } else {
            addValue()
        }
    }

    selected = false

    onclick = () => {
        if (this.selected ) {
            this.DOM.classList.remove("selected")
        } else {
            this.DOM.classList.add("selected")
            console.log(appSession)
            appSession.tree.selectedNode = this
        }
        
        this.selected = !this.selected 
        
    }

    moveUp() {

    }
    moveDown() {

    }
    DepthUp() {

    }
    DepthDown() {

    }
}