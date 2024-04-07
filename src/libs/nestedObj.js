export default function (obj, props, value, command=false, createNesting=false) {
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
      /* 
      let candidate = obj[prop]
      if (candidate !== undefined) {
        obj = candidate
      } else {
        break
      } */
    }
    if (value) {
        obj[prop] = value
        return obj
    }
    switch (command) {
        case "delete":
            delete obj[prop]
            return
        default: 
            break
    }
    return obj
}

//nestObj 사용 예시:
/* var obj = {
    foo: {
        bar: {
        baz: 'x'
        }
    }
};

nestedObj(obj, ["foo", "bar", "baz"], 'y'); */