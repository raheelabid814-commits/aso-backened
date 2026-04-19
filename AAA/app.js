/* =========================================
   CH Restaurant - Main App Logic
   ========================================= */

/* --- SUPABASE CONFIGURATION --- */
const SUPABASE_URL = 'https://osxvzxwczaapqwcyavdy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_oViAIWwBt2y7MDUHn11Vyw_71nAzze5';

// Initialize Supabase Client
let supabaseClient = null;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/* --- EMAILJS CONFIGURATION --- */
const EMAILJS_SERVICE_ID  = 'order_confirm_invoice';
const EMAILJS_TEMPLATE_ID = 'template_6dwifik';
const EMAILJS_PUBLIC_KEY  = 'ap7PVWcIDFJgQvz7v';

// Initialize EmailJS
if (window.emailjs) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

// Send Invoice Email to Customer
async function sendInvoiceEmail(order, cartItems) {
    if (!window.emailjs) return;
    try {
        let itemsList = cartItems.map(i =>
            `• ${i.quantity}x ${i.title} (${i.variant || 'Regular'}) — Rs ${i.price * i.quantity}`
        ).join('\n');

        let dateStr = new Date(order.date).toLocaleString('en-PK', {
            dateStyle: 'medium', timeStyle: 'short'
        });

        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            customer_email : order.user,
            customer_name  : order.user.split('@')[0],
            order_id       : order.id,
            date           : dateStr,
            store          : order.store === 'bakery' ? 'CH Bakery' : 'CH Fast Food',
            order_type     : order.type.toUpperCase(),
            address        : order.address || 'Store Pickup',
            items_list     : itemsList,
            total          : order.total
        });
        console.log('✅ Invoice email sent to:', order.user);
    } catch (e) {
        console.warn('EmailJS send failed:', e);
    }
}

/* --- MENU DATA (Fast Food) --- */
const categories = [
    { id: 'appetizer', name: 'Appetizer', icon: 'https://cdn-icons-png.flaticon.com/512/3274/3274099.png' },
    { id: 'fried_corner', name: 'Fried Corner', icon: 'assets/friedcorner_icon.jpg' },
    { id: 'shawarma', name: 'Shawarma', icon: 'assets/shawarma_icon.png' },
    { id: 'pizza', name: 'Pizza', icon: 'assets/pizza_icon.jpg' },
    { id: 'pasta', name: 'Pasta', icon: 'assets/pasta_icon.jpg' },
    { id: 'wings', name: 'Wings', icon: 'assets/wings_icon.png' },
    { id: 'sandwich', name: 'Sandwich', icon: 'assets/sandwich_icon.png' },
    { id: 'beverages', name: 'Beverages', icon: 'https://cdn-icons-png.flaticon.com/512/2738/2738730.png' },
    { id: 'deserts', name: 'Desserts', icon: 'https://cdn-icons-png.flaticon.com/512/2900/2900010.png' },
    { id: 'hot_beverages', name: 'Hot Beverages', icon: 'https://cdn-icons-png.flaticon.com/512/624/624263.png' },
    { id: 'kids_meal', name: 'Kids Meal', icon: 'assets/kiddeals_icon.png' },
    { id: 'deals', name: 'Deals', icon: 'assets/deals_icon.png' }
];

