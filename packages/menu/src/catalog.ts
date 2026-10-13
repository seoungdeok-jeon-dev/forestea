import type {
  MenuCategory,
  MenuItem,
  MenuItemDetail,
  MenuModifierGroup,
} from "./types.js";

const TEMP_GROUP: MenuModifierGroup = {
  id: "mod-temp",
  name: "Temperature",
  minRequired: 1,
  maxAllowed: 1,
  modifiers: [
    { id: "temp-hot", name: "Hot", price: 0, available: true },
    { id: "temp-iced", name: "Iced", price: 0, available: true },
  ],
};

const SWEETNESS_GROUP: MenuModifierGroup = {
  id: "mod-sweetness",
  name: "Sweetness",
  minRequired: 1,
  maxAllowed: 1,
  modifiers: [
    { id: "sweet-0", name: "0% · No sugar", price: 0, available: true },
    { id: "sweet-50", name: "50% · Half sweet", price: 0, available: true },
    { id: "sweet-100", name: "100% · Full sweet", price: 0, available: true },
  ],
};

const DRINK_GROUPS: MenuModifierGroup[] = [TEMP_GROUP, SWEETNESS_GROUP];
const ADE_GROUPS: MenuModifierGroup[] = [SWEETNESS_GROUP];
const FOOD_GROUPS: MenuModifierGroup[] = [];

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "cat-coffee", name: "Coffee", sortOrder: 1 },
  { id: "cat-matcha", name: "Matcha & Ube", sortOrder: 2 },
  { id: "cat-fruit", name: "Fruit Tea & Ade", sortOrder: 3 },
  { id: "cat-bingsu", name: "Bingsu", sortOrder: 4 },
  { id: "cat-honey-bread", name: "Honey Bread", sortOrder: 5 },
  { id: "cat-mochi-waffle", name: "Mochi Waffle", sortOrder: 6 },
  { id: "cat-bagel", name: "Bagel", sortOrder: 7 },
];

type ModifierKind = "drink" | "ade" | "food";

interface CatalogEntry {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  categoryId: string;
  kind: ModifierKind;
  showcaseRank?: number;
}

const IMG = "/images/menu" as const;

