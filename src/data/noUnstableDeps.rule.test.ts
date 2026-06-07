import { describe, it, expect } from 'vitest';
import { Linter } from 'eslint';
// @ts-expect-error — plain JS ESLint rule, no types
import rule from '../../eslint-rules/no-unstable-deps.js';

const linter = new Linter();

function lint(code: string) {
  return linter.verify(code, {
    plugins: { local: { rules: { 'no-unstable-deps': rule } } },
    rules: { 'local/no-unstable-deps': 'error' },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  });
}

describe('no-unstable-deps lint rule', () => {
  it('allows stable dependencies', () => {
    expect(lint('useEffect(() => {}, [learnerId])')).toHaveLength(0);
    expect(lint('useEffect(() => {}, [])')).toHaveLength(0);
    expect(lint('useMemo(() => x, [a, b])')).toHaveLength(0);
    // useMemo result is stable — must not be flagged (no false positive)
    expect(lint('const id = useMemo(() => 1, []); useEffect(() => {}, [id])')).toHaveLength(0);
    // looking the learner up INSIDE the effect (the correct pattern) is fine
    expect(lint('useEffect(() => { const l = getLearner(id); }, [id])')).toHaveLength(0);
  });

  it('flags an inline object/array/function in a dep array', () => {
    expect(lint('useEffect(() => {}, [{ a: 1 }])')[0]?.messageId).toBe('literal');
    expect(lint('useMemo(() => x, [[1, 2]])')[0]?.messageId).toBe('literal');
    expect(lint('useEffect(() => {}, [() => {}])')[0]?.messageId).toBe('literal');
  });

  it('flags a variable holding an object/array literal used as a dep', () => {
    const msgs = lint('const opts = { a: 1 }; useEffect(() => {}, [opts])');
    expect(msgs).toHaveLength(1);
    expect(msgs[0].messageId).toBe('literal');
  });

  it('flags a snapshot read used as a dep (inline and via variable)', () => {
    expect(lint('useEffect(() => {}, [getLearner(id)])')[0]?.messageId).toBe('snapshot');
    const viaVar = lint('const learner = getLearner(id); useEffect(() => {}, [learner])');
    expect(viaVar).toHaveLength(1);
    expect(viaVar[0].messageId).toBe('snapshot');
  });
});