// Base Prices (Overridable from Cashier Panel via LocalStorage)
const rawMenuData = [
    // Appetizer
    { id: 'a1', category: 'appetizer', img: 'assets/fast food/chaudharyplatter.png', title: 'Chaudhary Platter', price: 750, desc: '4 Pcs Spin Rolls, 6 Pcs Oven Baked Wings, French Fries & Dip Sauce', isBestSeller: true },
    { id: 'a2', category: 'appetizer', img: 'assets/platter.png', title: 'Malai Boti Platter', price: 900, desc: '4 Pcs Malai Boti Rolls, 6 Pcs Oven Baked Wings, French Fries & Dip Sauce', isBestSeller: false },
    { id: 'a3', category: 'appetizer', img: 'assets/platter.png', title: 'Malai Boti Spin Rolls', price: 580, desc: '', isBestSeller: false },
    { id: 'a4', category: 'appetizer', img: 'assets/platter.png', title: 'Chicken Spin Rolls', price: 650, desc: '', isBestSeller: true },
    { id: 'a5', category: 'appetizer', img: 'assets/platter.png', title: 'Shawarma Spin Rolls', price: 600, desc: '', isBestSeller: false },
    { id: 'a6', category: 'appetizer', img: 'assets/platter.png', title: 'Seekh Kabab Spin Rolls', price: 580, desc: '', isBestSeller: false },
    { id: 'a7', category: 'appetizer', img: 'assets/garlic-bread.png', title: 'Garlic Bread (4 Pcs)', price: 220, desc: '', isBestSeller: false },
    { id: 'a8', category: 'appetizer', img: 'assets/garlic-bread.png', title: 'Garlic Bread Supreme (4 Pcs)', price: 330, desc: '', isBestSeller: false },
    { id: 'a9', category: 'appetizer', img: 'assets/garlic-bread.png', title: 'Chicken Cheese Stick', price: 520, desc: '', isBestSeller: false },

    // Fried Corner
    { id: 'f1', category: 'fried_corner', img: 'assets/wings.png', title: 'Fried Wings', price: 320, hasSizes: true, sizes: [{ name: '5 Pcs', price: 320 }, { name: '10 Pcs', price: 600 }], isBestSeller: false },
    { id: 'f2', category: 'fried_corner', img: 'assets/wings.png', title: 'Nuggets', price: 320, hasSizes: true, sizes: [{ name: '5 Pcs', price: 320 }, { name: '10 Pcs', price: 600 }], isBestSeller: false },
    { id: 'f3', category: 'fried_corner', img: 'assets/french_fries-removebg-preview.png', title: 'French Fries', price: 300, hasSizes: true, sizes: [{ name: 'Half', price: 300 }, { name: 'Full', price: 450 }], isBestSeller: true },
    { id: 'f4', category: 'fried_corner', img: 'assets/loaded_fries-removebg-preview.png', title: 'Mayo Fries', price: 350, hasSizes: true, sizes: [{ name: 'Half', price: 350 }, { name: 'Full', price: 550 }], isBestSeller: false },
    { id: 'f5', category: 'fried_corner', img: 'assets/loaded_fries-removebg-preview.png', title: 'Loaded Fries', price: 370, hasSizes: true, sizes: [{ name: 'Half', price: 370 }, { name: 'Full', price: 550 }], isBestSeller: true },
    { id: 'f6', category: 'fried_corner', img: 'assets/zinger_burger-removebg-preview.png', title: 'Zinger Burger', price: 450, desc: 'Crispy fried chicken fillet', isBestSeller: true },
    { id: 'f7', category: 'fried_corner', img: 'assets/zinger_burger-removebg-preview.png', title: 'Zinger Cheese Burger', price: 550, desc: '', isBestSeller: false },
    { id: 'f8', category: 'fried_corner', img: 'assets/burger.png', title: 'Chicken Burger', price: 350, desc: '', isBestSeller: false },
    { id: 'f9', category: 'fried_corner', img: 'assets/burger.png', title: 'Grilled Burger', price: 550, desc: '', isBestSeller: false },

    // Shawarma
    { id: 's1', category: 'shawarma', img: 'assets/shawarma_zinger.jpeg', title: 'Shawarma', price: 250, desc: '', isBestSeller: true },
    { id: 's2', category: 'shawarma', img: 'assets/shawarma_zinger.jpeg', title: 'Zinger Shawarma', price: 400, desc: '', isBestSeller: false },
    { id: 's3', category: 'shawarma', img: 'assets/shawarma_zinger.jpeg', title: 'Paratha', price: 280, desc: '', isBestSeller: false },
    { id: 's4', category: 'shawarma', img: 'assets/shawarma_platter-removebg-preview.png', title: 'Shawarma Platter', price: 380, desc: '', isBestSeller: false },
    { id: 's5', category: 'shawarma', img: 'assets/shawarma_zinger.jpeg', title: 'Zinger Platter', price: 550, desc: '', isBestSeller: false },

    // Pizza
    {
        id: 'p_trad', category: 'pizza', img: 'assets/traditional_pizza-removebg-preview.png', title: 'Traditional Pizza', type: 'pizza', isBestSeller: true, price: 550,
        flavors: ['Chicken Tikka', 'Chicken Fajita', 'Fajita Sicilion', 'Chicken Supreme', 'Euro', 'Cheese Lover', 'Veggie Lover'],
        sizes: [{ name: 'Small', price: 550 }, { name: 'Medium', price: 1120 }, { name: 'Large', price: 1480 }, { name: 'Extra Large', price: 2399 }]
    },
    {
        id: 'p_spec', category: 'pizza', img: 'assets/pizza.png', title: 'Special Pizza', type: 'pizza', isBestSeller: false, price: 599,
        flavors: ['Chaudhary Special', 'Malai Boti', 'Bihari Kabab', 'Steak Supreme', 'Chef\'s Special'],
        sizes: [{ name: 'Small', price: 599 }, { name: 'Medium', price: 1199 }, { name: 'Large', price: 1650 }, { name: 'Extra Large', price: 2550 }]
    },
    {
        id: 'p_square', category: 'pizza', img: 'assets/deals.png', title: 'Square Special Pizza', type: 'pizza', isBestSeller: false, price: 650,
        flavors: ['Chaudhary Special', 'Malai Boti', 'Bihari Kabab'],
        sizes: [{ name: 'Small', price: 650, note: '' }, { name: 'Medium', price: 1430, note: '+Rs.150 for Bihari Kabab' }, { name: 'Large', price: 1999, note: '+Rs.200 for Bihari Kabab' }]
    },
    {
        id: 'p_stuffer', category: 'pizza', img: 'assets/pizza.png', title: 'Stuffer Pizza', type: 'pizza', isBestSeller: false, price: 1630,
        flavors: ['Chicken Cheese Stuffer', 'Chicken Kabab Stuffer', 'Cheese Stuffer'],
        sizes: [{ name: 'Medium', price: 1630 }, { name: 'Large', price: 2270 }, { name: 'Extra Large', price: 2600 }]
    },
    {
        id: 'p_crown', category: 'pizza', img: 'assets/crown_crust_pizza-removebg-preview.png', title: 'Crown Crust Pizza', type: 'pizza', isBestSeller: true, price: 1630,
        flavors: ['Chaudhary Special', 'Malai Boti', 'Bihari Kabab'],
        sizes: [{ name: 'Medium', price: 1630 }, { name: 'Large', price: 2270 }, { name: 'Extra Large', price: 2650 }]
    },

    // Pasta
    { id: 'pa1', category: 'pasta', img: 'assets/chaudhary_special_pasta-removebg-preview.png', title: 'Chaudhary Special Pasta', price: 490, hasSizes: true, sizes: [{ name: 'Half', price: 490 }, { name: 'Full', price: 810 }], isBestSeller: true },
    { id: 'pa2', category: 'pasta', img: 'assets/pasta.png', title: 'Macaroni Pasta', price: 490, hasSizes: true, sizes: [{ name: 'Half', price: 490 }, { name: 'Full', price: 810 }], isBestSeller: false },
    { id: 'pa3', category: 'pasta', img: 'assets/pasta.png', title: 'Creamy Pasta', price: 499, hasSizes: true, sizes: [{ name: 'Half', price: 499 }, { name: 'Full', price: 810 }], isBestSeller: false },
    { id: 'pa4', category: 'pasta', img: 'assets/crunchy_pasta-removebg-preview.png', title: 'Crunchy Pasta', price: 550, hasSizes: true, sizes: [{ name: 'Half', price: 550 }, { name: 'Full', price: 890 }], isBestSeller: false },

    // Special Juices
    { id: 'j1', category: 'beverages', img: 'assets/mint_margarita-removebg-preview.png', title: 'Mint Margritta', price: 250, hasSizes: true, sizes: [{ name: 'Large', price: 250 }, { name: 'Jumbo', price: 300 }], isBestSeller: true },
    { id: 'j2', category: 'beverages', img: 'assets/drink.png', title: 'Lemon Add', price: 200, hasSizes: true, sizes: [{ name: 'Large', price: 200 }, { name: 'Jumbo', price: 250 }], isBestSeller: false },
    { id: 'j3', category: 'beverages', img: 'assets/drink.png', title: 'Strawberry Juice', price: 200, hasSizes: true, sizes: [{ name: 'Large', price: 200 }, { name: 'Jumbo', price: 250 }], isBestSeller: false },
    { id: 'j4', category: 'beverages', img: 'assets/drink.png', title: 'BlueBerry Slash', price: 200, hasSizes: true, sizes: [{ name: 'Large', price: 200 }, { name: 'Jumbo', price: 275 }], isBestSeller: false },
    { id: 'j5', category: 'beverages', img: 'assets/cold_coffee-removebg-preview.png', title: 'Cold Coffee', price: 300, hasSizes: true, sizes: [{ name: 'Large', price: 300 }, { name: 'Jumbo', price: 400 }], isBestSeller: true },
    { id: 'j6', category: 'beverages', img: 'assets/drink.png', title: 'Peach Margrita', price: 225, hasSizes: true, sizes: [{ name: 'Large', price: 225 }, { name: 'Jumbo', price: 275 }], isBestSeller: false },

    // All-Day Deals
    { id: 'ad1', category: 'deals', img: 'assets/deals.png', title: 'Deal for 1 Person', price: 599, desc: '1 Personal Pan Pizza (any flavour), 2 Pcs Oven Baked Wings, 1 Pc Hot Garlic Bread', isDeal: true },
    { id: 'ad2', category: 'deals', img: 'assets/deals.png', title: 'Deal for 2 Person', price: 1399, desc: '1 Regular Pizza (any flavour), 4 Pcs Oven Baked Wings, 2 Pcs Hot Garlic Bread', isDeal: true },
    { id: 'ad3', category: 'deals', img: 'assets/deals.png', title: 'Deal for 3 Person', price: 2099, desc: '1 Large Pizza (any flavour), 6 Pcs Oven Baked Wings, 4 Pcs Hot Garlic Bread', isDeal: true },
    { id: 'ad4', category: 'deals', img: 'assets/deals.png', title: 'Deal for 4 Person', price: 2899, desc: '2 Regular Pizza (any flavour), 8 Pcs Oven Baked Wings, 4 Pcs Hot Garlic Bread', isDeal: true },
    { id: 'ad5', category: 'deals', img: 'assets/deals.png', title: 'Deal for 6 Person', price: 4199, desc: '2 Large Pizza (any flavour), 12 Pcs Oven Baked Wings, 4 Pcs Hot Garlic Bread', isDeal: true },

    // Hot Beverages
    { id: 'hb1', category: 'hot_beverages', img: 'assets/tea.png', title: 'Hot Tea', price: 150 },
    { id: 'hb2', category: 'hot_beverages', img: 'assets/tea.png', title: 'Green Tea', price: 150 },
    { id: 'hb3', category: 'hot_beverages', img: 'assets/tea.png', title: 'Karak Chaye', price: 150 },
    { id: 'hb4', category: 'hot_beverages', img: 'assets/tea.png', title: 'Cardamom Tea', price: 150 },
    { id: 'hb5', category: 'hot_beverages', img: 'assets/tea.png', title: 'Black Coffee', price: 180 },
    { id: 'hb6', category: 'hot_beverages', img: 'assets/cappoccino-removebg-preview (1).png', title: 'Cappuccino', price: 280, isBestSeller: true },
    { id: 'hb7', category: 'hot_beverages', img: 'assets/tea.png', title: 'Latte', price: 280 },

    // Sandwich
    { id: 'sw1', category: 'sandwich', img: 'assets/fast food/chaudhar_special_sandwich-removebg-preview.png', title: 'Chaudhary Special Sandwich', price: 750, isBestSeller: true },
    { id: 'sw2', category: 'sandwich', img: 'assets/sandwich.png', title: 'Malai Boti Sandwich', price: 800 },

    // Kids Meal
    { id: 'km1', category: 'kids_meal', img: 'assets/sandwich.png', title: 'Kids Meal Combo', price: 599, desc: 'Age Limit 10 Year. Choose one option.', hasSizes: true, sizes: [ {name: '10 Pcs Nuggets Combo', price: 599}, {name: '1 Small Pizza Combo', price: 599}, {name: '1 Small Pasta Combo', price: 599}, {name: 'Chicken Burger Combo', price: 599} ]},

    // Lunch & Midnight Deals
    { id: 'lmd1', category: 'deals', img: 'assets/deals.png', title: 'Lunch/Midnight Deal 1', isTimeRestricted: true, isDeal: true, price: 580, hasSizes: true, sizes: [ {name: 'Non Special', price: 580}, {name: 'Special', price: 650} ], desc: '(12-4 PM & 11PM-2AM) 1 Small Pizza, 1 Regular Drink' },
    { id: 'lmd2', category: 'deals', img: 'assets/deals.png', title: 'Lunch/Midnight Deal 2', isTimeRestricted: true, isDeal: true, price: 1120, hasSizes: true, sizes: [ {name: 'Non Special', price: 1120}, {name: 'Special', price: 1280} ], desc: '(12-4 PM & 11PM-2AM) 1 Medium Pizza, 1 Drink 500 ml' },
    { id: 'lmd3', category: 'deals', img: 'assets/deals.png', title: 'Lunch/Midnight Deal 3', isTimeRestricted: true, isDeal: true, price: 1480, hasSizes: true, sizes: [ {name: 'Non Special', price: 1480}, {name: 'Special', price: 1720} ], desc: '(12-4 PM & 11PM-2AM) 1 Large Pizza, 1 Drink 1.5 Ltr' },
    { id: 'lmd4', category: 'deals', img: 'assets/deals.png', title: 'Lunch/Midnight Deal 4', isTimeRestricted: true, isDeal: true, price: 2960, hasSizes: true, sizes: [ {name: 'Non Special', price: 2960}, {name: 'Special', price: 3300} ], desc: '(12-4 PM & 11PM-2AM) 2 Large Pizzas, 1 Drink 1.5 Ltr' },
    { id: 'lmd5', category: 'deals', img: 'assets/deals.png', title: 'Lunch/Midnight Deal 5', isTimeRestricted: true, isDeal: true, price: 2399, hasSizes: true, sizes: [ {name: 'Non Special', price: 2399}, {name: 'Special', price: 2550} ], desc: '(12-4 PM & 11PM-2AM) 1 Extra Large Pizza, 1 Drink 1.5 Ltr' },

    // Square Pizza Deals
    { id: 'sqd1', category: 'deals', img: 'assets/deals.png', title: 'Square Deal 1', price: 680, isDeal: true, desc: '1 Small Square Pizza, 1 Regular Drink' },
    { id: 'sqd2', category: 'deals', img: 'assets/deals.png', title: 'Square Deal 2', price: 1430, isDeal: true, desc: '1 Medium Square Pizza, 1 Drink 500 ml' },
    { id: 'sqd3', category: 'deals', img: 'assets/deals.png', title: 'Square Deal 3', price: 1999, isDeal: true, desc: '1 Large Square Pizza, 1 Drink 1.5 Ltr' },
    
    // Deserts
    { id: 'd1', category: 'deserts', img: 'https://cdn-icons-png.flaticon.com/512/2900/2900010.png', title: 'Chocolate Brownie', price: 350 },
    { id: 'd2', category: 'deserts', img: 'https://cdn-icons-png.flaticon.com/512/2900/2900010.png', title: 'Brownie with ice cream', price: 399 },
    { id: 'd3', category: 'deserts', img: 'https://cdn-icons-png.flaticon.com/512/2900/2900010.png', title: 'Single Scoop Ice cream', price: 150 },
    { id: 'd4', category: 'deserts', img: 'https://cdn-icons-png.flaticon.com/512/2900/2900010.png', title: 'Double Scoop Ice cream', price: 250 },

    // Wings
    { id: 'w1', category: 'wings', img: 'assets/wings.png', title: 'Oven Baked Wings', hasSizes: true, sizes: [{ name: '6 Pc', price: 380 }, { name: '9 Pc', price: 510 }, { name: '12 Pc', price: 730 }] },
    { id: 'w2', category: 'wings', img: 'assets/wings.png', title: 'Peri Peri Wings', hasSizes: true, sizes: [{ name: '6 Pc', price: 380 }, { name: '9 Pc', price: 510 }, { name: '12 Pc', price: 730 }] },
    { id: 'w3', category: 'wings', img: 'assets/wings.png', title: 'Malai Boti Wings', hasSizes: true, sizes: [{ name: '6 Pc', price: 430 }, { name: '9 Pc', price: 640 }, { name: '12 Pc', price: 830 }] },


    // --- BAKERY MENU DATA ---
    // Rusks
    { id: 'br1', category: 'rusks', title: 'Rusks', price: 600, desc: 'Per kg', img: 'assets/bakery/rusk-removebg-preview.png' },
    { id: 'br2', category: 'rusks', title: 'Special Rusk', price: 800, desc: 'Per kg', img: 'assets/bakery/special_rusk-removebg-preview.png' },
    { id: 'br3', category: 'rusks', title: 'Cake Rusk', price: 1400, desc: 'Per pound', img: 'assets/bakery/cakerusk-removebg-preview.png' },
    { id: 'br4', category: 'rusks', title: 'Special Cake Rusk', price: 2800, desc: 'Per pound', img: 'assets/bakery/special_cakerusk-removebg-preview.png' },
    { id: 'br5', category: 'rusks', title: 'Sada Rusk Packet', price: 200, desc: 'Per packet', img: 'assets/bakery/sadaruskpacket.png' },
    
    // Bread
    { id: 'bb1', category: 'bread', img: 'assets/bread_cat_1776336792764.png', title: 'Sada Bread', price: 120 },
    { id: 'bb2', category: 'bread', img: 'assets/bread_cat_1776336792764.png', title: 'Large Bread', price: 220 },
    { id: 'bb3', category: 'bread', img: 'assets/bread_cat_1776336792764.png', title: 'Sada Bread Small', price: 100 },
    { id: 'bb4', category: 'bread', img: 'assets/bread_cat_1776336792764.png', title: 'Sheermal', price: 60 },

    // Cakes
    { id: 'bc1', category: 'cakes', img: 'assets/bakery/plain_cake-removebg-preview.png', title: 'Cake Plain', price: 1500, desc: 'Per pound' },
    { id: 'bc2', category: 'cakes', img: 'assets/bakery/plain_cake-removebg-preview.png', title: 'Plain Cake', price: 1000, desc: 'Per pound' },
    { id: 'bc3', category: 'cakes', img: 'assets/bakery/soft_cake-removebg-preview.png', title: 'Soft Cake', price: 1800, desc: 'Per pound' },
    { id: 'bc4', category: 'cakes', img: 'assets/bakery/cream_cake-removebg-preview.png', title: 'Cream Cake', price: 1600, desc: 'Per pound' },
    { id: 'bc5', category: 'cakes', img: 'assets/bakery/cream_cake-removebg-preview.png', title: 'Special Cream Cake', price: 1900, desc: 'Per pound' },
    { id: 'bc6', category: 'cakes', img: 'assets/fruitcake_image.png', title: 'Fruit Cake Small', price: 180 },
    { id: 'bc7', category: 'cakes', img: 'assets/fruitcake_image.png', title: 'Big Fruit Cake', price: 300 },
    { id: 'bc8', category: 'cakes', img: 'assets/specialfruitcake_image.png', title: 'Special Fruit Cake', price: 350 },
    { id: 'bc9', category: 'cakes', img: 'assets/bakery/dry-cake-removebg-preview.png', title: 'Dry Cake', price: 700, desc: 'Per pound' },
    { id: 'bc10', category: 'cakes', img: 'assets/bakery/specialdrycake-removebg-preview.png', title: 'Special Dry Cake', price: 800, desc: 'Per pound' },
    { id: 'bc11', category: 'cakes', img: 'assets/cake_cat_1776336810937.png', title: 'Fruit Cream', price: 400, desc: 'Per pound' },
    { id: 'bc12', category: 'cakes', img: 'assets/bakery/cream_and_jam_cake-removebg-preview.png', title: 'Cream + Jam', price: 500, desc: 'Per pound' },
    { id: 'bc13', category: 'cakes', img: 'assets/bakery/special_cake-removebg-preview.png', title: 'Special Cake', price: 800, desc: 'Per pound' },
    { id: 'bc14', category: 'cakes', img: 'assets/bakery/anniversarycake-removebg-preview.png', title: 'Anniversary Special Cake', price: 1800, desc: 'Per pound' },
    { id: 'bc15', category: 'cakes', img: 'assets/cake_cat_1776336810937.png', title: 'Customizable Cake', price: 0, isCustom: true, desc: 'Fully customized to your needs. Price provided by admin.' },

    // Biscuits
    { id: 'bi1', category: 'biscuits', img: 'assets/biscuits_cat_1776336865518.png', title: 'Badam Khatai', price: 2000, desc: 'Per kg' },
    { id: 'bi2', category: 'biscuits', img: 'assets/biscuits_cat_1776336865518.png', title: 'Maring Biscuit', price: 1800, desc: 'Per kg' },

    // Sweets
    { id: 'ms1', category: 'sweets', img: 'assets/mithai_cat_1776336883204.png', title: 'Baklava', price: 1800, desc: 'Per kg' },
    { id: 'ms2', category: 'sweets', img: 'assets/mithai_cat_1776336883204.png', title: 'Mix Mithai', price: 950, desc: 'Assorted Sweets - Per kg' },
    { id: 'ms3', category: 'sweets', img: 'assets/mithai_cat_1776336883204.png', title: 'Special Mix Mithai Thali', price: 1000, desc: 'Premium Assorted Sweets - Per kg' },

    // Snacks
    { id: 'sn1', category: 'snack', img: 'assets/snack_cat_1776336843722.png', title: 'Cream Roll Small', price: 60 },
    { id: 'sn2', category: 'snack', img: 'assets/snack_cat_1776336843722.png', title: 'Cream Roll Special', price: 100 }
];