const ENTRIES: CatalogEntry[] = [
  // ——— Coffee ———
  {
    id: "americano",
    name: "Americano",
    price: 450,
    description: "Clean espresso stretched with hot or iced water. Bright and straightforward.",
    image: `${IMG}/coffee/americano.png`,
    categoryId: "cat-coffee",
    kind: "drink",
  },
  {
    id: "latte",
    name: "Latte",
    price: 525,
    description: "Silky steamed milk folded over a double shot. Soft, balanced, everyday.",
    image: `${IMG}/coffee/latte.png`,
    categoryId: "cat-coffee",
    kind: "drink",
    showcaseRank: 4,
  },
  {
    id: "mocha-latte",
    name: "Mocha Latte",
    price: 575,
    description: "Espresso, cocoa, and milk with a gentle chocolate finish.",
    image: `${IMG}/coffee/mocha-latte.png`,
    categoryId: "cat-coffee",
    kind: "drink",
  },
  {
    id: "white-mocha-latte",
    name: "White Mocha Latte",
    price: 575,
    description: "White chocolate mocha over espresso and milk. Sweeter and creamier.",
    image: `${IMG}/coffee/white-mocha-latte.png`,
    categoryId: "cat-coffee",
    kind: "drink",
  },
  {
    id: "pistachio-cream-top-latte",
    name: "Pistachio Cream Top Latte",
    price: 650,
    description: "Espresso latte crowned with pistachio cream and crushed nuts.",
    image: `${IMG}/coffee/pistachio-cream-top-latte.png`,
    categoryId: "cat-coffee",
    kind: "drink",
    showcaseRank: 1,
  },
  {
    id: "corn-cream-top-latte",
    name: "Corn Cream Top Latte",
    price: 650,
    description: "Sweet corn cream floated over a classic latte. Soft and toasty.",
    image: `${IMG}/coffee/corn-cream-top-latte.png`,
    categoryId: "cat-coffee",
    kind: "drink",
  },
  {
    id: "chestnut-cream-top-latte",
    name: "Chestnut Cream Top Latte",
    price: 650,
    description: "Roasted chestnut cream over espresso and milk. Warm and nutty.",
    image: `${IMG}/coffee/chestnut-cream-top-latte.png`,
    categoryId: "cat-coffee",
    kind: "drink",
  },
  {
    id: "viet-cream-top-latte",
    name: "Viet Cream Top Latte",
    price: 650,
    description: "Vietnamese-style coffee base with a thick sweet cream cap.",
    image: `${IMG}/coffee/viet-cream-top-latte.png`,
    categoryId: "cat-coffee",
    kind: "drink",
  },

  // ——— Matcha & Ube ———
  {
    id: "jasmine-matcha",
    name: "Jasmine Matcha",
    price: 700,
    description: "Ceremonial matcha whisked with jasmine notes. Floral and vivid.",
    image: `${IMG}/matcha/jasmine-matcha.png`,
    categoryId: "cat-matcha",
    kind: "drink",
    showcaseRank: 2,
  },
  {
    id: "matcha-ube",
    name: "Matcha Ube",
    price: 650,
    description: "Layered matcha and purple ube milk. Earthy, sweet, and striking.",
    image: `${IMG}/matcha/matcha-ube.png`,
    categoryId: "cat-matcha",
    kind: "drink",
  },
  {
    id: "coconut-ube",
    name: "Coconut Ube",
    price: 650,
    description: "Creamy ube with coconut milk. Tropical and gently sweet.",
    image: `${IMG}/matcha/coconut-ube.png`,
    categoryId: "cat-matcha",
    kind: "drink",
  },
  {
    id: "thai-ube",
    name: "Thai Ube",
    price: 625,
    description: "Thai tea character blended with ube for a bold purple-orange swirl.",
    image: `${IMG}/matcha/thai-ube.png`,
    categoryId: "cat-matcha",
    kind: "drink",
  },

  // ——— Fruit Tea & Ade ———
  {
    id: "green-grape-ade",
    name: "Green Grape Ade",
    price: 575,
    description: "Chilled green grape ade with bright acidity and a sparkling finish.",
    image: `${IMG}/fruitTeaAde/green-grape-ade.png`,
    categoryId: "cat-fruit",
    kind: "ade",
  },
  {
    id: "tangerine-ade",
    name: "Tangerine Ade",
    price: 575,
    description: "Fresh tangerine ade — citrusy, clean, and lightly sweet.",
    image: `${IMG}/fruitTeaAde/tangerine-ade.png`,
    categoryId: "cat-fruit",
    kind: "ade",
    showcaseRank: 3,
  },

  // ——— Bingsu ———
  {
    id: "classic-pat-bingsu",
    name: "Classic Pat Bingsu",
    price: 1595,
    description: "Shaved ice with sweet red bean, condensed milk, and rice cakes.",
    image: `${IMG}/bingsu/classic-pat-bingsu.png`,
    categoryId: "cat-bingsu",
    kind: "food",
  },
  {
    id: "strawberry-bingsu",
    name: "Strawberry Bingsu",
    price: 1695,
    description: "Milk ice piled with fresh strawberries and strawberry syrup.",
    image: `${IMG}/bingsu/strawberry-bingsu.png`,
    categoryId: "cat-bingsu",
    kind: "food",
  },
  {
    id: "mango-bingsu",
    name: "Mango Bingsu",
    price: 1695,
    description: "Tropical mango over fluffy milk ice with mango cubes.",
    image: `${IMG}/bingsu/mango-bingsu.png`,
    categoryId: "cat-bingsu",
    kind: "food",
  },
  {
    id: "matcha-bingsu",
    name: "Matcha Bingsu",
    price: 1695,
    description: "Matcha milk ice with red bean, mochi, and a dusting of green tea.",
    image: `${IMG}/bingsu/matcha-bingsu.png`,
    categoryId: "cat-bingsu",
    kind: "food",
  },
  {
    id: "oreo-bingsu",
    name: "Oreo Bingsu",
    price: 1695,
    description: "Cookies-and-cream milk ice with crushed Oreo and chocolate drizzle.",
    image: `${IMG}/bingsu/oreo-bingsu.png`,
    categoryId: "cat-bingsu",
    kind: "food",
  },
  {
    id: "tiramisu-bingsu",
    name: "Tiramisu Bingsu",
    price: 1795,
    description: "Coffee-soaked layers, mascarpone cream, and cocoa over shaved ice.",
    image: `${IMG}/bingsu/tiramisu-bingsu.png`,
    categoryId: "cat-bingsu",
    kind: "food",
  },
  {
    id: "banana-biscoff-bingsu",
    name: "Banana Biscoff Bingsu",
    price: 1795,
    description: "Banana, Biscoff crumble, and caramel over milk ice.",
    image: `${IMG}/bingsu/banana-biscoff-bingsu.png`,
    categoryId: "cat-bingsu",
    kind: "food",
  },
  {
    id: "black-sesame-bingsu",
    name: "Black Sesame Bingsu",
    price: 1695,
    description: "Toasty black sesame milk ice with sesame brittle and condensed milk.",
    image: `${IMG}/bingsu/black-sesame-bingsu.png`,
    categoryId: "cat-bingsu",
    kind: "food",
  },

  // ——— Honey Bread ———
  {
    id: "classic-honey-bread",
    name: "Classic Honey Bread",
    price: 995,
    description: "Thick-cut toast brushed with honey butter until golden and glossy.",
    image: `${IMG}/honeyBread/classic-honey-bread.png`,
    categoryId: "cat-honey-bread",
    kind: "food",
  },
  {
    id: "chocolate-honey-bread",
    name: "Chocolate Honey Bread",
    price: 1095,
    description: "Honey toast with melted chocolate and a soft cocoa finish.",
    image: `${IMG}/honeyBread/chocolate-honey-bread.png`,
    categoryId: "cat-honey-bread",
    kind: "food",
  },
  {
    id: "strawberry-honey-bread",
    name: "Strawberry Honey Bread",
    price: 1195,
    description: "Honey toast topped with strawberries and lightly sweet cream.",
    image: `${IMG}/honeyBread/strawberry-honey-bread.png`,
    categoryId: "cat-honey-bread",
    kind: "food",
  },
  {
    id: "corn-cheese-honey-bread",
    name: "Corn Cheese Honey Bread",
    price: 1195,
    description: "Savory-sweet corn and melted cheese over honey butter toast.",
    image: `${IMG}/honeyBread/corn-cheese-honey-bread.png`,
    categoryId: "cat-honey-bread",
    kind: "food",
  },
  {
    id: "garlic-butter-honey-bread",
    name: "Garlic Butter Honey Bread",
    price: 1095,
    description: "Garlic butter honey toast — fragrant, rich, and a little savory.",
    image: `${IMG}/honeyBread/garlic-butter-honey-bread.png`,
    categoryId: "cat-honey-bread",
    kind: "food",
  },
  {
    id: "creme-brulee-honey-bread",
    name: "Crème Brûlée Honey Bread",
    price: 1295,
    description: "Honey toast finished with a brûléed sugar crust and custard cream.",
    image: `${IMG}/honeyBread/creme-brulee-honey-bread.png`,
    categoryId: "cat-honey-bread",
    kind: "food",
    showcaseRank: 5,
  },

  // ——— Mochi Waffle ———
  {
    id: "strawberry-mochi-waffle",
    name: "Strawberry Mochi Waffle",
    price: 1095,
    description: "Chewy mochi waffle with strawberries and lightly whipped cream.",
    image: `${IMG}/mochiWaffle/strawberry-mochi-waffle.png`,
    categoryId: "cat-mochi-waffle",
    kind: "food",
  },
  {
    id: "banana-mochi-waffle",
    name: "Banana Mochi Waffle",
    price: 1095,
    description: "Mochi waffle with caramelized banana and a soft cream finish.",
    image: `${IMG}/mochiWaffle/banana-mochi-waffle.png`,
    categoryId: "cat-mochi-waffle",
    kind: "food",
  },
  {
    id: "oreo-nutella-mochi-waffle",
    name: "Oreo Nutella Mochi Waffle",
    price: 1195,
    description: "Nutella-spread mochi waffle with crushed Oreo.",
    image: `${IMG}/mochiWaffle/oreo-nutella-mochi-waffle.png`,
    categoryId: "cat-mochi-waffle",
    kind: "food",
  },
  {
    id: "apple-cinnamon-mochi-waffle",
    name: "Apple Cinnamon Mochi Waffle",
    price: 1095,
    description: "Warm apple-cinnamon topping over a chewy mochi waffle.",
    image: `${IMG}/mochiWaffle/apple-cinnamon-mochi-waffle.png`,
    categoryId: "cat-mochi-waffle",
    kind: "food",
  },
  {
    id: "dubai-chocolate-mochi-waffle",
    name: "Dubai Chocolate Mochi Waffle",
    price: 1295,
    description: "Pistachio-kunafa chocolate layered on a mochi waffle.",
    image: `${IMG}/mochiWaffle/dubai-chocolate-mochi-waffle.png`,
    categoryId: "cat-mochi-waffle",
    kind: "food",
  },

  // ——— Bagel ———
  {
    id: "cream-cheese-bagel",
    name: "Cream Cheese Bagel",
    price: 695,
    description: "Toasted bagel with a generous schmear of cream cheese.",
    image: `${IMG}/bagel/cream-cheese-bagel.png`,
    categoryId: "cat-bagel",
    kind: "food",
  },
  {
    id: "scallion-cream-cheese-bagel",
    name: "Scallion Cream Cheese Bagel",
    price: 745,
    description: "Bagel with scallion cream cheese — bright and savory.",
    image: `${IMG}/bagel/scallion-cream-cheese-bagel.png`,
    categoryId: "cat-bagel",
    kind: "food",
  },
  {
    id: "smoked-salmon-bagel",
    name: "Smoked Salmon Bagel",
    price: 1095,
    description: "Smoked salmon, cream cheese, and classic bagel toppings.",
    image: `${IMG}/bagel/smoked-salmon-bagel.png`,
    categoryId: "cat-bagel",
    kind: "food",
  },
];

