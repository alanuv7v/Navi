import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

import appSession from "../resource/appSession"
import Query from "./Query"
import Seed from "./Seed"


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
        } else if (this.value) {
            this.children = [new Node(this.value, null, this)]
        }

        this.render()

        console.log(this.pathString(), this)

    }

    selected = false
    opened = false
    
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
        

        //update key DOM value
        this.DOM.querySelector(".key").value = this.key
        
        this.open()

        return true

    }

    #onclick = () => {
        if (this.selected ) {
            this.DOM.classList.remove("selected")
            appSession.selectedNode = null
        } else {
            if (appSession.selectedNode) {
                appSession.selectedNode.selected = false
                appSession.selectedNode.DOM.classList.remove("selected")
            }
            this.DOM.classList.add("selected")
            appSession.selectedNode = this
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
        //reset value DOM
        this.DOM.querySelector(".value").innerHTML = ""

        for (let childNode of this.children) {
            this.DOM.querySelector(".value").append(
                childNode.DOM
            )
        }

        this.opened = true

    }

    close () {
        this.DOM.querySelector(".value").innerHTML = ""
        this.children = []

        this.opened = false
        
    }

    isLink () {
        if (typeof this.key === "string" && this.key[0] === "@") return true
        return false
    }

    async stemOut () {
        
        if (!this.isLink()) return "This node is not a link!"
        
        let linkString = this.key.slice(1)

        let newSeed = new Seed(linkString)
        await newSeed.parse()
        
        for (let [key, value] of Object.entries(newSeed.treeData)) {
            this.children.push(new Node(key, value, null))
        }
        
        this.render()

        appSession.seeds.push(newSeed)

        return newSeed
    }

    changeParent (value) {
        
        let originalParent = this.parent

        if (originalParent) {
            delete originalParent.value[this.key]
            let thisIndex = originalParent.children.indexOf(this)
            originalParent.children.splice(thisIndex, 1)
            originalParent.render()
        }

        this.parent = value
        this.updateParentValue()
        this.parent.children.push(this)
        this.parent.render() // 직계 부모만 rerender 하면 됨.
        
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
        this.parent.updateParentValue()
        return this.parent.value
    }
    

}