const bakeryCategories = [
    { id: 'bread', name: 'BREAD', icon: 'assets/bread_cat_1776336792764.png' },
    { id: 'cakes', name: 'CAKES', icon: 'assets/cake_cat_1776336810937.png' },
    { id: 'snack', name: 'SNACK', icon: 'assets/snack_cat_1776336843722.png' },
    { id: 'biscuits', name: 'BISCUIT', icon: 'assets/biscuits_cat_1776336865518.png' },
    { id: 'sweets', name: 'SWEETS', icon: 'assets/mithai_cat_1776336883204.png' },
    { id: 'rusks', name: 'RUSKS', icon: 'assets/bread_cat_1776336792764.png' }
];

// Global price overrides (loaded from Supabase on init)
let globalPriceOverrides = {};

// Helper to get actual price (with Supabase overrides applied)
function getMenuData() {
    return rawMenuData.map(item => {
        let cloned = JSON.parse(JSON.stringify(item));
        let ov = globalPriceOverrides[cloned.id];
        if (ov) {
            cloned.price = ov.price || cloned.price;
            if (cloned.hasSizes && ov.sizes) {
                cloned.sizes = ov.sizes;
            }
        }
        return cloned;
    });
}

// Load prices from Supabase app_settings table
async function loadPricesFromSupabase() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('app_settings')
            .select('setting_value')
            .eq('setting_key', 'price_overrides')
            .single();
        if (!error && data && data.setting_value) {
            globalPriceOverrides = data.setting_value;
        }
    } catch(e) {
        console.warn('Could not load price overrides from Supabase:', e);
    }
}

// Time Restriction Checker
function isDealTimeActive() {
    let now = new Date();
    let h = now.getHours();
    let isLunch = h >= 12 && h < 16; // 12 PM to 4 PM
    let isMidnight = h >= 23 || h < 2; // 11 PM to 2 AM
    return isLunch || isMidnight;
}

// Helper: get item image (use item img field, else fallback placeholder)
function getItemImage(item) {
    if (item && item.img) {
        return `<img src="${item.img}" alt="${item.title}" class="menu-item-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
                <div class="item-img-placeholder" style="display:none;"></div>`;
    }
    return `<div class="item-img-placeholder"></div>`;
}

function getBestSellers() {
    return getMenuData().filter(item => item.isBestSeller);
}

function getDeals() {
    return getMenuData().filter(item => item.isDeal);
}


