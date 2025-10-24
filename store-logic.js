// --- INLINED PRODUCT DATA (Guaranteed Data Access) ---
window.products = [];
const productDataJsonString = `[
  { "base_id": "artcommission", "base_name": "Art Commission", "options_config": [ { "name": "Style", "label": "1. Choose a Style" }, { "name": "View", "label": "2. Choose a View" }, { "name": "Finish", "label": "3. Choose a Finish" } ], "options": { "Chibi": { "variants": { "Portrait": { "Messy Scribble": { "id": 1, "price": 1000, "stripe_price_id": "price_1OHtt1IaRpVk2G5NpEdMFkZN", "type": "digital" }, "Sketch": { "id": 2, "price": 2000, "stripe_price_id": "price_1OHtxbIaRpVk2G5NNAyqkJQS", "type": "digital" }, "Lineart": { "id": 3, "price": 4000, "stripe_price_id": "price_1OHu57IaRpVk2G5NB5En5gDO", "type": "digital" }, "Flats": { "id": 4, "price": 5500, "stripe_price_id": "price_1ObzkjIaRpVk2G5NcJ2Y6RZL", "type": "digital" }, "Cel-Shaded": { "id": 5, "price": 7000, "stripe_price_id": "price_1OHu64IaRpVk2G5NgEHw80Pi", "type": "digital" }, "Painterly": { "id": 6, "price": 11500, "stripe_price_id": "price_1OHu6LIaRpVk2G5NNOpEEfOs", "type": "digital" } } } } },
  { "base_id": "webdesigncarrd", "base_name": "Web Design (Carrd)", "variants": [ { "id": 93, "name": "Webdesign // Carrd Splash Page", "price": 12500, "stripe_price_id": "price_1SAku2IaRpVk2G5NTky95ZcV", "type": "digital" }, { "id": 94, "name": "Webdesign // Carrd Starter Site", "price": 25000, "stripe_price_id": "price_1SAkxYIaRpVk2G5N1KgBviWx", "type": "digital" }, { "id": 95, "name": "Webdesign // Carrd Pro Site", "price": 60000, "stripe_price_id": "price_1SAkydIaRpVk2G5NGO5LPbiv", "type": "digital" } ] },
  { "base_id": "webdesigncustom", "base_name": "Web Design (Custom/Self-Hosted)", "variants": [ { "id": 96, "name": "Webdesign // Self-Hosted Essential", "price": 150000, "stripe_price_id": "price_1SAl0iIaRpVk2G5NcMCjYCqY", "type": "digital" }, { "id": 97, "name": "Webdesign // Self-Hosted Business", "price": 250000, "stripe_price_id": "price_1SAl1kIaRpVk2G5Ny3KwVN4Y", "type": "digital" }, { "id": 98, "name": "Webdesign // Self-Hosted Prestige", "price": 450000, "stripe_price_id": "price_1SAl3QIaRpVk2G5NJCf4vS5Y", "type": "digital" } ] },
  { "base_id": "webdesignecommerce", "base_name": "Web Design (E-Commerce)", "variants": [ { "id": 99, "name": "Webdesign // E-Commerce Starter", "price": 300000, "stripe_price_id": "price_1SAl4XIaRpVk2G5NfgtfdTHP", "type": "digital" }, { "id": 100, "name": "Webdesign // E-Commerce Advanced", "price": 500000, "stripe_price_id": "price_1SAl5vIaRpVk2G5NqwNvLwT6", "type": "digital" }, { "id": 101, "name": "Webdesign // E-Commerce Enterprise", "price": 1000000, "stripe_price_id": "price_1SAl8mIaRpVk2G5NGh2GTPYf", "type": "digital" } ] }
]`;

// --- FLATTENING LOGIC ---
function flattenProductList(nestedProducts) {
    let flatList = [];
    nestedProducts.forEach(baseProduct => {
        const pushVariant = (variant, baseName, nameSuffix, baseImage) => { variant.name = variant.name || `${baseName} // ${nameSuffix}`; variant.image = baseProduct.base_image || ''; if (!variant.id) { return; } flatList.push(variant); };
        if (baseProduct.options) {
            const baseName = baseProduct.base_name; const baseImage = baseProduct.base_image;
            for (const key1 in baseProduct.options) { const option1 = baseProduct.options[key1];
                for (const key2 in option1.variants) { const option2 = option1.variants[key2];
                    if (typeof option2 === 'object' && !option2.id) { 
                        for (const key3 in option2) { const variant = option2[key3]; const nameSuffix = `${key1} - ${key2} - ${key3}`; pushVariant(variant, baseName, nameSuffix, baseImage); }
                    } else if (option2.id) { const variant = option2; const nameSuffix = key2; pushVariant(variant, baseName, nameSuffix, baseImage); }
                }
            }
        } else if (baseProduct.variants) {
            const baseName = baseProduct.base_name; const baseImage = baseProduct.base_image;
            baseProduct.variants.forEach(variant => { const nameSuffix = variant.option_label || variant.name || baseProduct.base_name; pushVariant(variant, baseName, nameSuffix, baseImage); });
        }
    });
    return flatList;
}

// --- GLOBAL VARIABLES & CONSTANTS ---
let stripe, cart = [];
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51OHfwcIaRpVk2G5N78UiDGdQLFzmUh1dv6bbA0D4N4I5bK2n7mPruCL8YpY10RuhIImCOJka8aikchX9RAi017k100KJUWJMK7';
const firebaseConfig = { apiKey: "AIzaSyCqad15n5UeSl2AwnfzeIJuZLCNrVm0CrE", authDomain: "userportalv2.firebaseapp.com", projectId: "userportalv2", storageBucket: "userportalv2.firebasestorage.app", messagingSenderId: "420794125847", appId: "1:420794125847:web:ad75a2d5f7380934061652" };

