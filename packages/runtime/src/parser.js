import * as acorn from 'acorn';

export function parse(source) {
  const ast = {
    script: { src: null, content: '' },
    style: { src: null, content: '' },
    components: [], // { name, src }
    template: [] // The structural blocks
  };

  // Extract <script>
  const scriptMatch = source.match(/<script(?:[^>]*)src-logic=["'](.*?)["'](?:[^>]*)>([\s\S]*?)<\/script>|<script>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    ast.script.src = scriptMatch[1] || null;
    ast.script.content = scriptMatch[2] || scriptMatch[3] || '';
    source = source.replace(scriptMatch[0], '');
  }

  // Extract <style>
  const styleMatch = source.match(/<style(?:[^>]*)src-style=["'](.*?)["'](?:[^>]*)>([\s\S]*?)<\/style>|<style>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    ast.style.src = styleMatch[1] || null;
    ast.style.content = styleMatch[2] || styleMatch[3] || '';
    source = source.replace(styleMatch[0], '');
  }

  // Extract <Use> tags
  const useRegex = /<Use\s+component=["'](.*?)["']\s+name=["'](.*?)["']\s*\/>/g;
  let useMatch;
  while ((useMatch = useRegex.exec(source)) !== null) {
    ast.components.push({ src: useMatch[1], name: useMatch[2] });
  }
  source = source.replace(useRegex, '');

  ast.templateSource = source.trim();
  return ast;
}

export function transformReactivitySyntax(scriptContent) {
  // Pre-process OmniJS syntax into valid JS
  let masked = scriptContent
    .replace(/state\s+\?([a-zA-Z0-9_]+)/g, "let __OMNI_STATE_$1")
    .replace(/\?([a-zA-Z0-9_]+)/g, "__OMNI_USE_$1");

  let ast;
  try {
    ast = acorn.parse(masked, { ecmaVersion: 2022, sourceType: "module" });
  } catch (e) {
    console.error("[OmniJS Parser] Failed to parse script AST:", e);
    return scriptContent; 
  }

  const replacements = [];
  const functionsToAttach = [];

  function walkAST(node, visitors) {
    if (!node) return;
    if (visitors[node.type]) {
      visitors[node.type](node);
    }
    for (const key in node) {
      const val = node[key];
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          for (const child of val) {
            if (child && typeof child.type === 'string') {
              walkAST(child, visitors);
            }
          }
        } else if (typeof val.type === 'string') {
          walkAST(val, visitors);
        }
      }
    }
  }

  walkAST(ast, {
    VariableDeclaration(node) {
      for (const decl of node.declarations) {
        if (decl.id.name && decl.id.name.startsWith('__OMNI_STATE_')) {
          const varName = decl.id.name.replace('__OMNI_STATE_', '');
          
          if (decl.init) {
            replacements.push({
              start: node.start,
              end: decl.init.start,
              text: `context.${varName} = context.createSignal(`
            });
            replacements.push({
              start: decl.init.end,
              end: node.end,
              text: `)` 
            });
          } else {
             replacements.push({
               start: node.start,
               end: node.end,
               text: `context.${varName} = context.createSignal()`
             });
          }
        } else if (decl.init && (decl.init.type === 'ArrowFunctionExpression' || decl.init.type === 'FunctionExpression')) {
          if (decl.id.name) {
            functionsToAttach.push(decl.id.name);
          }
        }
      }
    },
    Identifier(node) {
      if (node.name.startsWith('__OMNI_USE_')) {
        const varName = node.name.replace('__OMNI_USE_', '');
        replacements.push({
          start: node.start,
          end: node.end,
          text: `context.${varName}.value`
        });
      }
    },
    FunctionDeclaration(node) {
      if (node.id && node.id.name) {
        functionsToAttach.push(node.id.name);
      }
    }
  });

  // Apply replacements from bottom to top to avoid offset shifting
  replacements.sort((a, b) => b.start - a.start);
  
  let finalCode = masked;
  for (const r of replacements) {
    finalCode = finalCode.substring(0, r.start) + r.text + finalCode.substring(r.end);
  }

  for (const fn of functionsToAttach) {
    finalCode += `\ncontext.${fn} = ${fn};`;
  }

  return finalCode;
}
