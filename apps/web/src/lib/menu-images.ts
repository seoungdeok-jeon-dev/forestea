/**
 * Fallback image matching by item name when an explicit catalog `image` is absent.
 * Rules are ordered specific → generic; the first match wins.
 */
const IMAGE_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [/pistachio\s*cream/i, "/images/menu/coffee/pistachio-cream-top-latte.png"],
  [/corn\s*cream/i, "/images/menu/coffee/corn-cream-top-latte.png"],
  [/chestnut\s*cream/i, "/images/menu/coffee/chestnut-cream-top-latte.png"],
  [/viet\s*cream/i, "/images/menu/coffee/viet-cream-top-latte.png"],
  [/white\s*mocha/i, "/images/menu/coffee/white-mocha-latte.png"],
  [/mocha/i, "/images/menu/coffee/mocha-latte.png"],
  [/americano/i, "/images/menu/coffee/americano.png"],
  [/latte/i, "/images/menu/coffee/latte.png"],

  [/jasmine\s*matcha/i, "/images/menu/matcha/jasmine-matcha.png"],
  [/matcha\s*ube/i, "/images/menu/matcha/matcha-ube.png"],
  [/coconut\s*ube/i, "/images/menu/matcha/coconut-ube.png"],
  [/thai\s*ube/i, "/images/menu/matcha/thai-ube.png"],
  [/matcha/i, "/images/menu/matcha/jasmine-matcha.png"],

  [/green\s*grape/i, "/images/menu/fruitTeaAde/green-grape-ade.png"],
  [/tangerine/i, "/images/menu/fruitTeaAde/tangerine-ade.png"],

  [/pat\s*bingsu|red\s*bean\s*bingsu/i, "/images/menu/bingsu/classic-pat-bingsu.png"],
  [/strawberry\s*bingsu/i, "/images/menu/bingsu/strawberry-bingsu.png"],
  [/mango\s*bingsu/i, "/images/menu/bingsu/mango-bingsu.png"],
  [/matcha\s*bingsu/i, "/images/menu/bingsu/matcha-bingsu.png"],
  [/oreo\s*bingsu/i, "/images/menu/bingsu/oreo-bingsu.png"],
  [/tiramisu/i, "/images/menu/bingsu/tiramisu-bingsu.png"],
  [/biscoff|banana\s*biscoff/i, "/images/menu/bingsu/banana-biscoff-bingsu.png"],
  [/black\s*sesame/i, "/images/menu/bingsu/black-sesame-bingsu.png"],

  [/creme\s*brulee|crème\s*brûlée/i, "/images/menu/honeyBread/creme-brulee-honey-bread.png"],
  [/corn\s*cheese/i, "/images/menu/honeyBread/corn-cheese-honey-bread.png"],
  [/garlic\s*butter/i, "/images/menu/honeyBread/garlic-butter-honey-bread.png"],
  [/chocolate\s*honey/i, "/images/menu/honeyBread/chocolate-honey-bread.png"],
  [/strawberry\s*honey/i, "/images/menu/honeyBread/strawberry-honey-bread.png"],
  [/honey\s*bread/i, "/images/menu/honeyBread/classic-honey-bread.png"],

  [/dubai\s*chocolate/i, "/images/menu/mochiWaffle/dubai-chocolate-mochi-waffle.png"],
  [/oreo\s*nutella/i, "/images/menu/mochiWaffle/oreo-nutella-mochi-waffle.png"],
  [/apple\s*cinnamon/i, "/images/menu/mochiWaffle/apple-cinnamon-mochi-waffle.png"],
  [/banana\s*mochi/i, "/images/menu/mochiWaffle/banana-mochi-waffle.png"],
  [/strawberry\s*mochi/i, "/images/menu/mochiWaffle/strawberry-mochi-waffle.png"],
  [/mochi\s*waffle/i, "/images/menu/mochiWaffle/strawberry-mochi-waffle.png"],

  [/smoked\s*salmon/i, "/images/menu/bagel/smoked-salmon-bagel.png"],
  [/scallion/i, "/images/menu/bagel/scallion-cream-cheese-bagel.png"],
  [/bagel/i, "/images/menu/bagel/cream-cheese-bagel.png"],
];

export function menuImageFor(name: string, explicit?: string): string | undefined {
  if (explicit) return explicit;
  for (const [pattern, src] of IMAGE_RULES) {
    if (pattern.test(name)) return src;
  }
  return undefined;
}
