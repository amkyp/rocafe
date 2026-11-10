/* ============================================================
   RO CAFE MENU  (edit this file to change the menu)
   Sections in order; each item is one entry:
     id        fixed, unique, never shown (links the bill, filters and cards to the item)
     fa, en    names        price  in thousand toman (265 = 265,000 toman)
     options   instead of price: choices with their own price (e.g. espresso beans)
     icon      drawing shown when there is no photo (see ICONS in assets/js/render.js)
     sub       short line under the name (a section with sub: "ingredients" shows it
               on the item card as the ingredients)
     desc      description on the item card
     tags      pm = plant milk, cf = caffeine-free, n = contains nuts
     photos    photo names, the first is the list photo; the photo preparation script makes
               them square in several sizes in img/ and lists them in data/photos.js
   ============================================================ */
export const MENU = [
 { id: "coffee", fa: "قهوه", en: "Coffee", tint: "coffee",
   items: [
     { id: "espresso", fa: "اسپرسو", en: "Espresso", options: [{ fa: "روبوستا", en: "Robusta", price: 185 }, { fa: "۸۰٪ عربیکا", en: "80% Arabica", price: 200 }, { fa: "۱۰۰٪ عربیکا", en: "100% Arabica", price: 220 }], icon: "espresso", desc: { fa: "عصاره‌ی غلیظ قهوه؛ دانه را خودتان انتخاب کنید.", en: "A short, strong coffee shot. Pick your bean." }, photos: ["espresso_1"] },
     { id: "americano", fa: "آمریکانو", en: "Americano", price: 210, icon: "cup", desc: { fa: "اسپرسو رقیق‌شده با آب داغ.", en: "Espresso topped up with hot water." }, photos: ["americano_2"] },
     { id: "black-eye", fa: "بلک آی", en: "Black Eye", price: 310, icon: "cup", sub: { fa: "قهوه‌ی دمی با دو شات اسپرسو", en: "Brewed coffee with two espresso shots" }, desc: { fa: "قهوه‌ی دمی با دو شات اسپرسو.", en: "Brewed coffee with two espresso shots." }, photos: ["brewedmug_0"] },
     { id: "cortado", fa: "کورتادو", en: "Cortado", price: 250, icon: "espresso", desc: { fa: "اسپرسو با مقدار برابر شیر داغ.", en: "Espresso cut with an equal amount of warm milk." }, photos: ["cortado_2"] },
     { id: "cappuccino", fa: "کاپوچینو", en: "Cappuccino", price: 250, icon: "cup", desc: { fa: "اسپرسو با شیر داغ و فوم پرحجم.", en: "Espresso with steamed milk and a thick layer of foam." }, photos: ["cappuccino_3"] },
     { id: "latte", fa: "لاته", en: "Latte", price: 265, icon: "glass", desc: { fa: "اسپرسو با شیر داغ زیاد و فوم نازک.", en: "Espresso with plenty of steamed milk and light foam." }, photos: ["ro-latte-1","ro-latte-2","ro-latte-3"] },
     { id: "caramel-macchiato", fa: "کارامل ماکیاتو", en: "Caramel Macchiato", price: 295, icon: "glass", desc: { fa: "شیر، اسپرسو و سس کارامل.", en: "Milk, espresso and caramel sauce." }, photos: ["caramelmac_2"] },
     { id: "mocha", fa: "موکا", en: "Mocha", price: 295, icon: "glass", desc: { fa: "اسپرسو، شکلات و شیر داغ.", en: "Espresso, chocolate and steamed milk." }, photos: ["mocha_2"] },
     { id: "vegan-coffee", fa: "وگن کافی", en: "Vegan Coffee", price: 320, icon: "glass", sub: { fa: "با شیر گیاهی", en: "With plant milk" }, desc: { fa: "قهوه با شیر گیاهی.", en: "Coffee made with plant milk." }, tags: ["pm"], photos: ["latte_0"] },
   ] },
 { id: "brew", fa: "دم‌آوری", en: "Brew bar", tint: "brew",
   items: [
     { id: "turkish-coffee", fa: "قهوه ترک", en: "Turkish Coffee", price: 190, icon: "cezve", desc: { fa: "قهوه‌ی آسیاب‌شده‌ی بسیار ریز که در جزوه دم می‌کشد.", en: "Very finely ground coffee brewed in a cezve." }, photos: ["turkish_2"] },
     { id: "greek-coffee", fa: "قهوه یونانی", en: "Greek Coffee", price: 240, icon: "cezve", desc: { fa: "قهوه‌ی جوشیده در جزوه به سبک یونانی.", en: "Greek-style coffee simmered in a small pot." }, photos: ["turkish_1"] },
     { id: "french-press", fa: "فرانسه", en: "French Press", price: 260, icon: "mug", desc: { fa: "قهوه‌ی دم‌کشیده در فرنچ‌پرس؛ پرعطر و پربدنه.", en: "Coffee steeped in a French press. Full-bodied." }, photos: ["frenchpress_1"] },
     { id: "v60", fa: "وی‌شصت", en: "V60", price: 310, icon: "dripper", desc: { fa: "دم‌آوری دستی با قیف وی‌شصت؛ روشن و شفاف.", en: "Hand pour-over through a V60. Clean and bright." }, photos: ["v60_1"] },
     { id: "aeropress", fa: "ایروپرس", en: "AeroPress", price: 310, icon: "dripper", desc: { fa: "دم‌آوری با فشار دست در ایروپرس.", en: "Brewed under gentle hand pressure in an AeroPress." }, photos: ["aeropress_0"] },
     { id: "chemex", fa: "کمکس", en: "Chemex", price: 320, icon: "dripper", desc: { fa: "دم‌آوری دستی در کمکس با فیلتر کاغذی ضخیم.", en: "Pour-over in a Chemex with a thick paper filter." }, photos: ["chemex_1"] },
     { id: "clever-hand-brew", fa: "کلور هند برو", en: "Clever Hand Brew", price: 310, icon: "dripper", desc: { fa: "دم‌آوری با قیف کلور: غوطه‌وری و سپس صاف کردن.", en: "Clever dripper: steeped, then drained through a filter." }, photos: ["clever_0"] },
     { id: "cold-brew", fa: "کلد برو", en: "Cold Brew", price: 350, icon: "coldbrew", desc: { fa: "قهوه‌ای که ساعت‌ها در آب سرد دم کشیده؛ نرم و کم‌ترش.", en: "Coffee steeped in cold water for hours. Smooth, low acidity." }, photos: ["coldbrew2_1"] },
   ] },
 { id: "warm", fa: "شکلات و شیر", en: "Chocolate & milk", tint: "warm",
   items: [
     { id: "hot-chocolate", fa: "هات چاکلت", en: "Hot Chocolate", price: 270, icon: "mug", desc: { fa: "شکلات داغ با شیر.", en: "Hot chocolate made with milk." }, photos: ["hotchoc_3"] },
     { id: "dark-chocolate", fa: "دارک چاکلت", en: "Dark Chocolate", price: 300, icon: "mug", desc: { fa: "نوشیدنی شکلات تلخ.", en: "A rich dark chocolate drink." }, photos: ["ro-dark-chocolate-1","ro-dark-chocolate-2"] },
     { id: "hot-nutella", fa: "هات نوتلا", en: "Hot Nutella", price: 365, icon: "mug", desc: { fa: "شیر داغ با نوتلا.", en: "Hot milk blended with Nutella." }, tags: ["n"], photos: ["hotchoc_0"] },
     { id: "hot-pistachio", fa: "هات پسته", en: "Hot Pistachio", price: 355, icon: "mug", desc: { fa: "نوشیدنی گرم پسته.", en: "A warm pistachio drink." }, tags: ["n"], photos: ["matcha_2"] },
     { id: "masala-chai", fa: "ماسالا", en: "Masala Chai", price: 220, icon: "mug", desc: { fa: "چای و شیر با ادویه‌های گرم.", en: "Tea and milk with warm spices." }, photos: ["chai_2"] },
     { id: "saffron-honey-milk-tea", fa: "شیر چای عسل زعفران", en: "Saffron Honey Milk Tea", price: 275, icon: "mug", desc: { fa: "شیر و چای با عسل و زعفران.", en: "Milk tea with honey and saffron." }, photos: ["saffron_0"] },
     { id: "vegan-caramel-milk", fa: "شیر کارامل وگن", en: "Vegan Caramel Milk", price: 250, icon: "mug", desc: { fa: "شیر گیاهی با کارامل.", en: "Plant milk with caramel." }, tags: ["pm","cf"], photos: ["carlatte_0"] },
     { id: "honey-cinnamon-milk", fa: "شیر عسل دارچین", en: "Honey Cinnamon Milk", price: 220, icon: "mug", desc: { fa: "شیر داغ با عسل و دارچین.", en: "Hot milk with honey and cinnamon." }, tags: ["cf"], photos: ["cinnmilk_1"] },
   ] },
 { id: "chai", fa: "چای", en: "Tea", tint: "tea",
   items: [
     { id: "persian-tea-with-baklava", fa: "چای ایرانی با باقلوا", en: "Persian Tea with Baklava", price: 160, icon: "istikan", desc: { fa: "چای ایرانی همراه باقلوا.", en: "Persian black tea served with baklava." }, tags: ["n"], photos: ["ro-tea-baklava-1","ro-tea-baklava-2","ro-tea-baklava-3"] },
     { id: "persian-tea-glass", fa: "چای کمر باریک", en: "Persian Tea (glass)", price: 110, icon: "istikan", desc: { fa: "چای ایرانی در استکان کمرباریک.", en: "Persian black tea in a traditional slim glass." }, photos: ["persiantea_0"] },
   ] },
 { id: "infusion", fa: "دمنوش‌ها", en: "Herbal infusions", tint: "tea", sub: "ingredients",
   items: [
     { id: "moon-gold-rose", fa: "دمنوش مون گلد رز", en: "Moon Gold Rose", price: 230, icon: "teapot", sub: { fa: "لیمو، به، چای ترش", en: "Lemon, quince, hibiscus" }, tags: ["cf"], photos: ["rosetea_0"] },
     { id: "queen-berry", fa: "دمنوش کوئین بری", en: "Queen Berry", price: 230, icon: "teapot", sub: { fa: "چای ترش، توت‌فرنگی، گل سرخ، کرنبری، زرشک", en: "Hibiscus, strawberry, rose, cranberry, barberry" }, tags: ["cf"], photos: ["hibiscus_1"] },
     { id: "apple-paradise", fa: "دمنوش اپل پارادایس", en: "Apple Paradise", price: 230, icon: "teapot", sub: { fa: "به، سیب، دارچین", en: "Quince, apple, cinnamon" }, tags: ["cf"], photos: ["appletea_1"] },
     { id: "calm", fa: "دمنوش آرامش", en: "Calm", price: 230, icon: "teapot", sub: { fa: "گل گاوزبان، بهارنارنج، اسطوخودوس", en: "Borage, orange blossom, lavender" }, tags: ["cf"], photos: ["ro-calm-1","ro-calm-2"] },
     { id: "strawberry-kiss", fa: "دمنوش استرابری کیس", en: "Strawberry Kiss", price: 230, icon: "teapot", sub: { fa: "انبه، آناناس، توت‌فرنگی", en: "Mango, pineapple, strawberry" }, tags: ["cf"], photos: ["hibiscus_0"] },
     { id: "moroccan-mint", fa: "دمنوش موروکن مینت", en: "Moroccan Mint", price: 230, icon: "teapot", sub: { fa: "نعنای فلفلی", en: "Peppermint" }, tags: ["cf"], photos: ["mint_0"] },
     { id: "lemongrass-ginger", fa: "دمنوش لمون گرس جینجر", en: "Lemongrass Ginger", price: 240, icon: "teapot", sub: { fa: "به‌لیمو، زنجبیل، نعناع", en: "Lemon verbena, ginger, mint" }, tags: ["cf"], photos: ["ginger_1"] },
     { id: "victoria-sunset", fa: "دمنوش ویکتوریا سانست", en: "Victoria Sunset", price: 240, icon: "teapot", sub: { fa: "زردچوبه، شیرین‌بیان، دارچین، زنجبیل، رازیانه", en: "Turmeric, licorice, cinnamon, ginger, fennel" }, tags: ["cf"], photos: ["turmeric_1"] },
     { id: "royal-jasmine", fa: "دمنوش رویال جاسمین", en: "Royal Jasmine", price: 240, icon: "teapot", sub: { fa: "چای سبز، گل یاس", en: "Green tea, jasmine" }, photos: ["green_1"] },
     { id: "golden-vanilla", fa: "دمنوش گلدن وانیلا", en: "Golden Vanilla", price: 230, icon: "teapot", sub: { fa: "میخک، دارچین، وانیل، سیب، شیرین‌بیان", en: "Clove, cinnamon, vanilla, apple, licorice" }, tags: ["cf"], photos: ["appletea_2"] },
   ] },
 { id: "iced", fa: "آیس کافی", en: "Iced coffee", tint: "iced",
   items: [
     { id: "iced-americano", fa: "آیس آمریکانو", en: "Iced Americano", price: 210, icon: "iced", desc: { fa: "اسپرسو، آب و یخ.", en: "Espresso, water and ice." }, photos: ["icedam_0"] },
     { id: "iced-latte", fa: "آیس لاته", en: "Iced Latte", price: 265, icon: "iced", desc: { fa: "اسپرسو و شیر سرد روی یخ.", en: "Espresso and cold milk over ice." }, photos: ["iced_1"] },
     { id: "iced-mocha", fa: "آیس موکا", en: "Iced Mocha", price: 295, icon: "iced", desc: { fa: "اسپرسو، شکلات و شیر سرد روی یخ.", en: "Espresso, chocolate and cold milk over ice." }, photos: ["iced_0"] },
     { id: "iced-caramel", fa: "آیس کارامل", en: "Iced Caramel", price: 295, icon: "iced", desc: { fa: "اسپرسو، شیر سرد و کارامل روی یخ.", en: "Espresso, cold milk and caramel over ice." }, photos: ["caramelmac_0"] },
     { id: "frappuccino", fa: "فراپاچینو", en: "Frappuccino", price: 305, icon: "shake", desc: { fa: "قهوه‌ی یخی میکس‌شده و خامه‌ای.", en: "Blended iced coffee, creamy and cold." }, photos: ["frapp_2"] },
     { id: "iced-fizzy", fa: "آیس فیوزی", en: "Iced Fizzy", price: 285, icon: "iced", photos: ["tonic_1"] },
     { id: "affogato", fa: "آفاگاتو", en: "Affogato", price: 285, icon: "affogato", desc: { fa: "یک اسکوپ بستنی وانیلی با شات اسپرسوی داغ.", en: "A scoop of vanilla ice cream drowned in hot espresso." }, photos: ["affogato_1"] },
     { id: "affogato-your-choice-of-ice-cream", fa: "آفاگاتو (بستنی انتخابی)", en: "Affogato (your choice of ice cream)", price: 335, icon: "affogato", desc: { fa: "آفاگاتو با بستنی به انتخاب شما.", en: "Affogato with the ice cream flavour of your choice." }, photos: ["affogato_2"] },
     { id: "matchagato", fa: "ماچاگاتو", en: "Matchagato", price: 325, icon: "affogato", desc: { fa: "بستنی با ماچا به جای اسپرسو.", en: "Ice cream topped with matcha instead of espresso." }, photos: ["pistgelato_2"] },
     { id: "ro-cafe-bottle", fa: "باتل کافه رو", en: "Ro Cafe Bottle", price: 285, icon: "bottle", photos: ["bottle_1"] },
     { id: "bomb", fa: "بمب", en: "Bomb", price: 320, icon: "bomb", photos: ["frapp_1"] },
   ] },
 { id: "shake", fa: "شیک‌ها", en: "Shakes", tint: "shake",
   items: [
     { id: "chocolate-shake", fa: "شیک شکلات", en: "Chocolate Shake", price: 275, icon: "shake", photos: ["ro-chocolate-shake-1","ro-chocolate-shake-2"] },
     { id: "peanut-spice-shake", fa: "شیک پینات اسپایس", en: "Peanut Spice Shake", price: 325, icon: "shake", tags: ["cf","n"], photos: ["pbshake_2"] },
     { id: "mango-shake", fa: "شیک انبه", en: "Mango Shake", price: 275, icon: "shake", tags: ["cf"], photos: ["mango_1"] },
     { id: "biscuit-shake", fa: "شیک بیسکوییت", en: "Biscuit Shake", price: 315, icon: "shake", tags: ["cf"], photos: ["pbshake_0"] },
     { id: "espresso-cinnamon-shake", fa: "شیک اسپرسو سینامون", en: "Espresso Cinnamon Shake", price: 345, icon: "shake", photos: ["frapp_0"] },
     { id: "nescafe-shake", fa: "شیک نسکافه", en: "Nescafé Shake", price: 325, icon: "shake", photos: ["frapp_3"] },
     { id: "strawberry-shake", fa: "شیک توت‌فرنگی", en: "Strawberry Shake", price: 275, icon: "shake", tags: ["cf"], photos: ["strawshake_0"] },
     { id: "nutella-shake", fa: "شیک نوتلا", en: "Nutella Shake", price: 369, icon: "shake", tags: ["n"], photos: ["ro-nutella-shake-1","ro-nutella-shake-2"] },
     { id: "blueberry-marshmallow-shake", fa: "شیک بلوبری مارشمالو", en: "Blueberry Marshmallow Shake", price: 336, icon: "shake", tags: ["cf"], photos: ["blueberry_0"] },
     { id: "vanilla-shake", fa: "شیک وانیل", en: "Vanilla Shake", price: 261, icon: "shake", tags: ["cf"], photos: ["vanilla_0"] },
     { id: "sour-mix-shake", fa: "شیک معجون ترش", en: "Sour Mix Shake", price: 345, icon: "shake", tags: ["cf"], photos: ["cherry_1"] },
     { id: "pistachio-gelato-shake", fa: "شیک ژلاتو پسته", en: "Pistachio Gelato Shake", price: 699, icon: "shake", tags: ["cf","n"], photos: ["pistshake_2"] },
   ] },
 { id: "cold", fa: "خنک‌ها", en: "Cold drinks", tint: "cold",
   items: [
     { id: "iced-chocolate", fa: "آیس چاکلت", en: "Iced Chocolate", price: 270, icon: "iced", desc: { fa: "شکلات سرد با شیر و یخ.", en: "Chocolate milk over ice." }, photos: ["iced_9"] },
     { id: "honey-lemon-iced-tea", fa: "آیس تی هانی لمون", en: "Honey Lemon Iced Tea", price: 280, icon: "lemon", desc: { fa: "چای سرد با عسل و لیمو.", en: "Iced tea with honey and lemon." }, photos: ["icedtea_3"] },
     { id: "lemonade", fa: "لیموناد", en: "Lemonade", price: 240, icon: "lemon", desc: { fa: "لیموناد خنک.", en: "Fresh, cold lemonade." }, tags: ["cf"], photos: ["lemonade_1"] },
     { id: "strawberry-lemonade", fa: "لیموناد توت‌فرنگی", en: "Strawberry Lemonade", price: 270, icon: "lemon", desc: { fa: "لیموناد با توت‌فرنگی.", en: "Lemonade with strawberry." }, tags: ["cf"], photos: ["strawlemon_1"] },
     { id: "mojito-non-alcoholic", fa: "موهیتو", en: "Mojito (non-alcoholic)", price: 280, icon: "lemon", desc: { fa: "لیمو، نعناع و سودا؛ بدون الکل.", en: "Lime, mint and soda. Alcohol-free." }, tags: ["cf"], photos: ["mojito_1"] },
   ] },
 { id: "matcha", fa: "ماچا", en: "Matcha", tint: "tea",
   items: [
     { id: "matcha", fa: "ماچا", en: "Matcha", price: 280, icon: "matcha", desc: { fa: "چای سبز ماچا، هم‌زده با آب داغ.", en: "Whisked Japanese green tea." }, photos: ["matcha_1"] },
     { id: "matcha-latte", fa: "ماچا لاته", en: "Matcha Latte", price: 350, icon: "glass", desc: { fa: "ماچا با شیر.", en: "Matcha with milk." }, photos: ["icedmatcha_3"] },
     { id: "strawberry-matcha-latte", fa: "ماچا لاته توت‌فرنگی", en: "Strawberry Matcha Latte", price: 380, icon: "glass", desc: { fa: "ماچا لاته روی لایه‌ی توت‌فرنگی.", en: "Matcha latte layered over strawberry." }, photos: ["strawmatcha_0"] },
     { id: "hazelnut-matcha-latte-plant-milk", fa: "ماچا لاته فندق گیاهی", en: "Hazelnut Matcha Latte (plant milk)", price: 440, icon: "glass", desc: { fa: "ماچا لاته با شیر گیاهی فندق.", en: "Matcha latte made with hazelnut plant milk." }, tags: ["pm","n"], photos: ["icedmatcha_1"] },
     { id: "spirulina", fa: "اسپیرولینا", en: "Spirulina", price: 320, icon: "glass", desc: { fa: "نوشیدنی اسپیرولینا.", en: "A spirulina drink." }, tags: ["cf"], photos: ["spirulina_0"] },
   ] },
 { id: "cake", fa: "کیک و کروسان", en: "Cakes & pastries", tint: "cake",
   items: [
     { id: "chocolate-cake", fa: "کیک شکلاتی", en: "Chocolate Cake", price: 265, icon: "cake", desc: { fa: "یک برش کیک شکلاتی.", en: "A slice of chocolate cake." }, photos: ["chocake_1"] },
     { id: "apple-cake", fa: "کیک سیب", en: "Apple Cake", price: 285, icon: "cake", desc: { fa: "یک برش کیک سیب.", en: "A slice of apple cake." }, photos: ["applecake_1"] },
     { id: "new-york-cookie", fa: "کوکی نیویورکی", en: "New York Cookie", price: 200, icon: "cookie", desc: { fa: "کوکی به سبک نیویورک.", en: "New York-style cookie." }, photos: ["nycookie_0"] },
     { id: "new-york-double-chocolate-cookie", fa: "کوکی نیویورکی دبل چاکلت", en: "New York Double Chocolate Cookie", price: 220, icon: "cookie", desc: { fa: "کوکی نیویورکی دبل چاکلت.", en: "New York-style double chocolate cookie." }, photos: ["dccookie_0"] },
     { id: "diet-cookie", fa: "کوکی رژیمی", en: "Diet Cookie", price: 200, icon: "cookie", desc: { fa: "کوکی رژیمی.", en: "Light diet cookie." }, photos: ["oatcookie_1"] },
     { id: "nutella-croissant", fa: "کروسان نوتلا", en: "Nutella Croissant", price: 352, icon: "croissant", desc: { fa: "کروسان کره‌ای با نوتلا.", en: "Butter croissant with Nutella." }, tags: ["n"], photos: ["chocroissant_0"] },
     { id: "hazelnut-chocolate-croissant", fa: "کروسان شکلات فندقی", en: "Hazelnut Chocolate Croissant", price: 312, icon: "croissant", desc: { fa: "کروسان با شکلات فندقی.", en: "Croissant with hazelnut chocolate." }, tags: ["n"], photos: ["croissant_4"] },
     { id: "peanut-butter-croissant", fa: "کروسان کره بادام زمینی", en: "Peanut Butter Croissant", price: 317, icon: "croissant", desc: { fa: "کروسان با کره‌ی بادام‌زمینی.", en: "Croissant with peanut butter." }, tags: ["n"], photos: ["croissant_2"] },
     { id: "cheese-walnut-and-tomato-croissant", fa: "کروسان پنیر، گردو و گوجه", en: "Cheese, Walnut & Tomato Croissant", price: 317, icon: "croissant", desc: { fa: "کروسان با پنیر، گردو و گوجه.", en: "Croissant with cheese, walnut and tomato." }, tags: ["n"], photos: ["crsandwich_0"] },
     { id: "lotus-croissant", fa: "کروسان لوتوس", en: "Lotus Croissant", price: 352, icon: "croissant", desc: { fa: "کروسان با کرم بیسکوییت لوتوس.", en: "Croissant with Lotus biscuit spread." }, photos: ["croissant_0"] },
   ] },
 { id: "food", fa: "ساندویچ", en: "Sandwiches", tint: "food",
   items: [
     { id: "beef-ham-baguette-90pct", fa: "فرانسوی ژامبون گوشت ۹۰٪", en: "Beef Ham Baguette (90%)", price: 570, icon: "baguette", desc: { fa: "نان فرانسوی با ژامبون گوشت ۹۰٪.", en: "Baguette with 90% beef ham." }, photos: ["baguette_1"] },
     { id: "roast-beef-baguette", fa: "فرانسوی رست بیف", en: "Roast Beef Baguette", price: 710, icon: "baguette", desc: { fa: "نان فرانسوی با رست‌بیف.", en: "Baguette with roast beef." }, photos: ["baguette_6"] },
     { id: "marinated-chicken-baguette", fa: "فرانسوی مرغ مرینیت", en: "Marinated Chicken Baguette", price: 680, icon: "baguette", desc: { fa: "نان فرانسوی با مرغ مرینیت‌شده.", en: "Baguette with marinated chicken." }, photos: ["baguette_8"] },
     { id: "pepperoni-baguette", fa: "فرانسوی پپرونی", en: "Pepperoni Baguette", price: 575, icon: "baguette", desc: { fa: "نان فرانسوی با پپرونی.", en: "Baguette with pepperoni." }, photos: ["pepsand_2"] },
     { id: "bacon-baguette", fa: "فرانسوی بیکن", en: "Bacon Baguette", price: 575, icon: "baguette", desc: { fa: "نان فرانسوی با بیکن.", en: "Baguette with bacon." }, photos: ["pepsand_3"] },
     { id: "chicken-ham-baguette-90pct", fa: "فرانسوی ژامبون مرغ ۹۰٪", en: "Chicken Ham Baguette (90%)", price: 570, icon: "baguette", desc: { fa: "نان فرانسوی با ژامبون مرغ ۹۰٪.", en: "Baguette with 90% chicken ham." }, photos: ["baguette_4"] },
     { id: "ham-croissant-90pct", fa: "کروسان ژامبون ۹۰٪", en: "Ham Croissant (90%)", price: 495, icon: "croissant", desc: { fa: "کروسان با ژامبون ۹۰٪.", en: "Croissant with 90% ham." }, photos: ["hamcr_1"] },
     { id: "pepperoni-croissant", fa: "کروسان پپرونی", en: "Pepperoni Croissant", price: 495, icon: "croissant", desc: { fa: "کروسان با پپرونی.", en: "Croissant with pepperoni." }, photos: ["hamcr_3"] },
     { id: "bacon-croissant", fa: "کروسان بیکن", en: "Bacon Croissant", price: 495, icon: "croissant", desc: { fa: "کروسان با بیکن.", en: "Croissant with bacon." }, photos: ["hamcr_1"] },
     { id: "chicken-ham-croissant-90pct", fa: "کروسان ژامبون مرغ ۹۰٪", en: "Chicken Ham Croissant (90%)", price: 495, icon: "croissant", desc: { fa: "کروسان با ژامبون مرغ ۹۰٪.", en: "Croissant with 90% chicken ham." }, photos: ["hamcr_0"] },
   ] },
 { id: "extra", fa: "افزودنی‌ها", en: "Extras", tint: "extra",
   items: [
     { id: "extra-shot", fa: "شات اضافه", en: "Extra shot", price: 100, icon: "shot", desc: { fa: "یک شات اسپرسوی اضافه برای نوشیدنی شما.", en: "One more espresso shot in your drink." }, photos: ["shot_0"] },
     { id: "switch-to-80pct-arabica", fa: "جایگزینی ۸۰٪ عربیکا", en: "Switch to 80% Arabica", price: 60, icon: "shot", desc: { fa: "تعویض دانه‌ی نوشیدنی به ۸۰٪ عربیکا.", en: "Switch your drink's beans to 80% Arabica." }, photos: ["beans_1"] },
     { id: "switch-to-100pct-arabica", fa: "جایگزینی ۱۰۰٪ عربیکا", en: "Switch to 100% Arabica", price: 168, icon: "shot", desc: { fa: "تعویض دانه‌ی نوشیدنی به ۱۰۰٪ عربیکا.", en: "Switch your drink's beans to 100% Arabica." }, photos: ["beans_0"] },
     { id: "flavor-syrup-fo", fa: "طعم‌دهنده فو", en: "Flavor syrup (Fo)", price: 167, icon: "syrup", desc: { fa: "افزودن طعم‌دهنده به نوشیدنی.", en: "Add a flavour syrup to your drink." }, photos: ["syrup2_2"] },
     { id: "flavor-syrup-san-ich", fa: "طعم‌دهنده سن ایچ", en: "Flavor syrup (San Ich)", price: 50, icon: "syrup", desc: { fa: "افزودن طعم‌دهنده به نوشیدنی.", en: "Add a flavour syrup to your drink." }, photos: ["syrup2_2"] },
     { id: "vegan-milk", fa: "شیر وگن", en: "Vegan milk", price: 120, icon: "milk", desc: { fa: "جایگزینی شیر با شیر گیاهی.", en: "Swap to plant milk." }, tags: ["pm"], photos: ["oatmilk_1"] },
   ] },
];

/* The filter menu, in order. A filter shows the items carrying its tag, every item in its
   sections, and the items it lists by id. */
export const FILTERS = [
  { id: "cf", tag: "cf" },
  { id: "pm", tag: "pm" },
  { id: "cold", sections: ["iced","shake","cold"], items: ["cold-brew","matcha-latte","strawberry-matcha-latte","hazelnut-matcha-latte-plant-milk"] },
];
