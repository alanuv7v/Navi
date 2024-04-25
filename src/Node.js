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
    
    key = ""
    value = {}
    path = []
    pathString = this.path.join("/")

    DOM = null

    parent = null

    update() {
        //this.DOM.querySelector(".values").... so on.
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