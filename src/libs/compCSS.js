
export default function compCSS(componentName,styleString) {
    
    if (!document.compCSS) {
        document.compCSS = []
        return
    }
    if (document.compCSS.includes(componentName)) {
        return
    }
    const style_ = document.createElement('style');
    style_.textContent = styleString;
    
    document.head.append(style_)
    let rules = document.styleSheets[
        Object.keys(document.styleSheets).length-1
    ].cssRules
    console.log(rules)
    
    for (let rule of rules) {
        rule.selectorText = "." + componentName + " " + rule.selectorText
    }
    
    document.compCSS.push(componentName)

    return style_

}
