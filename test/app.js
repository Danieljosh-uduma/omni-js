import { mount } from "../learning/renderer.js"
import { tokenize } from "../learning/tokenizer.js"
import { parse } from "../learning/parser.js"


const root = document.getElementById("main")

const text = `
    <stack>
        <stack>
            <text as="h1">Hello world</text>
            <action href="he">count</action>
        </stack>
        <stack></stack>
        <stack></stack>

        <collection type="ordered">
            <collection><Text>First Item</Text></collection>
            <collection><Text>Second Item</Text></collection>
        </collection>
    </stack>
`

mount(parse(tokenize(text)), root)