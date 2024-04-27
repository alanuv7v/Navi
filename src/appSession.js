import Session from "./Entities/Session";

let documentParsedExample = 
{
    /* "Alan": {
        age: 1,
        alias: {
            asdf: "@"
        }
    } */
}

export default new Session({
    treeData: documentParsedExample
})