/* --- APP STATE & LOGIC --- */
const app = {
    cart: [],
    currentUser: null,
    currentStore: 'fast-food', // tracks active store
    currentOrderType: 'delivery',
    selectedAddress: null,
    addresses: [],
    favourites: [],
    notifications: [],
    sliderInterval: null,

    init: async function () {
        this.loadCart();
        this.loadTheme();
        this.setupSlider();
        this.checkAuth();
        this.renderAddresses();
        this.loadFavourites();
        this.loadNotifications();
        this.setupRealtimeListeners();

        // Register Service Worker for PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(() => console.log('Service Worker Registered'))
                .catch(err => console.log('SW Registration failed:', err));
        }

        // Loader: Hide after 1.5 seconds (Faster)
        setTimeout(() => {
            const loader = document.getElementById('initial-loader');
            if (loader) {
                loader.style.opacity = '0';
                loader.style.transition = 'opacity 0.8s ease';
                setTimeout(() => loader.style.display = 'none', 800);
            }
        }, 1500);

        // Load latest prices from Supabase (Non-blocking)
        loadPricesFromSupabase().catch(err => console.error('Price load error:', err));

        // Listen to Supabase Auth state changes if configured
        if (supabaseClient) {
            supabaseClient.auth.onAuthStateChange((event, session) => {
                if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                    this.currentUser = session.user;
                    this.updateUserUI();
                    this.loadUserAddresses();
                    this.setupRealtimeListeners();
                    this.closeAuthModal();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.updateUserUI();
                    if(this.ordersSubscription) {
                        this.ordersSubscription.unsubscribe();
                        this.ordersSubscription = null;
                    }
                }
            });
        } else {
            // Mock persistent user for demo without Supabase
            let savedUser = localStorage.getItem('ch_user');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                this.updateUserUI();
            }
        }

        // Add event listeners for cart outside clicks
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('.item-price-tag')) { e.preventDefault(); }
        });
    },

    // Navigation & Views
    navigateTo: function (store) {
        document.getElementById('splash-screen').classList.remove('active');
        
        // Show loader briefly for transition
        let loader = document.getElementById('initial-loader');
        if (loader) {
            loader.style.display = 'flex';
            loader.style.opacity = '1';
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 300);
            }, 600);
        }

        if (store === 'splash') {
            document.getElementById('main-app').classList.remove('active');
            document.getElementById('splash-screen').classList.add('active');
            this.closeDrawer();
            if(this.closeBakeryDrawer) this.closeBakeryDrawer();
            return;
        }

        document.getElementById('main-app').classList.add('active');
        this.currentStore = store;
        this.loadCart(); // Load store-specific cart

        if (store === 'fast-food') {
            document.body.classList.remove('brand-bakery');
            document.body.classList.add('brand-fast-food');
            this.openView('view-fast-food');
            this.renderHomeViews();
        } else if (store === 'bakery') {
            document.body.classList.remove('brand-fast-food');
            document.body.classList.add('brand-bakery');
            this.openView('view-bakery');
            this.renderBakeryHome();
        } else {
            this.openView('view-grocery');
        }
    },

    openView: function (viewId, closeDrawers = false) {
        if (closeDrawers) this.closeDrawer();
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');

        if (viewId === 'view-menu-categories') {
            this.renderMenuCategoriesView();
        } else if (viewId === 'view-checkout') {
            this.renderCheckoutView();
        } else if (viewId === 'view-orders') {
            this.renderOrdersHistory();
        } else if (viewId === 'view-favourites') {
            this.renderFavourites();
        } else if (viewId === 'view-notifications') {
            this.renderNotifications();
        } else if (viewId === 'view-bakery-items') {
            // Keep state or handled by openBakeryCategory
        }
    },

    goBack: function () {
        if (this.currentStore === 'bakery') {
            this.openView('view-bakery');
        } else {
            this.openView('view-fast-food');
        }
    },

    setOrderType: function (type) {
        this.currentOrderType = type;
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        let btn = document.getElementById(`btn-${type}`);
        if (btn) btn.classList.add('active');
        let btnBak = document.getElementById(`btn-${type}-bakery`);
        if (btnBak) btnBak.classList.add('active');

        if (type === 'pickup') {
            let addrText = document.getElementById('header-address-text');
            if (addrText) addrText.innerText = 'Store Pickup';
        } else {
            let addr = this.selectedAddress ? this.selectedAddress.text : 'Select Address...';
            let addrText = document.getElementById('header-address-text');
            if (addrText) addrText.innerText = addr;
        }
        this.renderCheckoutView(); // Re-render if in checkout
    },

    toggleTheme: function () {
        let isNight = document.body.classList.contains('night-theme');
        if (isNight) {
            document.body.classList.remove('night-theme');
            document.body.classList.add('light-theme');
            localStorage.setItem('ch_theme', 'light');
            
            // Update UI toggles if they exist (they might be removed)
            document.querySelectorAll('.theme-opt').forEach(el => el.classList.remove('active'));
            let dayOpt = document.querySelector('.theme-opt.day');
            if (dayOpt) dayOpt.classList.add('active');
        } else {
            document.body.classList.remove('light-theme');
            document.body.classList.add('night-theme');
            localStorage.setItem('ch_theme', 'night');
            
            // Update UI toggles if they exist
            document.querySelectorAll('.theme-opt').forEach(el => el.classList.remove('active'));
            let nightOpt = document.querySelector('.theme-opt.night');
            if (nightOpt) nightOpt.classList.add('active');
        }
    },

    loadTheme: function () {
        let saved = localStorage.getItem('ch_theme');
        if (saved === 'night') {
            this.toggleTheme(); // swap to night
        }
    },

    // Rendering Data
    renderHomeViews: function () {
        // Render Explore Categories (Show 8 items now for better visibility)
        let exploreGrid = document.getElementById('explore-grid');
        exploreGrid.innerHTML = '';
        categories.slice(0, 8).forEach(cat => {
            exploreGrid.innerHTML += `
                <div class="cat-card" onclick="app.openCategoryMenu('${cat.id}', '${cat.name}')">
                    <img src="${cat.icon}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3413/3413645.png'" alt="${cat.name}">
                    <h4>${cat.name}</h4>
                </div>
            `;
        });

        // Render Top Menu (Horizontal Categories)
        this.renderTopMenu();

        // Render Best Sellers
        let bestGrid = document.getElementById('best-sellers-scroll');
        bestGrid.innerHTML = '';
        getBestSellers().forEach(item => {
            let isFav = this.favourites.includes(item.id);
            bestGrid.innerHTML += `
                <div class="item-card-v" onclick="app.openItemDetail('${item.id}')">
                    <div class="ribbon"><div class="ribbon-blocks"><div class="ribbon-block"></div><div class="ribbon-block"></div><div class="ribbon-block"></div></div></div>
                    <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); app.toggleFavourite('${item.id}', this)">
                        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                    ${getItemImage(item)}
                    <h4>${item.title}</h4>
                    <span class="item-price-tag">Rs ${item.price}</span>
                </div>
            `;
        });

        // Render Deals
        let dealsList = document.getElementById('top-deals-list');
        dealsList.innerHTML = '';
        let deals = getDeals();
        if (deals.length === 0) { dealsList.innerHTML = '<p class="text-muted">No deals currently available.</p>'; }
        deals.forEach(deal => {
            let isFav = this.favourites.includes(deal.id);
            dealsList.innerHTML += `
                <div class="deal-card">
                    <button class="fav-btn ${isFav ? 'active' : ''}" style="top:5px; right:5px; width:28px; height:28px; font-size:0.9rem;" onclick="event.stopPropagation(); app.toggleFavourite('${deal.id}', this)">
                        <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                    </button>
                    ${deal.img ? `<img class="deal-img" src="${deal.img}" alt="${deal.title}" onerror="this.style.display='none'">` : `<div class="item-img-placeholder" style="width:80px;height:80px;margin:0;"></div>`}
                    <div class="deal-info">
                        <h4>${deal.title}</h4>
                        <p>${deal.desc || ''}</p>
                        <div class="deal-bottom">
                            <span class="price">Rs ${deal.price}</span>
                            <button class="btn-view" onclick="app.openItemDetail('${deal.id}')">VIEW</button>
                        </div>
                    </div>
                </div>
            `;
        });
    },

    renderMenuCategoriesView: function () {
        this.renderTopMenu();
    },

    renderTopMenu: function (activeCatId = null) {
        let topScroll = document.getElementById('top-category-scroll');
        if (!topScroll) return;
        topScroll.innerHTML = '';
        categories.forEach(cat => {
            let activeClass = cat.id === activeCatId ? 'active' : '';
            topScroll.innerHTML += `
                <div class="cat-pill ${activeClass}" onclick="app.openCategoryMenu('${cat.id}', '${cat.name}')">
                    <img src="${cat.icon}" onerror="this.style.display='none'">
                    <span>${cat.name}</span>
                </div>
            `;
        });
    },

    openCategoryMenu: function (catId, catName) {
        document.getElementById('category-page-title').innerText = catName;
        let list = document.getElementById('category-items-list');
        list.innerHTML = '';

        // Update Top Menu Active State
        this.renderTopMenu(catId);

        let items = getMenuData().filter(i => i.category === catId);
        if (items.length === 0) {
            list.innerHTML = `<p class="text-center text-muted mt-4">Menu items coming soon.</p>`;
        } else {
            items.forEach(item => {
                let isFav = this.favourites.includes(item.id);
                let priceDisp = item.hasSizes || item.type === 'pizza' ? `Starting Rs ${item.sizes?.[0]?.price || item.price}` : `Rs ${item.price}`;
                list.innerHTML += `
                    <div class="deal-card" onclick="app.openItemDetail('${item.id}')" style="cursor:pointer; position:relative;">
                        <button class="fav-btn ${isFav ? 'active' : ''}" style="top:5px; right:5px; width:28px; height:28px; font-size:0.9rem;" onclick="event.stopPropagation(); app.toggleFavourite('${item.id}', this)">
                            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        </button>
                        ${item.img ? `<img src="${item.img}" class="deal-img" style="margin:0; width:80px; height:80px;" onerror="this.style.display='none'">` : `<div class="item-img-placeholder" style="margin:0; width:80px; height:80px;"></div>`}
                        <div class="deal-info">
                            <h4>${item.title}</h4>
                            <p>${item.desc || ''}</p>
                            <div class="deal-bottom">
                                <span class="price text-danger">${priceDisp}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        // SWITCH VIEW to the categories page
        this.openView('view-menu-categories');
    },

    // BAKERY SPECIFIC RENDERING
    renderBakeryHome: function() {
        let grid = document.getElementById('bakery-categories-grid');
        grid.innerHTML = '';

        let drawerMenu = document.getElementById('bakery-drawer-menu');
        if (drawerMenu) drawerMenu.innerHTML = '';

        bakeryCategories.forEach(cat => {
            // Category Grid
            grid.innerHTML += `
                <div class="bakery-cat-card" onclick="app.openBakeryCategory('${cat.id}', '${cat.name}')">
                    <img src="${cat.icon}" alt="${cat.name}">
                    <h4>${cat.name}</h4>
                </div>
            `;
            
            // Drawer Links
            if (drawerMenu) {
                drawerMenu.innerHTML += `
                    <a href="javascript:void(0)" class="drawer-item" style="color:#333; padding: 12px 25px; font-weight:500; font-size:1.05rem;" onclick="app.closeBakeryDrawer(); app.openBakeryCategory('${cat.id}', '${cat.name}')">
                        ${cat.name} <i class="fa-solid fa-chevron-right ms-auto" style="font-size:0.8rem; color:#888;"></i>
                    </a>
                `;
            }
        });
    },

    openBakeryDrawer: function() {
        document.getElementById('bakery-drawer-overlay').classList.add('active');
        document.getElementById('bakery-side-drawer').classList.add('active');
    },

    closeBakeryDrawer: function() {
        if(document.getElementById('bakery-drawer-overlay')) {
            document.getElementById('bakery-drawer-overlay').classList.remove('active');
            document.getElementById('bakery-side-drawer').classList.remove('active');
        }
    },

    openBakeryCategory: function(catId, catName) {
        document.getElementById('bakery-category-title').innerText = catName;
        let list = document.getElementById('bakery-items-list');
        list.innerHTML = '';

        // Render sub-category horizontal pills (Tehzeeb style sidebar/pill)
        let topScroll = document.getElementById('bakery-subcat-scroll');
        topScroll.innerHTML = '';
        bakeryCategories.forEach(cat => {
            let activeClass = cat.id === catId ? 'active' : '';
            // Only using text for pills in bakery
            topScroll.innerHTML += `
                <div class="cat-pill ${activeClass}" style="border-radius:4px;" onclick="app.openBakeryCategory('${cat.id}', '${cat.name}')">
                    <span>${cat.name}</span>
                </div>
            `;
        });

        let items = getMenuData().filter(i => i.category === catId);
        if (items.length === 0) {
            list.innerHTML = `<p class="text-center text-muted mt-4">No items found.</p>`;
        } else {
            items.forEach(item => {
                let isFav = this.favourites.includes(item.id);
                let priceDisp = `Rs ${item.price}`;
                list.innerHTML += `
                    <div class="deal-card" onclick="app.openItemDetail('${item.id}')" style="cursor:pointer; border-radius:0; border:none; border-bottom:1px solid var(--border-color); box-shadow:none; position:relative;">
                        <button class="fav-btn ${isFav ? 'active' : ''}" style="top:10px; right:15px; width:28px; height:28px; font-size:0.9rem;" onclick="event.stopPropagation(); app.toggleFavourite('${item.id}', this)">
                            <i class="${isFav ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
                        </button>
                        ${item.img ? `<img src="${item.img}" class="deal-img" style="margin:0; width:100px; height:100px; border-radius:0; background:#f9f6f0;" onerror="this.style.display='none'">` : `<div class="item-img-placeholder" style="margin:0; width:100px; height:100px;"></div>`}
                        <div class="deal-info">
                            <h4 style="font-family:'Georgia',serif;">${item.title}</h4>
                            <p>${item.desc || ''}</p>
                            <div class="deal-bottom">
                                <span class="price text-danger">${priceDisp}</span>
                                <button class="btn-view" style="color:var(--text-main); border-color:#ccc;"><i class="fa-solid fa-plus"></i> Add</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        this.openView('view-bakery-items');
    },

    // Item Detail Modal & ADD TO CART
    openItemDetail: function (itemId) {
        let item = getMenuData().find(i => i.id === itemId);
        if (!item) return;

        if (item.isTimeRestricted && !isDealTimeActive()) {
            this.showToast('This deal is only available during Lunch (12pm-4pm) & Midnight (11pm-2am).');
            return;
        }

        let content = document.getElementById('item-modal-content');

        let isFav = this.favourites && this.favourites.includes(item.id);
        let favClass = isFav ? 'active' : '';

        let html = `
            <div style="position:relative;">
                ${item.img ? `<img src="${item.img}" class="item-detail-img" onerror="this.style.display='none'">` : `<div class="item-img-placeholder" style="width:100%; height:200px; background:#f0f0f0; margin-bottom:15px; border-radius:12px;"></div>`}
                <button id="fav-btn-${item.id}" class="fav-btn ${favClass}" onclick="app.toggleFavourite('${item.id}', this)"><i class="fa-solid fa-heart"></i></button>
            </div>
            <h3 class="item-detail-title">${item.title}</h3>
            <p class="item-detail-desc">${item.desc || ''}</p>
        `;

        // Handle Options
        if (item.isCustom) {
            html += `
                <div class="options-group" style="background: rgba(196, 161, 65, 0.1); padding: 15px; border-radius: 12px; border: 1px dashed #c4a141; margin-top:10px;">
                    <p class="text-dark mb-3" style="font-size:1rem; font-weight:600; line-height:1.4; text-align:center;">
                        <i class="fa-solid fa-phone-volume" style="color:#00695c;"></i> Please call or WhatsApp us to discuss your customized cake design and pricing.
                    </p>
                    
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        <a href="https://wa.me/923007588838" target="_blank" class="btn w-100" style="background:#25D366; color:white; font-weight:700; border:none; display:flex; align-items:center; justify-content:center; gap:10px; padding:12px;">
                            <i class="fa-brands fa-whatsapp" style="font-size:1.3rem;"></i> WhatsApp: 0300-7588838
                        </a>
                        
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            <a href="tel:03007588838" class="btn" style="background:#00695c; color:white; font-weight:600; font-size:0.85rem; padding:10px; border:none;">
                                <i class="fa-solid fa-phone"></i> 0300-7588838
                            </a>
                            <a href="tel:03008758558" class="btn" style="background:#00695c; color:white; font-weight:600; font-size:0.85rem; padding:10px; border:none;">
                                <i class="fa-solid fa-phone"></i> 0300-8758558
                            </a>
                        </div>
                        
                        <div style="text-align:center; padding-top:5px; border-top:1px solid rgba(0,0,0,0.05);">
                            <p style="font-size:0.85rem; margin:0; color:#555;">WhatsApp/Landline: <strong>0457 38 00 00</strong></p>
                        </div>
                        
                        <p class="text-muted mt-2" style="font-size:0.75rem; text-align:center; line-height:1.3;">
                            <i class="fa-solid fa-circle-info"></i> Note: Customizable cakes require 8 hours to 1 day advance notice. 50% advance payment is required.
                        </p>
                    </div>
                </div>
                <div style="margin-top:20px;">
                    <button class="btn btn-outline-secondary w-100" onclick="app.closeItemModal()">Close</button>
                </div>
            `;
        } else if (item.type === 'pizza') {
            html += `<input type="hidden" id="modal-item-id" value="${item.id}">`;

            // Flavor selection
            html += `<div class="options-group"><h5>Select Flavor</h5><div class="radio-tile-group">`;
            item.flavors.forEach((flv, idx) => {
                let sel = idx === 0 ? 'selected' : '';
                html += `<label class="radio-tile ${sel}" onclick="app.selectTile(this, 'flavor')">
                            <input type="radio" name="flavor" value="${flv}" ${idx === 0 ? 'checked' : ''}>
                            <span class="tile-label">${flv}</span>
                         </label>`;
            });
            html += `</div></div>`;

            // Size selection
            html += `<div class="options-group"><h5>Select Size</h5><div class="radio-tile-group">`;
            item.sizes.forEach((sz, idx) => {
                let sel = idx === 0 ? 'selected' : '';
                html += `<label class="radio-tile ${sel}" onclick="app.selectTile(this, 'size'); app.updateModalPrice(${sz.price})">
                            <input type="radio" name="size" value="${sz.name}|${sz.price}" ${idx === 0 ? 'checked' : ''}>
                            <span class="tile-label">${sz.name}</span>
                            <span class="tile-price">Rs ${sz.price}</span>
                         </label>`;
            });
            html += `</div></div>`;

            html += `
                <div style="display:flex; gap:15px; margin-top:20px;">
                    <button class="btn btn-primary w-100" onclick="app.addItemToCart()">Add to Bucket - Rs <span id="modal-final-price">${item.sizes[0].price}</span></button>
                </div>
            `;
        } else if (item.hasSizes) {
            html += `<input type="hidden" id="modal-item-id" value="${item.id}">`;
            html += `<div class="options-group"><h5>Select Size</h5><div class="radio-tile-group">`;
            item.sizes.forEach((sz, idx) => {
                let sel = idx === 0 ? 'selected' : '';
                html += `<label class="radio-tile ${sel}" onclick="app.selectTile(this, 'size'); app.updateModalPrice(${sz.price})">
                            <input type="radio" name="size" value="${sz.name}|${sz.price}" ${idx === 0 ? 'checked' : ''}>
                            <span class="tile-label">${sz.name}</span>
                            <span class="tile-price">Rs ${sz.price}</span>
                         </label>`;
            });
            html += `</div></div>`;
            html += `
                <div style="display:flex; gap:15px; margin-top:20px;">
                    <button class="btn btn-primary w-100" onclick="app.addItemToCart()">Add to Bucket - Rs <span id="modal-final-price">${item.sizes[0].price}</span></button>
                </div>
            `;
        } else {
            html += `<input type="hidden" id="modal-item-id" value="${item.id}">`;
            html += `<input type="hidden" name="size" value="Regular|${item.price}">`;
            html += `
                <div style="display:flex; gap:15px; margin-top:20px;">
                    <button class="btn btn-primary w-100" onclick="app.addItemToCart()">Add to Bucket - Rs <span id="modal-final-price">${item.price}</span></button>
                </div>
            `;
        }

        content.innerHTML = html;
        document.getElementById('item-modal').classList.add('active');
        document.getElementById('item-modal-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeItemModal: function () {
        document.getElementById('item-modal').classList.remove('active');
        document.getElementById('item-modal-overlay').classList.remove('active');
        document.body.style.overflow = '';
    },

    selectTile: function (element, groupName) {
        let parent = element.closest('.radio-tile-group');
        parent.querySelectorAll('.radio-tile').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        let radio = element.querySelector('input');
        radio.checked = true;
    },

    updateModalPrice: function (price) {
        document.getElementById('modal-final-price').innerText = price;
    },

    // Cart Logic
    addItemToCart: function () {
        let itemId = document.getElementById('modal-item-id').value;
        let item = getMenuData().find(i => i.id === itemId);

        let flavorNode = document.querySelector('input[name="flavor"]:checked');
        let sizeNode = document.querySelector('input[name="size"]:checked');

        let flavor = flavorNode ? flavorNode.value : '';
        let sizeData = sizeNode ? sizeNode.value.split('|') : ['Regular', item.price];

        let cartItem = {
            id: String(Date.now()),
            itemId: item.id,
            title: item.title,
            variant: (flavor ? flavor + ' - ' : '') + sizeData[0],
            price: parseInt(sizeData[1]),
            quantity: 1
        };

        if (item.isCustom) {
            let notesInput = document.getElementById('custom-cake-notes');
            if (notesInput && notesInput.value.trim() !== '') {
                cartItem.variant = 'Custom Base';
                cartItem.notes = notesInput.value.trim();
                cartItem.price = 0;
            } else {
                this.showToast('Please add customization notes for the cake.');
                return;
            }
        }

        // Check if identical item exists
        let existing = this.cart.find(i => i.itemId === cartItem.itemId && i.variant === cartItem.variant && i.notes === cartItem.notes);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push(cartItem);
        }

        this.saveCart();
        this.closeItemModal();
        this.showToast('Item added to bucket');
    },

    removeCartItem: function (cartId) {
        this.cart = this.cart.filter(i => i.id !== cartId);
        this.saveCart();
        if (document.getElementById('cart-sheet').classList.contains('active')) {
            this.renderCartSheet(); // Refresh
        }
    },

    updateCartQty: function (cartId, delta) {
        let item = this.cart.find(i => i.id === cartId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                this.removeCartItem(cartId);
            } else {
                this.saveCart();
                this.renderCartSheet();
            }
        }
    },

    saveCart: function () {
        let key = this.currentStore === 'bakery' ? 'ch_cart_bakery' : 'ch_cart';
        localStorage.setItem(key, JSON.stringify(this.cart));
        this.updateCartUI();
    },

    loadCart: function () {
        try {
            let key = this.currentStore === 'bakery' ? 'ch_cart_bakery' : 'ch_cart';
            this.cart = JSON.parse(localStorage.getItem(key)) || [];
        } catch (e) { this.cart = []; }
        this.updateCartUI();
    },

    updateCartUI: function () {
        let totalQty = this.cart.reduce((s, i) => s + i.quantity, 0);
        let totalPrice = this.cart.reduce((s, i) => s + (i.price * i.quantity), 0);

        // Update any custom cart badges in headers if they exist, else just keep state
        let headerBadge = document.querySelector('.cart-badge');
        if (headerBadge) {
            headerBadge.innerText = totalQty > 0 ? totalQty : '';
        }

        let bakeryBadge = document.getElementById('cart-badge-bakery');
        if (bakeryBadge) {
            bakeryBadge.innerText = totalQty > 0 ? totalQty : '';
            bakeryBadge.style.display = totalQty > 0 ? 'flex' : 'none';
        }

        let ffBadge = document.getElementById('cart-badge-ff');
        if (ffBadge) {
            ffBadge.innerText = totalQty > 0 ? totalQty : '';
            ffBadge.style.display = totalQty > 0 ? 'flex' : 'none';
        }

        if (totalQty === 0) {
            this.closeCartSheet();
        }
    },

    openCartSheet: function () {
        if (this.cart.length === 0) return;
        this.renderCartSheet();
        document.getElementById('cart-sheet').classList.add('active');
        document.getElementById('cart-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeCartSheet: function () {
        document.getElementById('cart-sheet').classList.remove('active');
        document.getElementById('cart-overlay').classList.remove('active');
        document.body.style.overflow = '';
    },

    renderCartSheet: function () {
        let list = document.getElementById('cart-items-list');
        list.innerHTML = '';
        let totalPrice = 0;

        this.cart.forEach(item => {
            totalPrice += item.price * item.quantity;
            list.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-variant">${item.variant}</div>
                        <div class="cart-item-price">Rs ${item.price}</div>
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="app.updateCartQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="app.updateCartQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            `;
        });
        document.getElementById('cart-sheet-total').innerText = totalPrice;
    },

    proceedToCheckout: function () {
        this.closeCartSheet();
        this.openView('view-checkout', true);
    },

    renderCheckoutView: function () {
        let list = document.getElementById('checkout-items');
        list.innerHTML = '';
        let total = 0;
        this.cart.forEach(item => {
            let rowTotal = item.price * item.quantity;
            total += rowTotal;
            list.innerHTML += `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.9rem;">
                    <span>${item.quantity}x ${item.title} <small class="text-muted">(${item.variant})</small></span>
                    <span>Rs ${rowTotal}</span>
                </div>
            `;
        });

        document.getElementById('checkout-subtotal').innerText = `Rs ${total}`;
        let fee = this.currentOrderType === 'delivery' ? 50 : 0;
        document.getElementById('checkout-delivery-fee').innerText = `Rs ${fee}`;
        document.getElementById('checkout-total').innerText = `Rs ${total + fee}`;

        // Address Display
        if (this.currentOrderType === 'pickup') {
            document.getElementById('checkout-address').innerText = "Store Pickup (Default Branch)";
        } else {
            let addT = this.selectedAddress ? this.selectedAddress.text : 'Click to select delivery address';
            document.getElementById('checkout-address').innerText = addT;
        }
    },

    placeOrder: async function () {
        if (this.cart.length === 0) return this.showToast('Cart is empty');
        if (!this.currentUser) {
            this.showToast('Please login to place order');
            this.openAuthModal();
            return;
        }
        if (this.currentOrderType === 'delivery' && !this.selectedAddress) {
            return this.showToast('Please select a delivery address');
        }

        // Disable button to prevent double-tap
        let checkoutBtn = document.getElementById('btn-checkout');
        if (checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Placing Order...'; }

        let total = this.cart.reduce((s, i) => s + (i.price * i.quantity), 0);
        let deliveryFee = this.currentOrderType === 'delivery' ? 50 : 0;
        let grandTotal = total + deliveryFee;
        let order = {
            id: 'ORD' + Math.floor(100000 + Math.random() * 900000),
            user: this.currentUser.email || 'Customer',
            type: this.currentOrderType,
            address: this.currentOrderType === 'delivery' ? this.selectedAddress.text : 'Store Pickup',
            items: JSON.parse(JSON.stringify(this.cart)),
            total: grandTotal,
            date: new Date().toISOString(),
            status: 'Pending',
            store: this.currentStore
        };

        let orderSaved = false;
        if (supabaseClient && this.currentUser) {
            const { error } = await supabaseClient.from('orders').insert([order]);
            if (error) {
                console.error('Supabase order save error:', error);
                // Inform user about the sync issue
                alert('⚠️ Database Sync Issue: Your order was placed but could not be synced to the server. Please ensure you are logged in and have a stable connection. Error: ' + error.message);
                
                // Still save locally as a last resort
                let orders = JSON.parse(localStorage.getItem('ch_orders')) || [];
                orders.push(order);
                localStorage.setItem('ch_orders', JSON.stringify(orders));
            } else {
                orderSaved = true;
                this.showToast('✅ Order placed successfully!');
            }
        } else {
            if (!this.currentUser) {
                alert('⚠️ You are not logged in correctly. Order saved only to this device.');
            }
            let orders = JSON.parse(localStorage.getItem('ch_orders')) || [];
            orders.push(order);
            localStorage.setItem('ch_orders', JSON.stringify(orders));
        }

        let cartSnapshot = JSON.parse(JSON.stringify(this.cart));
        this.cart = [];
        this.saveCart();

        if (checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.innerHTML = 'Place Order'; }

        // 📧 Send Email Invoice to Customer (via EmailJS)
        sendInvoiceEmail(order, cartSnapshot);

        // Show Invoice Modal
        this.showInvoiceModal(order, cartSnapshot, deliveryFee);
    },

    showInvoiceModal: function(order, cartItems, deliveryFee) {
        let itemsHtml = cartItems.map(i => `
            <tr>
                <td>${i.quantity}x</td>
                <td>${i.title}<br><small style="color:#888">${i.variant || ''}</small></td>
                <td style="text-align:right">Rs ${i.price * i.quantity}</td>
            </tr>
        `).join('');

        let dateStr = new Date(order.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
        let subtotal = cartItems.reduce((s, i) => s + (i.price * i.quantity), 0);

        let modal = document.getElementById('invoice-modal');
        let overlay = document.getElementById('invoice-overlay');
        if (!modal) return;

        document.getElementById('inv-order-id').innerText = order.id;
        document.getElementById('inv-date').innerText = dateStr;
        document.getElementById('inv-customer').innerText = order.user;
        document.getElementById('inv-type').innerText = order.type.toUpperCase() + ' (' + order.store + ')';
        document.getElementById('inv-address').innerText = order.address || 'N/A';
        document.getElementById('inv-items-body').innerHTML = itemsHtml;
        document.getElementById('inv-subtotal').innerText = subtotal;
        document.getElementById('inv-delivery').innerText = deliveryFee;
        document.getElementById('inv-total').innerText = order.total;

        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Show push notification
        this.sendPushNotification('🎉 Order Placed!', `Your order #${order.id} has been received. We will prepare it shortly!`);
    },

    closeInvoiceModal: function() {
        let modal = document.getElementById('invoice-modal');
        let overlay = document.getElementById('invoice-overlay');
        if (modal) modal.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
        this.goBack();
    },

    renderOrdersHistory: async function () {
        let list = document.getElementById('my-orders-list');
        list.innerHTML = '<p class="text-center text-muted">Loading...</p>';

        if (!this.currentUser) {
            list.innerHTML = '<p class="text-center text-muted">Please log in to view orders</p>';
            return;
        }

        let myOrders = [];
        let localOrders = JSON.parse(localStorage.getItem('ch_orders')) || [];

        if (supabaseClient) {
            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .eq('user', this.currentUser.email)
                .order('date', { ascending: false });
            
            if (!error && data) {
                myOrders = data;
                // Merge local orders that are missing in Supabase
                localOrders.forEach(lo => {
                    if (!myOrders.find(mo => mo.id === lo.id) && lo.user === this.currentUser.email) {
                        myOrders.push(lo);
                    }
                });
                myOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else {
                myOrders = localOrders.filter(o => o.user === this.currentUser.email).reverse();
            }
        } else {
            myOrders = localOrders.filter(o => o.user === this.currentUser.email).reverse();
        }

        list.innerHTML = '';
        if (myOrders.length === 0) {
            list.innerHTML = '<p class="text-center text-muted">No orders found.</p>';
            return;
        }

        myOrders.forEach(o => {
            let itemsSummary = (o.items || []).map(i => `${i.quantity}x ${i.title}`).join(', ');
            let dateStr = new Date(o.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            list.innerHTML += `
                <div class="order-card">
                    <div class="order-header">
                        <span class="order-id">#${o.id}</span>
                        <span class="order-status ${o.status === 'Pending' ? 'pending' : ''}">${o.status}</span>
                    </div>
                    <div class="order-items-preview">${itemsSummary}</div>
                    <div class="order-footer">
                        <span style="font-weight:normal; font-size:0.85rem; color:var(--text-muted)">${dateStr}</span>
                        <span class="text-danger">Rs ${o.total}</span>
                    </div>
                </div>
            `;
        });
    },

    // UI Helpers
    showToast: function (msg) {
        let toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    },

    openDrawer: function () {
        document.getElementById('side-drawer').classList.add('active');
        document.getElementById('drawer-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeDrawer: function () {
        document.getElementById('side-drawer').classList.remove('active');
        document.getElementById('drawer-overlay').classList.remove('active');
        document.body.style.overflow = '';
    },

    setupSlider: function () {
        let currentSlide = 0;
        let wrap = document.querySelector('.slider-wrap');
        let dots = document.querySelector('.slider-dots');

        // Inject slide images dynamically (using our generated banners)
        const slides = [
            { img: 'assets/slider1.jpeg', alt: 'Best Fast Food in Pakpattan' },
            { img: 'assets/slider2.jpeg', alt: 'Fresh Shawarma & Burgers Daily' },
            { img: 'assets/slider3.jpeg', alt: 'Amazing Deals Every Day' },
        ];

        if (wrap) {
            wrap.innerHTML = slides.map(s => `
                <div class="slide">
                    <img src="${s.img}" alt="${s.alt}" onerror="this.src='assets/logo.png'; this.style.height='160px'; this.style.objectFit='contain';">
                </div>
            `).join('');
        }

        let total = slides.length;

        // Create dots
        if (dots) {
            dots.innerHTML = '';
            for (let i = 0; i < total; i++) {
                dots.innerHTML += `<div class="dot ${i === 0 ? 'active' : ''}"></div>`;
            }
        }

        this.sliderInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % total;
            if (wrap) wrap.style.transform = `translateX(-${currentSlide * 100}%)`;
            document.querySelectorAll('.dot').forEach((d, i) => {
                d.className = i === currentSlide ? 'dot active' : 'dot';
            });
        }, 4000);
    },

    // Auth Logic
    openAuthModal: function () {
        this.closeDrawer();
        document.getElementById('auth-modal').classList.add('active');
        document.getElementById('auth-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
        this.switchAuthTab('login');
        document.getElementById('auth-error').style.display = 'none';
        document.getElementById('auth-success').style.display = 'none';
    },

    closeAuthModal: function () {
        document.getElementById('auth-modal').classList.remove('active');
        document.getElementById('auth-overlay').classList.remove('active');
        document.body.style.overflow = '';
    },

    switchAuthTab: function (tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

        if (tab === 'login') {
            document.querySelectorAll('.auth-tab')[0].classList.add('active');
            document.getElementById('auth-login-form').classList.add('active');
        } else {
            document.querySelectorAll('.auth-tab')[1].classList.add('active');
            document.getElementById('auth-signup-form').classList.add('active');
        }
    },

    checkAuth: async function () {
        if (!supabaseClient) return;
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) throw error;
            if (session) {
                this.currentUser = session.user;
                this.updateUserUI();
                this.setupRealtimeListeners();
            }
        } catch (e) {
            console.warn('Session recovery failed:', e);
        }
    },

    updateUserUI: function () {
        // Elements for Fast Food Drawer
        let nameEl = document.getElementById('drawer-user-name');
        let emailEl = document.getElementById('drawer-user-email');
        let logoutBtn = document.getElementById('btn-logout');

        // Elements for Bakery Drawer
        let bakNameEl = document.getElementById('bakery-drawer-user-name');
        let bakEmailEl = document.getElementById('bakery-drawer-user-email');

        // Splash UI
        let splashAuth = document.getElementById('splash-auth-section');

        if (this.currentUser) {
            let email = this.currentUser.email || this.currentUser.username;
            let displayEmail = email.length > 20 ? email.substring(0, 18) + '...' : email;

            // Update FF Drawer
            if (nameEl) nameEl.innerText = 'Welcome Back';
            if (emailEl) {
                emailEl.innerText = displayEmail;
                emailEl.onclick = null;
            }
            if (logoutBtn) logoutBtn.style.display = 'flex';

            // Update Bakery Drawer
            if (bakNameEl) bakNameEl.innerText = 'Welcome Back';
            if (bakEmailEl) {
                bakEmailEl.innerText = displayEmail;
                bakEmailEl.onclick = null;
            }

            // Update Splash UI
            if (splashAuth) {
                splashAuth.innerHTML = `
                    <div class="splash-profile-card">
                        <i class="fa-solid fa-circle-user fa-3x mb-3" style="color:var(--primary-color);"></i>
                        <h4>Welcome, ${email.split('@')[0]}</h4>
                        <p>${email}</p>
                        <button class="btn btn-primary w-100 mb-3" onclick="app.showToast('Select a store below to continue!')">Logged In</button>
                        <button class="btn btn-text btn-sm" onclick="app.logout()">Not you? Logout</button>
                    </div>
                `;
            }
        } else {
            // Guest State for everything
            if (nameEl) nameEl.innerText = 'Guest User';
            if (emailEl) {
                emailEl.innerText = 'Login / Sign Up';
                emailEl.onclick = () => this.openAuthModal();
            }
            if (logoutBtn) logoutBtn.style.display = 'none';

            if (bakNameEl) bakNameEl.innerText = 'Guest User';
            if (bakEmailEl) {
                bakEmailEl.innerText = 'Login / Sign Up';
                bakEmailEl.onclick = () => this.openAuthModal();
            }

            if (splashAuth) {
                splashAuth.innerHTML = `
                    <button class="btn btn-outline" onclick="app.openAuthModal()">Login / Sign Up</button>
                `;
            }
        }
    },

    signup: async function () {
        let email = document.getElementById('signup-email').value.trim();
        let pwd = document.getElementById('signup-password').value;
        let confirm = document.getElementById('signup-confirm-password').value;
        let err = document.getElementById('auth-error');
        let succ = document.getElementById('auth-success');
        err.style.display = 'none';
        succ.style.display = 'none';

        if (!email || !pwd) { err.innerText = 'Please fill all fields.'; err.style.display = 'block'; return; }
        if (pwd.length < 6) { err.innerText = 'Password must be at least 6 characters.'; err.style.display = 'block'; return; }
        if (pwd !== confirm) { err.innerText = 'Passwords do not match.'; err.style.display = 'block'; return; }

        let btn = document.getElementById('btn-signup');
        let originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating...';
        btn.disabled = true;

        try {
            if (!supabaseClient) {
                this.currentUser = { email: email, username: email };
                localStorage.setItem('ch_user', JSON.stringify(this.currentUser));
                this.showToast('Account Created!');
                this.closeAuthModal();
                this.updateUserUI();
                return;
            }

            const { data, error } = await supabaseClient.auth.signUp({ email: email, password: pwd });
            if (error) {
                console.error("Signup Error:", error);
                let msg = error.message || '';
                if (error.status === 422) {
                    err.innerText = '❌ Error (422): Email confirm nahi ho saki ya Rate limit hit ho gayi. 5 min baad try karein.';
                } else if (msg.toLowerCase().includes('already registered')) {
                    err.innerText = 'This email is already registered. Please login instead.';
                } else {
                    err.innerText = msg;
                }
                err.style.display = 'block';
            } else if (data && data.user && data.user.identities && data.user.identities.length === 0) {
                // Duplicate account silently ignored by Supabase — detect it
                err.innerText = 'This email is already registered. Please login instead.';
                err.style.display = 'block';
            } else {
                // Show OTP verification form
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                document.getElementById('auth-otp-form').classList.add('active');
                this.tempEmail = email;
                this.tempOtpType = 'signup';
                succ.innerText = '✅ OTP sent to ' + email + '. Check your inbox.';
                succ.style.display = 'block';
            }
        } catch (e) {
            let msg = e.message || e.toString();
            err.innerText = msg.includes('[object') ? 'Network error. Please check your connection.' : msg;
            err.style.display = 'block';
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    verifyOTP: async function () {
        let otp = document.getElementById('otp-code').value;
        let err = document.getElementById('auth-error');
        if (!otp) return;

        let btn = document.getElementById('btn-verify-otp');
        let originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
        btn.disabled = true;

        if (!supabaseClient) { btn.disabled = false; btn.innerHTML = originalText; return; }

        try {
            const { data, error } = await supabaseClient.auth.verifyOtp({
                email: this.tempEmail,
                token: otp,
                type: 'signup'
            });

            if (error) {
                let msg = error.message || (typeof error === 'object' ? JSON.stringify(error) : error);
                err.innerText = msg; err.style.display = 'block';
            } else {
                this.showToast('Email verified! You are logged in.');
                this.closeAuthModal();
            }
        } catch (e) {
            let msg = e.message || e.toString();
            err.innerText = msg === '[object Object]' ? 'Network Error' : msg;
            err.style.display = 'block';
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    login: async function () {
        let email = document.getElementById('login-email').value.trim();
        let pwd = document.getElementById('login-password').value;
        let err = document.getElementById('auth-error');
        err.style.display = 'none';

        if (!email || !pwd) { err.innerText = 'Please enter email and password.'; err.style.display = 'block'; return; }

        let btn = document.getElementById('btn-login');
        let originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
        btn.disabled = true;

        try {
            if (!supabaseClient) {
                this.currentUser = { email: email, username: email };
                localStorage.setItem('ch_user', JSON.stringify(this.currentUser));
                this.showToast('Logged In!');
                this.closeAuthModal();
                this.updateUserUI();
                return;
            }

            const { data, error } = await supabaseClient.auth.signInWithPassword({ email: email, password: pwd });
            if (error) {
                console.error("Login Error:", error);
                let msg = error.message || '';
                if (error.status === 400 || msg.toLowerCase().includes('invalid login') || msg.toLowerCase().includes('invalid credentials')) {
                    err.innerText = '❌ Email ya Password galat hai. Please check karein.';
                } else if (msg.toLowerCase().includes('email not confirmed')) {
                    err.innerText = '📧 Please verify your email first. Check your inbox.';
                } else {
                    err.innerText = msg;
                }
                err.style.display = 'block';
            } else {
                this.showToast('✅ Login successful!');
                this.requestNotificationPermission();
            }
        } catch (e) {
            let msg = e.message || e.toString();
            err.innerText = msg.includes('[object') ? 'Network error. Check your connection.' : msg;
            err.style.display = 'block';
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    },

    logout: async function () {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        } else {
            localStorage.removeItem('ch_user');
            this.currentUser = null;
            this.updateUserUI();
        }
        this.closeDrawer();
        this.showToast('Logged Out');
    },

    // Address Book Logic
    openAddressModal: function () {
        this.closeDrawer();
        document.getElementById('address-modal').classList.add('active');
        document.getElementById('address-overlay').classList.add('active');
        this.renderAddresses();
    },

    openStoreLocator: function () {
        const url = "https://www.google.com/maps/place/CH.Fast+Food/@30.3494974,73.3802453,17z/data=!4m15!1m8!3m7!1s0x393d59f9c4fc7bb3:0x13db4ba5e7728e4!2sCH.Fast+Food!8m2!3d30.3494974!4d73.3828202!10e9!16s%2Fg%2F11x1qq1tc7!3m5!1s0x393d59f9c4fc7bb3:0x13db4ba5e7728e4!8m2!3d30.3494974!4d73.3828202!16s%2Fg%2F11x1qq1tc7?entry=ttu&g_ep=EgoyMDI2MDQxNC4wIKXMDSoASAFQAw%3D%3D";
        window.open(url, '_blank');
        this.closeDrawer();
        this.closeBakeryDrawer();
    },

    openHelp: function () {
        this.openView('view-help', true);
    },

    loadUserAddresses: function () {
        let saved = localStorage.getItem('ch_addresses_' + (this.currentUser ? this.currentUser.email : 'guest'));
        if (saved) this.addresses = JSON.parse(saved);
        else this.addresses = [];
        this.renderAddresses();
    },

    saveNewAddress: function () {
        let city = document.getElementById('new-address-city').value;
        let area = document.getElementById('new-address-area').value;
        let landmark = document.getElementById('new-address-landmark').value;

        if (!area || !landmark) {
            this.showToast('Please enter Colony and Landmark');
            return;
        }

        let txt = `${area}, Near ${landmark}, ${city}`;

        let newAddr = { id: Date.now(), text: txt };
        this.addresses.push(newAddr);
        this.selectedAddress = newAddr;

        // Save
        let key = 'ch_addresses_' + (this.currentUser ? this.currentUser.email : 'guest');
        localStorage.setItem(key, JSON.stringify(this.addresses));

        // Update UI
        document.getElementById('new-address-area').value = '';
        document.getElementById('new-address-landmark').value = '';
        this.setOrderType('delivery'); // Selects delivery and updates text
        this.closeAddressModal();
        this.showToast('Address Saved');
    },

    renderAddresses: function () {
        let list = document.getElementById('address-list');
        list.innerHTML = '';
        if (this.addresses.length === 0) {
            list.innerHTML = '<p class="text-sm text-muted">No saved addresses</p>';
            return;
        }
        this.addresses.forEach(a => {
            let active = this.selectedAddress && this.selectedAddress.id === a.id ? 'font-bold text-danger' : '';
            list.innerHTML += `
                <div style="padding:10px; border:1px solid var(--border-color); border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="app.selectAddress(${a.id})">
                    <span class="${active}">${a.text}</span>
                    <i class="fa-solid fa-chevron-right text-muted"></i>
                </div>
            `;
        });
    },

    selectAddress: function (id) {
        let addr = this.addresses.find(a => a.id === id);
        if (addr) {
            this.selectedAddress = addr;
            this.setOrderType('delivery');
            this.closeAddressModal();
        }
    },

    // Favourites Logic
    // --- SEARCH SYSTEM ---
    openSearch: function() {
        document.getElementById('search-overlay').classList.add('active');
        document.getElementById('search-sheet').classList.add('active');
        setTimeout(() => document.getElementById('search-input').focus(), 300);
        this.handleSearch();
    },

    closeSearch: function() {
        document.getElementById('search-overlay').classList.remove('active');
        document.getElementById('search-sheet').classList.remove('active');
    },

    handleSearch: function() {
        let val = document.getElementById('search-input').value.toLowerCase();
        let list = document.getElementById('search-results-list');
        list.innerHTML = '';
        if(val.length < 2) {
            list.innerHTML = '<p class="text-center text-muted w-100 mt-4" style="grid-column:1/-1;">Type at least 2 characters...</p>';
            return;
        }

        let storeItems = getMenuData();
        let matched = storeItems.filter(i => i.title.toLowerCase().includes(val) || (i.category && i.category.toLowerCase().includes(val)));
        
        if(matched.length === 0) {
            list.innerHTML = '<p class="text-center text-muted w-100 mt-4" style="grid-column:1/-1;">No items found.</p>';
            return;
        }

        matched.forEach(item => {
            let priceDisp = item.price > 0 ? `Rs ${item.price}` : 'Price Pending';
            list.innerHTML += `
                <div class="deal-card" onclick="app.closeSearch(); app.openItemDetail('${item.id}')" style="cursor:pointer; border-radius:12px; border:1px solid var(--border-color); display:flex; gap:15px; background:var(--card-bg); padding:10px; margin-bottom:10px;">
                    ${item.img ? `<img src="${item.img}" class="deal-img" onerror="this.style.display='none'" style="width:70px;height:70px;object-fit:cover;border-radius:8px;">` : `<div style="width:70px;height:70px;background:#f0f0f0;border-radius:8px;"></div>`}
                    <div class="deal-info" style="flex:1;">
                        <h4 style="margin:0; font-size:1rem;">${item.title}</h4>
                        <p style="margin:5px 0 0; font-size:0.8rem; color:var(--text-muted);">${item.desc || ''}</p>
                        <div style="margin-top:10px; font-weight:700; color:var(--primary-color);">${priceDisp}</div>
                    </div>
                </div>
            `;
        });
    },

    loadFavourites: function () {
        try {
            this.favourites = JSON.parse(localStorage.getItem('ch_favourites')) || [];
        } catch(e) { this.favourites = []; }
    },

    saveFavourites: function () {
        localStorage.setItem('ch_favourites', JSON.stringify(this.favourites));
    },

    toggleFavourite: function (itemId, btnEl) {
        let idx = this.favourites.indexOf(itemId);
        if (idx === -1) {
            this.favourites.push(itemId);
            if (btnEl) {
                btnEl.classList.add('active');
                btnEl.innerHTML = '<i class="fa-solid fa-heart"></i>';
            }
            this.showToast('Added to Favourites ❤️');
        } else {
            this.favourites.splice(idx, 1);
            if (btnEl) {
                btnEl.classList.remove('active');
                btnEl.innerHTML = '<i class="fa-regular fa-heart"></i>';
            }
            this.showToast('Removed from Favourites');
        }
        this.saveFavourites();
    },

    renderFavourites: function () {
        let list = document.getElementById('favourites-list');
        list.innerHTML = '';

        if (this.favourites.length === 0) {
            list.innerHTML = '<div class="coming-soon"><i class="fa-regular fa-heart fa-3x"></i><p>No favourites yet. Tap ❤️ on items to save them here!</p></div>';
            return;
        }

        let menuData = getMenuData();
        this.favourites.forEach(itemId => {
            let item = menuData.find(i => i.id === itemId);
            if (!item) return;
            let priceDisp = item.hasSizes || item.type === 'pizza'
                ? `Starting Rs ${item.sizes?.[0]?.price || item.price}`
                : `Rs ${item.price}`;
            list.innerHTML += `
                <div class="deal-card">
                    ${item.img ? `<img src="${item.img}" class="deal-img" style="margin:0; width:80px; height:80px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">` : ''}
                    <div class="item-img-placeholder" style="margin:0; width:80px; height:80px; display:${item.img ? 'none' : 'block'};"></div>
                    <div class="deal-info">
                        <h4>${item.title}</h4>
                        <p>${item.desc || ''}</p>
                        <div class="deal-bottom">
                            <span class="price text-danger">${priceDisp}</span>
                            <div style="display:flex; gap:10px;">
                                <button class="btn-view" onclick="app.openItemDetail('${item.id}')">ORDER</button>
                                <button class="fav-btn active" style="position:static; width:30px; height:30px;" onclick="app.toggleFavourite('${item.id}', this); app.renderFavourites()">
                                    <i class="fa-solid fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    },

    // --- NOTIFICATION SYSTEM ---
    loadNotifications: function() {
        try {
            this.notifications = JSON.parse(localStorage.getItem('ch_notifications')) || [];
            this.updateNotifBadge();
        } catch(e) { this.notifications = []; }
    },

    saveNotifications: function() {
        localStorage.setItem('ch_notifications', JSON.stringify(this.notifications));
        this.updateNotifBadge();
    },

    addNotification: function(title, body) {
        let n = {
            id: Date.now(),
            title: title,
            body: body,
            time: new Date().toISOString(),
            read: false
        };
        this.notifications.unshift(n); // Newest first
        if (this.notifications.length > 20) this.notifications.pop(); // Keep last 20
        this.saveNotifications();
        this.showToast('🔔 ' + title);
    },

    updateNotifBadge: function() {
        let unread = this.notifications.filter(n => !n.read).length;
        let b1 = document.getElementById('notif-badge');
        let b2 = document.getElementById('notif-badge-bakery');
        
        if(unread > 0) {
            if(b1) { b1.innerText = unread; b1.style.display = 'block'; }
            if(b2) { b2.innerText = unread; b2.style.display = 'block'; }
        } else {
            if(b1) b1.style.display = 'none';
            if(b2) b2.style.display = 'none';
        }
    },

    renderNotifications: function() {
        let list = document.getElementById('notifications-list');
        list.innerHTML = '';

        if (this.notifications.length === 0) {
            list.innerHTML = '<div class="coming-soon"><i class="fa-solid fa-bell fa-3x" style="color:var(--primary-color);"></i><p>No new notifications.</p></div>';
            return;
        }

        this.notifications.forEach(n => {
            let timeStr = new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            list.innerHTML += `
                <div class="notif-card ${n.read ? '' : 'unread'}" onclick="app.markNotifRead(${n.id})">
                    <div class="notif-icon-circle">
                        <i class="fa-solid fa-check-double"></i>
                    </div>
                    <div class="notif-content">
                        <div class="notif-title">${n.title}</div>
                        <p style="font-size:0.85rem; color:var(--text-muted);">${n.body}</p>
                        <div class="notif-time">${timeStr}</div>
                    </div>
                    ${n.read ? '' : '<div class="notif-unread-dot"></div>'}
                </div>
            `;
        });
    },

    markNotifRead: function(id) {
        let n = this.notifications.find(notif => notif.id === id);
        if(n) n.read = true;
        this.saveNotifications();
        this.renderNotifications();
    },

    // Call this for demonstrating the "Order Complete" notification
    simulateOrderCompletion: function(orderId) {
        this.addNotification('Order Completed!', `Great news! Your order #${orderId} has been successfully completed and delivered. Enjoy your meal!`);
    },

    openPrivacyPolicy: function() {
        this.openView('view-privacy', true);
    },

    forgotPassword: function () {
        // Switch to forgot password flow
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.getElementById('auth-forgot-form').classList.add('active');
        document.getElementById('auth-error').style.display = 'none';
        document.getElementById('auth-success').style.display = 'none';
        // Pre-fill email if already entered
        let emailVal = document.getElementById('login-email').value.trim();
        if (emailVal) document.getElementById('forgot-email').value = emailVal;
    },

    sendForgotOTP: async function() {
        let email = document.getElementById('forgot-email').value.trim();
        let err = document.getElementById('auth-error');
        let succ = document.getElementById('auth-success');
        err.style.display = 'none';
        succ.style.display = 'none';

        if (!email) { err.innerText = 'Please enter your email address.'; err.style.display = 'block'; return; }

        let btn = document.getElementById('btn-send-forgot-otp');
        let orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        try {
            if (!supabaseClient) { this.showToast('OTP sent! (Mock Mode)'); return; }
            // Use signInWithOtp to send OTP — shouldCreateUser: false ensures only existing users can reset
            const { error } = await supabaseClient.auth.signInWithOtp({ email: email, options: { shouldCreateUser: false } });
            if (error) {
                console.error("OTP Reset Error:", error);
                let msg = error.message || '';
                if (error.status === 422) {
                    err.innerText = '❌ Account Not Found: Pehle is email se Sign-up karein.';
                } else if (msg.toLowerCase().includes('user not found')) {
                    err.innerText = '❌ Is email ka koi account nahi mila.';
                } else {
                    err.innerText = msg;
                }
                err.style.display = 'block';
            } else {
                this.tempEmail = email;
                this.tempOtpType = 'reset';
                // Show OTP + new password fields
                document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
                document.getElementById('auth-reset-otp-form').classList.add('active');
                succ.innerText = '✅ OTP sent to ' + email + '. Check your inbox.';
                succ.style.display = 'block';
            }
        } catch(e) {
            err.innerText = e.message || 'Error sending OTP.';
            err.style.display = 'block';
        } finally {
            btn.innerHTML = orig;
            btn.disabled = false;
        }
    },

    verifyResetOTP: async function() {
        let otp = document.getElementById('reset-otp-code').value.trim();
        let newPwd = document.getElementById('reset-new-password').value;
        let confirmPwd = document.getElementById('reset-confirm-password').value;
        let err = document.getElementById('auth-error');
        let succ = document.getElementById('auth-success');
        err.style.display = 'none';
        succ.style.display = 'none';

        if (!otp) { err.innerText = 'Please enter the OTP code.'; err.style.display = 'block'; return; }
        if (!newPwd || newPwd.length < 6) { err.innerText = 'Password must be at least 6 characters.'; err.style.display = 'block'; return; }
        if (newPwd !== confirmPwd) { err.innerText = 'Passwords do not match.'; err.style.display = 'block'; return; }

        let btn = document.getElementById('btn-verify-reset-otp');
        let orig = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Verifying...';
        btn.disabled = true;

        try {
            if (!supabaseClient) { this.showToast('Password reset! (Mock)'); this.closeAuthModal(); return; }
            // Step 1: Verify OTP (this logs user in)
            const { error: otpError } = await supabaseClient.auth.verifyOtp({
                email: this.tempEmail,
                token: otp,
                type: 'email'
            });
            if (otpError) {
                err.innerText = '❌ Invalid OTP. Please check and try again.';
                err.style.display = 'block';
                return;
            }
            // Step 2: Update password
            const { error: pwdError } = await supabaseClient.auth.updateUser({ password: newPwd });
            if (pwdError) {
                err.innerText = pwdError.message || 'Could not update password.';
                err.style.display = 'block';
            } else {
                succ.innerText = '✅ Password updated successfully! You are now logged in.';
                succ.style.display = 'block';
                setTimeout(() => this.closeAuthModal(), 2000);
            }
        } catch(e) {
            err.innerText = e.message || 'Error verifying OTP.';
            err.style.display = 'block';
        } finally {
            btn.innerHTML = orig;
            btn.disabled = false;
        }
    },

    requestNotificationPermission: async function() {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    },

    sendPushNotification: function(title, body) {
        // In-app notification
        this.addNotification(title, body);
        // Native push notification via service worker
        if ('serviceWorker' in navigator && Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, {
                    body: body,
                    icon: 'assets/logo.png',
                    badge: 'assets/logo.png',
                    vibrate: [200, 100, 200],
                    tag: 'order-update',
                    renotify: true
                });
            }).catch(e => console.warn('Push notification error:', e));
        }
    },

    setupRealtimeListeners: function() {
        if (!supabaseClient) return;

        // 1. PUBLIC LISTENER: Price Overrides (For everyone, including guests)
        if (!this.settingsSubscription) {
            this.settingsSubscription = supabaseClient
                .channel('public-settings')
                .on('postgres_changes', { 
                    event: '*', 
                    schema: 'public', 
                    table: 'app_settings',
                    filter: 'setting_key=eq.price_overrides'
                }, (payload) => {
                    console.log('Real-time Price Update received:', payload);
                    if (payload.new && payload.new.setting_value) {
                        globalPriceOverrides = payload.new.setting_value;
                        // Forcing a re-render of current view if it's a menu view
                        const activeView = this.currentViewId;
                        if (activeView === 'view-fast-food' || activeView === 'view-bakery' || activeView === 'view-menu-items' || activeView === 'view-bakery-items') {
                            this.renderCurrentView();
                        }
                        this.showToast('💰 Prices have been updated by admin!');
                    }
                })
                .subscribe();
        }

        // 2. PRIVATE LISTENER: Order Status (Only for logged-in users)
        if (this.currentUser && !this.ordersSubscription) {
            this.ordersSubscription = supabaseClient
                .channel('my-orders-status')
                .on('postgres_changes', { 
                    event: 'UPDATE', 
                    schema: 'public', 
                    table: 'orders',
                    filter: `user=eq.${this.currentUser.email}`
                }, (payload) => {
                    const updatedOrder = payload.new;
                    let statusMsg = updatedOrder.status === 'Completed'
                        ? `🎉 Your order #${updatedOrder.id} is COMPLETED! Enjoy your meal!`
                        : `Your order #${updatedOrder.id} is now: ${updatedOrder.status}`;
                    let title = updatedOrder.status === 'Completed' ? '✅ Order Completed!' : '🔔 Order Update';
                    this.sendPushNotification(title, statusMsg);
                    this.showToast(`${title}: ${updatedOrder.status}`);
                    
                    if (this.currentViewId === 'view-orders') {
                        this.renderOrdersHistory();
                    }
                })
                .subscribe();
        }
    },

    renderCurrentView: function() {
        // Simple helper to refresh whatever the user is looking at
        if (this.currentViewId === 'view-fast-food') this.renderFastFoodView();
        else if (this.currentViewId === 'view-bakery') this.renderBakeryView();
        else if (this.currentViewId === 'view-menu-items') this.renderMenuItems(this.currentCategory);
        else if (this.currentViewId === 'view-bakery-items') this.renderBakeryItems(this.currentCategory);
    }
};

// Initialize app when DOM loads
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});
