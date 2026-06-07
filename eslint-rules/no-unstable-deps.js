/**
 * ESLint rule: no-unstable-deps
 *
 * Flags values in a React hook dependency array that are created fresh on every
 * render (so the dependency changes every render → risk of an infinite render
 * loop — the exact bug that pegged the CPU on the Home page).
 *
 * Catches, whether written inline in the deps array OR via a local variable:
 *   - object / array / `new` / function literals  (always a new reference)
 *   - calls to known data-reads that return a snapshot object
 *     (loadLearners, getLearner, loadProgress, …) — depend on a stable id
 *     (e.g. learnerId) or a useSyncExternalStore hook from data/store instead.
 *
 * Deliberately does NOT flag plain identifiers/props/primitives or useMemo/
 * useState/useRef results, so it stays false-positive-free.
 */

const HOOKS = new Set([
  'useEffect',
  'useLayoutEffect',
  'useMemo',
  'useCallback',
  'useImperativeHandle',
]);

// Reads that return a fresh data snapshot — should not be a dependency.
const SNAPSHOT_READS = new Set([
  'loadLearners',
  'getLearner',
  'loadProgress',
  'loadEarned',
  'loadSessionLog',
  'loadMastery',
  'recentlyActiveOrder',
]);

const UNSTABLE_LITERAL_TYPES = new Set([
  'ObjectExpression',
  'ArrayExpression',
  'NewExpression',
  'ArrowFunctionExpression',
  'FunctionExpression',
]);

const KIND = {
  ObjectExpression: 'object literal',
  ArrayExpression: 'array literal',
  NewExpression: 'newly-constructed value',
  ArrowFunctionExpression: 'function',
  FunctionExpression: 'function',
};

function calleeName(node) {
  if (!node || node.type !== 'CallExpression') return null;
  const c = node.callee;
  if (c.type === 'Identifier') return c.name;
  if (c.type === 'MemberExpression' && c.property.type === 'Identifier') return c.property.name;
  return null;
}

function resolveInit(context, idNode) {
  const sourceCode = context.sourceCode || context.getSourceCode();
  let scope = sourceCode.getScope ? sourceCode.getScope(idNode) : context.getScope();
  while (scope) {
    const variable = scope.variables.find((v) => v.name === idNode.name);
    if (variable) {
      const def = variable.defs[variable.defs.length - 1];
      if (def && def.node && def.node.type === 'VariableDeclarator') return def.node.init;
      return null;
    }
    scope = scope.upper;
  }
  return null;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow values that are recreated every render (object/array/function literals, snapshot reads) in React hook dependency arrays.',
    },
    schema: [],
    messages: {
      literal:
        'Unstable dependency: a {{kind}} is created fresh every render, so this dependency changes on every render (risking an infinite render loop). Move it out of render, memoize it, or depend on a primitive instead.',
      snapshot:
        '`{{name}}()` returns a fresh data snapshot, not a stable input — depending on it changes the dependency every render. Depend on the id (e.g. learnerId) or a data/store hook instead.',
    },
  },
  create(context) {
    function checkElement(el) {
      if (!el) return;
      if (UNSTABLE_LITERAL_TYPES.has(el.type)) {
        context.report({ node: el, messageId: 'literal', data: { kind: KIND[el.type] } });
        return;
      }
      if (el.type === 'CallExpression') {
        const name = calleeName(el);
        if (name && SNAPSHOT_READS.has(name)) {
          context.report({ node: el, messageId: 'snapshot', data: { name } });
        }
        return;
      }
      if (el.type === 'Identifier') {
        const init = resolveInit(context, el);
        if (!init) return;
        if (UNSTABLE_LITERAL_TYPES.has(init.type)) {
          context.report({ node: el, messageId: 'literal', data: { kind: KIND[init.type] } });
        } else if (init.type === 'CallExpression') {
          const name = calleeName(init);
          if (name && SNAPSHOT_READS.has(name)) {
            context.report({ node: el, messageId: 'snapshot', data: { name } });
          }
        }
      }
    }

    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier' || !HOOKS.has(node.callee.name)) return;
        if (node.arguments.length < 2) return;
        const deps = node.arguments[node.arguments.length - 1];
        if (!deps || deps.type !== 'ArrayExpression') return;
        for (const el of deps.elements) checkElement(el);
      },
    };
  },
};
