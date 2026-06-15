import { parse, transformReactivitySyntax } from '@omni/runtime/src/parser.js';
import { readFileSync } from 'fs';
import path from 'path';

// Note: A real compiler would parse templateSource into an AST and generate optimal JS.
// For this MVP, we use JSDOM or just pass the template string to a bundled renderer,
// but let's do a naive string-to-DOM-instruction compiler to meet the "Static Optimization" requirement.

export function compileOmni(source, filePath) {
  const ast = parse(source);
  const jsLogic = transformReactivitySyntax(ast.script.content);
  
  const imports = ast.components.map(c => {
    const absTarget = path.resolve(process.cwd(), c.src);
    const dir = path.dirname(filePath);
    let relativePath = path.relative(dir, absTarget);
    if (!relativePath.startsWith('.') && !relativePath.startsWith('/') && !relativePath.startsWith('\\')) {
      relativePath = './' + relativePath;
    }
    relativePath = relativePath.replace(/\\/g, '/');
    const compIdentifier = `OMNI_COMP_${c.name.replace(/[^a-zA-Z0-9_]/g, '_')}`;
    return `import ${compIdentifier} from '${relativePath}';`;
  }).join('\n');

  return `
    import { createSignal, effect } from '@omni/runtime/src/reactivity.js';
    import { render } from '@omni/runtime/src/renderer.js';
    import { navigate, getRouterSignal, beforeEach } from '@omni/runtime/src/router.js';
    import { createResource } from '@omni/runtime/src/resource.js';
    import { useForm } from '@omni/runtime/src/form.js';
    ${imports}

    export default function mount(container, props = {}, parentContext = null) {
      if (!window.globalOmniContext) {
        window.globalOmniContext = {
          currentPage: getRouterSignal()
        };
      }
      const context = { createSignal, effect, createResource, useForm, navigate, getRouterSignal, beforeEach, props, ...window.globalOmniContext };
      context.parentContext = parentContext;
      context.provide = (key, value) => {
        if (!context.provides) context.provides = {};
        context.provides[key] = value;
      };
      context.inject = (key) => {
        let parent = parentContext;
        while (parent) {
          if (parent.provides && key in parent.provides) {
            return parent.provides[key];
          }
          parent = parent.parentContext;
        }
        console.warn('[OmniJS] Context key "' + key + '" not found in parent ancestry.');
        return undefined;
      };
      const log = (...args) => console.log('[OmniJS]', ...args);
      context.log = log;
      
      const { navigate: _nav, getRouterSignal: _getSig, provide, inject } = context;
      
      ${jsLogic.replace(/const log = context\.log;/g, '')}

      // Inject CSS
      const styleContent = ${JSON.stringify(ast.style.content)};
      // Use a hash of the content to prevent duplicate style injections for the same component
      const styleHash = 'omni-style-' + Math.abs(styleContent.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));
      if (styleContent && !document.getElementById(styleHash)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleHash;
        styleEl.textContent = styleContent;
        document.head.appendChild(styleEl);
      }

      const ast = {
        templateSource: ${JSON.stringify(ast.templateSource)},
        components: [
          ${ast.components.map(c => `{ name: '${c.name}', mount: OMNI_COMP_${c.name.replace(/[^a-zA-Z0-9_]/g, '_')} }`).join(',\n')}
        ]
      };

      render(ast, context, container);
    }
  `;
}

export const omniEsbuildPlugin = {
  name: 'omni',
  setup(build) {
    build.onLoad({ filter: /\.omni$/ }, async (args) => {
      const source = readFileSync(args.path, 'utf8');
      const contents = compileOmni(source, args.path);
      return { contents, loader: 'js' };
    });
  },
};
