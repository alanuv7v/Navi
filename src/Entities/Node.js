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

        console.log(this.pathString(), this)

    }

    parent = null

    children = []
    
    path () {
        let parentPath = this?.parent?.path()
        if (parentPath) return [...parentPath, this.key]
        else return [this.key]
    }
    
    pathString () {
        return this.path().join("/")
    }

    DOM = div({class: "node"},
        textarea({class: "key", onclick: () => this.onclick()}),
        div({class: "value"}),
    )

    changeParent (value) {
        
        let originalParent = this.parent
        delete originalParent.value[this.key]
        originalParent.update()

        this.parent = value
        this.updateParentValue()
        this.parent.update()

        this.parent.updateParentValue()
        
        console.log(originalParent, this.parent)
        
        return true
    }
    
    updateParentValue () {
        if (!this?.parent) return false

        if (typeof this.parent.value === "object" && this.parent.value) {
            this.parent.value[this.key] = this.value
        } 
        else {
            let originalValue = this.parent.value
            let newKey = this.key
            let newValue = this.value
            this.parent.value = {
                0: originalValue,
                [newKey]: newValue
            }
        }
        return this.parent.value
    }

    update() {

        //show key
        this.DOM.querySelector(".key").value = this.key

        const showValue = () => {
            this.DOM.querySelector(".value").append(textarea(this.value))
        }

        const showChildren = () => {
            
            this.DOM.querySelector(".value").innerHTML = ""

            for (let [key, value] of Object.entries(this.value)) {
                let childNode = new Node(key, value, this)
                this.children.push(childNode)
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

    async stemOut () {
        let linkString = this.value
        let query = new Query(linkString)
        let {document, treeData} = await query.parse()
        this.addChild(linkString, treeData)
    }

}