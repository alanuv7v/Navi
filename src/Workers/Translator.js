export function queryToDocumentAndProps (queryString) {

    let query = queryString.split("/")
    let targetDocumentName = query[0]
    let targetProp = query.slice(1)
    return [targetDocumentName, targetProp]
    
}