import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

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
        div({class: "key"}),
        div({class: "value"}),
    )

    parent = null

    update() {

        this.DOM.querySelector(".key").innerHTML = this.key

        const addValue = () => {
            this.DOM.querySelector(".value").append(div(this.value))
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

    moveUp() {

    }
    moveDown() {

    }
    DepthUp() {

    }
    DepthDown() {

    }
}