function groupsFor(kind: ModifierKind): MenuModifierGroup[] {
  if (kind === "drink") return DRINK_GROUPS;
  if (kind === "ade") return ADE_GROUPS;
  return FOOD_GROUPS;
}

export const MENU_ITEMS: MenuItem[] = ENTRIES.map((entry) => ({
  id: entry.id,
  name: entry.name,
  price: entry.price,
  description: entry.description,
  image: entry.image,
  categoryIds: [entry.categoryId],
  available: true,
}));

const DETAIL_BY_ID = new Map<string, MenuItemDetail>(
  ENTRIES.map((entry) => [
    entry.id,
    {
      id: entry.id,
      name: entry.name,
      price: entry.price,
      description: entry.description,
      image: entry.image,
      categoryIds: [entry.categoryId],
      available: true,
      modifierGroups: groupsFor(entry.kind),
    },
  ]),
);

/** Also accept legacy `demo-*` ids from older carts / bookmarks. */
function resolveId(itemId: string): string {
  return itemId.startsWith("demo-") ? itemId.slice("demo-".length) : itemId;
}

export function getMenuCatalog(): {
  categories: MenuCategory[];
  items: MenuItem[];
} {
  return { categories: MENU_CATEGORIES, items: MENU_ITEMS };
}

export function getMenuItemDetail(itemId: string): MenuItemDetail | undefined {
  return DETAIL_BY_ID.get(resolveId(itemId));
}

export const SHOWCASE_ITEM_IDS: string[] = ENTRIES.filter(
  (entry) => entry.showcaseRank !== undefined,
)
  .sort((a, b) => a.showcaseRank! - b.showcaseRank!)
  .map((entry) => entry.id);
