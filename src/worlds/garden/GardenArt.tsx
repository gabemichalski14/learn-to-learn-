import { Art } from '../../art/Art';

/**
 * Sound Garden world art (Level 1) — the illustrated meadow backdrop (PNG), used
 * by every Level-1 game AND the hub. The hand-coded CSS meadow (clouds/hills/
 * butterflies) was retired once the illustration landed.
 */
export function GardenBackdrop() {
  return (
    <div className="gd-bg" aria-hidden="true">
      <Art imageKey="hub:garden:bg" emoji="" alt="" className="hub-bg-art" />
    </div>
  );
}
