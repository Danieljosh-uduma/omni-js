import { mount } from "./renderer.js"
import { tokenize } from "./tokenizer.js"
import { parse } from "./parser.js"


const root = document.getElementById("main")

const text = `
    <stack>
        <stack>
            <text as="h1">Hello world</text>
            <action href="he">count</action>
        </stack>
        <stack></stack>
        <stack></stack>
    </stack>
`

mount(parse(tokenize(text)), root)