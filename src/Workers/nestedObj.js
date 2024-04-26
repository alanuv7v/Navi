export default function nestedObj (obj, props, value, createNesting=false) {
    if (!props) return obj;
    if (props.length === 0) return obj
    let prop = props[0]
    let maxDig = value ? props.length-1 : props.length
    for (let i = 0; i < maxDig; i++) {
      prop = props[i]
      if (!obj[prop] && createNesting) {
        obj[prop] = {}
      }
      obj = obj[prop]
    }
    if (value) {
        if (value === undefined) {
            delete obj[prop]
            return obj
        }
        obj[prop] = value
        return obj
    }
    return obj
}