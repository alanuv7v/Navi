import van from "vanjs-core"
const {div, span, button, textarea, input, a} = van.tags

let documentParsedExample = 
{
    "Alan": {
        age: 1,
        alias: {
            asdf: "@"
        }
    }
}

export default class Node  {

    constructor (key, value) {
        this.key = key
        this.value = value
        this.update()
    }
    
    path = []
    pathString = this.path.join("/")

    DOM = div({class: "node"},
        div({class: "key"}),
        div({class: "value"}, 
        ),
    )

    parent = null

    update() {
        const endNodeUpdate = () => {
            this.DOM.querySelector(".value").append(div(this.value))
        }
        const objectNodeUpdate = () => {
            for (let e of Object.entries(this.value)) {
                let childNode = new Node({key: e[0], value: e[1]})
                this.DOM.querySelector(".value").append(
                    childNode.DOM
                )
            }
        }
        if (typeof this.value === "object") {
            objectNodeUpdate()
        } else {
            endNodeUpdate()
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