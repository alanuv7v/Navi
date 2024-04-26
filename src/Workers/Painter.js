import refs from "../Resources/DOMRefs";
import Node from "../Directors/Node";

let documentParsedExample = 
{
    "Alan": {
        age: 1,
        alias: {
            asdf: "@"
        }
    }
}

export function renderTree(tree) {
    refs("Editor").append(
        new Node('asfd', documentParsedExample, null).DOM
    )
}