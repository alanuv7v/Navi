export default  {
    DOM: {},
    DB: null,
    root: {
        handle: null,
        metadata: null,
    },
    docs: null,
    Editor: null,
    settings: {
        handle: null,
        parsed: null,
        default: {
            yamlParseRules: {
                "body": str => str[0] === "_",
                "non-mirrored link": str => str[0]==="@" && str[1]==="!"
            },
            queryParseRuels: {
                divider: "/"
            }
        }
    }
}