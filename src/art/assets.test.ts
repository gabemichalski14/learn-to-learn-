import { describe, it, expect } from 'vitest';
import { artSrc } from './assets';

describe('art assets — key → path', () => {
  it('resolves namespaced keys to /art/<group>/<id>-<variant>.png', () => {
    expect(artSrc('char:patch:cheer')).toBe('/art/char/patch-cheer.png');
    expect(artSrc('char:moss:calm')).toBe('/art/char/moss-calm.png');
    expect(artSrc('hub:workshop:bg')).toBe('/art/hub/workshop-bg.png');
    expect(artSrc('ui:level-3')).toBe('/art/ui/level-3.png');
    expect(artSrc('fx:sound-flower')).toBe('/art/fx/sound-flower.png');
  });
});
