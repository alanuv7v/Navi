import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import appSession from "../resource/appSession"
import Query from "./Query"


export default class Node  {
    

    constructor (key, value, parent) {
        
        //value = can be children
        //parent reference is needed to override modified data to the parent value
        
        this.key = key
        this.value = value
        this.parent = parent
        this.children = []

        if (typeof this.value === "object" && this.value) {
            this.children = Object.entries(this.value).map(([key, value]) => {
                if (key === this.filter || !this.filter) {
                    return new Node(key, value, this)
                }
            })
        } 

        this.render()

        console.log(this.pathString(), this)

    }
    
    selected = false
    
    path () {
        let parentPath = this?.parent?.path()
        if (parentPath) return [...parentPath, this.key]
        else return [this.key]
    }
    
    pathString () {
        return this.path().join("/")
    }

    DOM = div({class: `node`},
        textarea({class: "key", onclick: () => this.#onclick()}),
        div({class: "value"}),
    )

    filter = null

    render() {
            
        this.DOM.querySelector(".value").innerHTML = ""

        //show key
        this.DOM.querySelector(".key").value = this.key

        const showValue = () => {
            this.DOM.querySelector(".value").append(textarea(this.value))
        }

        const showChildren = () => {

            for (let [key, value] of Object.entries(this.value)) {
                if (key === this.filter || !this.filter) {
                    let childNode = new Node(key, value, this)
                    this.children.push(childNode)
                    this.DOM.querySelector(".value").append(
                        childNode.DOM
                    )
                }
            }
            
        }
        
        if (typeof this.value === "object" && this.value) {
            showChildren()
        } else {
            showValue()
        }

        return true

    }

    #onclick = () => {
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
    depthUp() {

    }
    depthDown() {

    }

    addChild(key, value) {
        if (typeof this.value != "object") {
            let originalValue = this.value
            this.value = {
                0: originalValue
            }
        }
        this.value[key] = value
        this.render()
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

    open () {
        this.render()
    }

    close () {
        this.DOM.querySelector(".value").innerHTML = ""
        this.children = []
    }

    isLink () {
        if (typeof this.value === "string" && this.value[0] === "@") return true
        return false
    }

    async stemOut () {
        if (!this.isLink()) return "This node is not a link, thus cannot stem out. Try open() instead."
        let linkString = this.value.slice(1)
        let query = new Query(linkString)
        let {document, treeData} = await query.parse()
        this.addChild(this.key, treeData)
        return treeData
    }

    changeParent (value) {
        
        let originalParent = this.parent

        if (originalParent) {
            delete originalParent.value[this.key]
            originalParent.render()
        }

        this.parent = value
        this.updateParentValue()
        this.parent.render()

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

}