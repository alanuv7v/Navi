import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import appSession from "../Resources/appSession"

export default class Node  {

    constructor (key, value, parent) {
        
        //value = can be children
        //parent reference is needed to override modified data to the parent value

        this.key = key
        this.value = value
        this.parent = parent
        this.update()
        console.log({key, value, parent})

    }
    
    path = []
    pathString = this.path.join("/")

    DOM = div({class: "node"},
        textarea({class: "key", onclick: () => this.onclick()}),
        div({class: "value"}),
    )

    parent = null

    update() {

        //show key
        this.DOM.querySelector(".key").value = this.key

        const showValue = () => {
            this.DOM.querySelector(".value").append(textarea(this.value))
        }

        const showChildren = () => {
            for (let [key, value] of Object.entries(this.value)) {
                let childNode = new Node(key, value, this)
                this.DOM.querySelector(".value").append(
                    childNode.DOM
                )
            }
        }
        
        if (typeof this.value === "object" && this.value) {
            showChildren()
        } else {
            showValue()
        }

        return true

    }

    selected = false

    onclick = () => {
        if (this.selected ) {
            this.DOM.classList.remove("selected")
        } else {
            this.DOM.classList.add("selected")
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

    addChild(key, value) {
        if (typeof this.value != "object") {
            let originalValue = this.value
            this.value = {
                0: originalValue
            }
        }
        this.value[key] = value
        this.update()
        return this.value
    }

    delete() {
        delete this.parent.value[this.key]
        this.DOM.remove()
        this.parent.update()
        return true
    }

    hide () {
        this.DOM.style.display = "none"
    }

    show () {
        this.DOM.style.display = "block"
    }

    stemOut () {
        let linkString = this.value
        let treeData = new Query(linkString).treeData()
        this.addChild()
    }

}