// --- CORE CART/UI FUNCTIONS ---
function saveCart(){localStorage.setItem("carrd-cart-adv-nc",JSON.stringify(cart))}
function loadCart(){const t=localStorage.getItem("carrd-cart-adv-nc");cart=t?JSON.parse(t):[]}
function formatPrice(t){return(t/100).toLocaleString("en-US",{style:"currency",currency:"USD"})}
function showNotification(productName) {const t = document.createElement("div");t.className = "notification-toast";t.innerHTML = `<div class="toast-product-name">${productName}</div><div class="toast-main-message">Added to Cart</div>`;document.getElementById('notification-container').appendChild(t);setTimeout(() => {t.classList.add("show");}, 10);setTimeout(() => {t.classList.remove("show");t.addEventListener("transitionend", () => t.remove());}, 3000);}
function updateTotal(){const t=cart.reduce((t,e)=>t+e.price*e.quantity,0);document.getElementById('cart-total').textContent=formatPrice(t)}
window.renderCart=function(){const cartItemsContainer=document.getElementById('cart-items'),emptyCartMessage=document.getElementById('empty-cart-message'),checkoutButton=document.getElementById('checkout-button');cartItemsContainer.innerHTML="",0===cart.length?(emptyCartMessage.style.display="block",checkoutButton.disabled=!0):(emptyCartMessage.style.display="none",checkoutButton.disabled=!1,cart.forEach(t=>{const e=document.createElement("div");e.className="cart-item";const imageHtml = t.image ? `<img src="${t.image}" alt="${t.name}">` : '';e.innerHTML=`<div class="cart-item-info">${imageHtml}<div class="cart-item-details"><p>${t.name}</p><p>${formatPrice(t.price)}</p></div></div><div class="cart-item-quantity"><input type="number" value="${t.quantity}" min="1" onchange="updateQuantity(${t.id}, parseInt(this.value))"><p class="cart-item-quantity-total">${formatPrice(t.price*t.quantity)}</p><button class="cart-item-remove" onclick="removeFromCart(${t.id})"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>`,cartItemsContainer.appendChild(e)})),updateTotal()}

window.addToCart=function(t,e=1){const o=window.products.find(n=>n.id===t);if(o){const n=cart.find(n=>n.id===t);n?n.quantity+=e:cart.push({...o,quantity:e}),saveCart(),window.renderCart(),showNotification(o.name)}};
window.updateQuantity=function(t,e){const o=cart.find(o=>o.id===t);o&&(o.quantity=e,o.quantity<=0?window.removeFromCart(t):(saveCart(),window.renderCart()))};
window.removeFromCart=function(t){cart=cart.filter(e=>e.id!==t),saveCart(),window.renderCart()};
window.openCartModal=function(){window.renderCart(),document.getElementById('cart-modal').classList.remove("hidden")};
window.closeCartModal=function(){document.getElementById('cart-container').style.transform="scale(0.95)",setTimeout(()=>{document.getElementById('cart-modal').classList.add("hidden"),document.getElementById('cart-container').style.transform="scale(1)"},300)};
window.goToCheckout=async function(){if(!stripe||0===cart.length)return;for(const t of cart)if("string"!=typeof t.stripe_price_id||!t.stripe_price_id.startsWith("price_"))return void alert(`Critical Error: The item "${t.name}" has an invalid Stripe Price ID.`);const lineItems=cart.map(t=>({price:String(t.stripe_price_id),quantity:t.quantity}));const isPhysical = cart.some(item => item.type === 'physical');const checkoutOptions = {lineItems: lineItems,mode:"payment",successUrl:`${window.location.origin}${window.location.pathname}?success=true`,cancelUrl:window.location.href, ...(isPhysical && { shippingAddressCollection: { allowedCountries: ['US', 'CA'], } })};try{document.getElementById('checkout-button').textContent="Redirecting...",document.getElementById('checkout-button').disabled=!0;const{error:e}=await stripe.redirectToCheckout(checkoutOptions);e&&(alert(`An error occurred: ${e.message}`),document.getElementById('checkout-button').textContent="Checkout",document.getElementById('checkout-button').disabled=!1)}catch(e){alert(`A critical error occurred: ${e.message}`),document.getElementById('checkout-button').textContent="Checkout",document.getElementById('checkout-button').disabled=!1}};

// --- FIREBASE LOGIC ---
window.initializeFirebase = function() {
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp === 'undefined') { return; } // Handled by global load check

    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    const loginModal = document.getElementById('firebase-login-modal');
    const registerModal = document.getElementById('firebase-register-modal');
    const forgotPasswordModal = document.getElementById('firebase-forgot-password-modal');
    const modalOverlay = document.getElementById('firebase-modal-overlay');
    const userDropdown = document.getElementById('user-dropdown');
    const loginError = document.getElementById('login-error');
    // ... (All other Firebase elements and helper functions must be here)
    const openLoginModal = () => { /* ... */ };
    const closeAllModals = () => { /* ... */ };
    const setupProfileIconListeners = (user) => { /* ... */ };

    auth.onAuthStateChanged(user => { setupProfileIconListeners(user); /* ... rest of auth logic ... */ });
    // ... (All event listeners for login buttons, sign in/out functions, etc. must be here)
};

// --- INITIALIZER ---
function initializeStore(){
    try{
        if (typeof Stripe === 'undefined') { setTimeout(initializeStore, 200); return; }
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        const nestedData = JSON.parse(productDataJsonString);
        window.products = flattenProductList(nestedData);
        loadCart();
        window.initializeFirebase();
    }catch(t){ console.error("Critical Error: Store initialization failed.",t); }
}

window.addEventListener('load', initializeStore);
