// --- STYLES FOR FIREBASE MODALS (must run before the main JS logic) ---
const firebaseModalStyles = `
#firebase-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 9998; display: none; }
#firebase-login-modal, #firebase-register-modal, #firebase-forgot-password-modal {
position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
background: #1c1c1c; color: #ccc; border: 1px solid #444; border-radius: 0;
padding: 30px; width: 90%; max-width: 400px; z-index: 9999;
display: none; text-align: center; font-family: 'Roboto', sans-serif;
}
.firebase-modal h3 { margin-top: 0; color: white; text-transform: uppercase; letter-spacing: 0.5px; }
.firebase-modal h3.success-message { color: #00b9e5; }
.firebase-modal p.success-message { color: #00b9e5; margin-top: 1rem; }
.firebase-modal input[type="email"], .firebase-modal input[type="password"] { width: 100%; padding: 12px; margin-bottom: 12px; border: 1px solid #555; background: #333; color: white; border-radius: 4px; font-family: 'Roboto', sans-serif; font-size: 14px; }
.firebase-modal button { padding: 10px 15px; border: 1px solid #888; border-radius: 4px; cursor: pointer; margin: 5px; background: transparent; color: #ccc; font-family: 'Roboto', sans-serif; font-size: 12px; text-transform: uppercase; font-weight: 500; transition: background-color 0.3s, color 0.3s, border-color 0.3s; }
.firebase-modal button:hover { background-color: #fff; color: #000; border-color: #fff; }
.firebase-modal .google-btn { background: #4285F4; border-color: #4285F4; color: white; }
.firebase-modal .google-btn:hover { background: #5a95f5; border-color: #5a95f5; }
.firebase-modal .modal-close { position: absolute; top: 10px; right: 15px; font-size: 24px; color: #00b9e5; cursor: pointer; }
.firebase-modal .modal-back { position: absolute; top: 10px; left: 15px; font-size: 24px; color: #00b9e5; cursor: pointer; font-weight: bold; }
.firebase-modal .error-message { color: #ff6b6b; margin-top: 10px; min-height: 1.2em; font-size: 12px; }
.firebase-modal .switch-modal-link { margin-top: 20px; font-size: 14px; color: #888; }
.firebase-modal .switch-modal-link a, .firebase-modal .extra-options a { color: #00b9e5; cursor: pointer; text-decoration: none; }
.firebase-modal .switch-modal-link a:hover, .firebase-modal .extra-options a:hover { text-decoration: underline; }
.firebase-modal .extra-options { display: flex; justify-content: space-between; align-items: center; margin-top: -5px; margin-bottom: 15px; font-size: 12px; }
.firebase-modal .remember-me { display: flex; align-items: center; gap: 5px; color: #ccc; }
.firebase-modal .remember-me input { width: auto; margin-bottom: 0; }
#user-dropdown { position: absolute; background: #1c1c1c; border: 1px solid #444; border-radius: 0; z-index: 9000; display: none; min-width: 160px; box-shadow: 0 8px 16px rgba(0,0,0,0.3); }
#user-dropdown a { font-family: 'Roboto', sans-serif; font-size: 12px; font-weight: 500; text-transform: uppercase; color: #ccc; padding: 12px 16px; text-decoration: none; display: block; cursor: pointer; transition: color 0.3s, background-color 0.3s; }
#user-dropdown a:hover { background-color: #333; color: white; }
`;
document.head.insertAdjacentHTML('beforeend', `<style>${firebaseModalStyles}</style>`);


// --- STRIPE CART & FIREBASE LOGIC (The combined main script) ---
window.addEventListener('load', function () {

// --- CONFIGURATION ---
const STRIPE_PUBLISHABLE_KEY = 'pk_live_51OHfwcIaRpVk2G5N78UiDGdQLFzmUh1dv6bbA0D4N4I5bK2n7mPruCL8YpY10RuhIImCOJka8aikchX9RAi017k100KJUWJMK7';
// IMPORTANT: This MUST point to your nested JSON list.
const PRODUCTS_URL = 'https://gist.githubusercontent.com/CruxRiajuu/c93537e117a6862b97ebde987b5ca691/raw/products.json'; 
let stripe, cart = [], products = [];

// --- CACHED DOM ELEMENTS ---
const cartModal = document.getElementById('cart-modal'), cartContainer = document.getElementById('cart-container'), cartItemsContainer = document.getElementById('cart-items'), cartTotalEl = document.getElementById('cart-total'), emptyCartMessage = document.getElementById('empty-cart-message'), checkoutButton = document.getElementById('checkout-button'), notificationContainer = document.getElementById('notification-container');
const firebaseConfig = {
apiKey: "AIzaSyCqad15n5UeSl2AwnfzeIJuZLCNrVm0CrE",
authDomain: "userportalv2.firebaseapp.com",
projectId: "userportalv2",
storageBucket: "userportalv2.firebasestorage.app",
messagingSenderId: "420794125847",
appId: "1:420794125847:web:ad75a2d5f7380934061652"
};

// --- INITIALIZE FIREBASE ---
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const dashboardContainer = document.getElementById('dashboard-container');
const loginModal = document.getElementById('firebase-login-modal');
const registerModal = document.getElementById('firebase-register-modal');
const forgotPasswordModal = document.getElementById('firebase-forgot-password-modal');
const modalOverlay = document.getElementById('firebase-modal-overlay');
const userDropdown = document.getElementById('user-dropdown');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const forgotMessage = document.getElementById('forgot-message');


// ------------------------------------------------------------------
// ⭐ FIXED LOGIC: FUNCTION TO FLATTEN NESTED PRODUCTS LIST ⭐
// ------------------------------------------------------------------
function flattenProductList(nestedProducts) {
    let flatList = [];
    nestedProducts.forEach(baseProduct => {
        // Helper function to process and push a variant
        const pushVariant = (variant, baseName, nameSuffix, baseImage) => {
            variant.name = variant.name || `${baseName} // ${nameSuffix}`; 
            variant.image = baseImage || ''; 
            if (!variant.id) { return; } // Skip if no ID is set
            flatList.push(variant);
        };

        // 1. Handle deep, multi-option products (e.g., Art Commissions)
        if (baseProduct.options) {
            const baseName = baseProduct.base_name;
            const baseImage = baseProduct.base_image;
            for (const key1 in baseProduct.options) { // Style (e.g., "Chibi")
                const option1 = baseProduct.options[key1];
                for (const key2 in option1.variants) { // View (e.g., "Portrait")
                    const option2 = option1.variants[key2];
                    if (typeof option2 === 'object' && !option2.id) { // Finish (e.g., "Messy Scribble")
                        for (const key3 in option2) {
                            const variant = option2[key3];
                            const nameSuffix = `${key1} - ${key2} - ${key3}`;
                            pushVariant(variant, baseName, nameSuffix, baseImage);
                        }
                    } else if (option2.id) { // Handles cases like VTuber bundles
                        const variant = option2;
                        const nameSuffix = key2;
                        pushVariant(variant, baseName, nameSuffix, baseImage);
                    }
                }
            }
        } 
        
        // 2. Handle products with a simple variants array (e.g., Logos, T-Shirts)
        else if (baseProduct.variants) {
            const baseName = baseProduct.base_name;
            const baseImage = baseProduct.base_image;
            baseProduct.variants.forEach(variant => {
                const nameSuffix = variant.option_label || variant.name || baseProduct.base_name;
                pushVariant(variant, baseName, nameSuffix, baseImage);
            });
        }
    });
    return flatList;
}
// ------------------------------------------------------------------


// --- CART & STRIPE FUNCTIONS ---
window.addToCart=function(t,e=1){if(0===products.length)return void alert("Error: Product list could not be loaded. Please refresh the page.");const o=products.find(n=>n.id===t);if(o){if(!o.stripe_price_id)return void alert(`Error: The product "${o.name}" is not configured for checkout.`);const n=cart.find(n=>n.id===t);n?n.quantity+=e:cart.push({...o,quantity:e}),saveCart(),renderCart(),showNotification(o.name)}};
window.updateQuantity=function(t,e){const o=cart.find(o=>o.id===t);o&&(o.quantity=e,o.quantity<=0?removeFromCart(t):(saveCart(),renderCart()))};
window.removeFromCart=function(t){cart=cart.filter(e=>e.id!==t),saveCart(),renderCart()};
window.openCartModal=function(){renderCart(),cartModal.classList.remove("hidden")};
window.closeCartModal=function(){cartContainer.style.transform="scale(0.95)",setTimeout(()=>{cartModal.classList.add("hidden"),cartContainer.style.transform="scale(1)"},300)};

window.goToCheckout=async function(){
    if(!stripe||0===cart.length)return;
    for(const t of cart)if("string"!=typeof t.stripe_price_id||!t.stripe_price_id.startsWith("price_"))return void alert(`Critical Error: The item "${t.name}" has an invalid Stripe Price ID. Please check your products.json file and clear your browser cache.`);

    const lineItems = cart.map(t=>({price:String(t.stripe_price_id),quantity:t.quantity}));
    
    // Checks if any item is marked as physical
    const isPhysical = cart.some(item => item.type === 'physical');

    const checkoutOptions = {
        lineItems: lineItems,
        mode:"payment",
        successUrl:`${window.location.origin}${window.location.pathname}?success=true`,
        cancelUrl:window.location.href,
    };

    // Enables shipping collection for physical goods
    if (isPhysical) {
        checkoutOptions.shippingAddressCollection = {
            allowedCountries: ['US', 'CA'], // Update with your actual shipping countries
        };
    }

    try{
        checkoutButton.textContent="Redirecting...",checkoutButton.disabled=!0;
        const{error:e}=await stripe.redirectToCheckout(checkoutOptions);
        e&&(alert(`An error occurred: ${e.message}`),checkoutButton.textContent="Checkout",checkoutButton.disabled=!1)
    }catch(e){
        alert(`A critical error occurred: ${e.message}`),checkoutButton.textContent="Checkout",checkoutButton.disabled=!1
    }
};

function saveCart(){localStorage.setItem("carrd-cart-adv-nc",JSON.stringify(cart))}
function loadCart(){const t=localStorage.getItem("carrd-cart-adv-nc");cart=t?JSON.parse(t):[]}
function formatPrice(t){return(t/100).toLocaleString("en-US",{style:"currency",currency:"USD"})}
function showNotification(productName) {
const t = document.createElement("div");
t.className = "notification-toast";
t.innerHTML = `<div class="toast-product-name">${productName}</div><div class="toast-main-message">Added to Cart</div>`;
notificationContainer.appendChild(t);
setTimeout(() => {
t.classList.add("show");
}, 10);
setTimeout(() => {
t.classList.remove("show");
t.addEventListener("transitionend", () => t.remove());
}, 3000);
}
function updateTotal(){const t=cart.reduce((t,e)=>t+e.price*e.quantity,0);cartTotalEl.textContent=formatPrice(t)}
function renderCart(){cartItemsContainer.innerHTML="",0===cart.length?(emptyCartMessage.style.display="block",checkoutButton.disabled=!0):(emptyCartMessage.style.display="none",checkoutButton.disabled=!1,cart.forEach(t=>{const e=document.createElement("div");e.className="cart-item";
const imageHtml = t.image ? `<img src="${t.image}" alt="${t.name}">` : '';
e.innerHTML=`<div class="cart-item-info">${imageHtml}<div class="cart-item-details"><p>${t.name}</p><p>${formatPrice(t.price)}</p></div></div><div class="cart-item-quantity"><input type="number" value="${t.quantity}" min="1" onchange="updateQuantity(${t.id}, parseInt(this.value))"><p class="cart-item-quantity-total">${formatPrice(t.price*t.quantity)}</p><button class="cart-item-remove" onclick="removeFromCart(${t.id})"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div>`,cartItemsContainer.appendChild(e)})),updateTotal()}
function validateCart(){const t=cart.length;cart=cart.filter(t=>{const e=products.find(e=>e.id===t.id);return e&&e.stripe_price_id}),cart.length<t&&(console.log("Removed stale items from cart."),saveCart())}

// --- INITIALIZATION ---
async function initializeStore(){
    try{
        stripe=Stripe(STRIPE_PUBLISHABLE_KEY);
        const t=new URL(PRODUCTS_URL);
        t.searchParams.append("v",(new Date).getTime());
        const e=await fetch(t);
        if(!e.ok)throw new Error(`Network response was not ok, status: ${e.status}`);
        
        const nestedData = await e.json();
        products = flattenProductList(nestedData); // <-- THE FIX
        
        loadCart(),validateCart(),renderCart()
    }catch(t){
        console.error("Could not initialize the store:",t),alert("Error: The shopping cart could not be initialized. The product list might be unavailable or invalid. Please check the browser console for more details.")
    }
}
cartModal.addEventListener('click',t=>{t.target===cartModal&&closeCartModal()});


// --- FIREBASE FUNCTIONS ---
const showSuccessFeedback = (modal, message) => {
const header = modal.querySelector('h3');
const contentElements = Array.from(modal.children).filter(el => el.tagName !== 'H3' && !el.classList.contains('modal-close') && !el.classList.contains('modal-back'));
if (!header) return;
const originalHeaderText = header.textContent;
contentElements.forEach(el => el.style.display = 'none');
header.textContent = message;
header.classList.add('success-message');
setTimeout(() => {
closeAllModals();
setTimeout(() => {
header.textContent = originalHeaderText;
header.classList.remove('success-message');
contentElements.forEach(el => el.style.display = '');
}, 500);
}, 1500);
};

const openLoginModal = () => { if(loginError) loginError.textContent = ''; closeAllModals(); loginModal.style.display = 'block'; modalOverlay.style.display = 'block'; };
const openRegisterModal = () => { if(registerError) registerError.textContent = ''; closeAllModals(); registerModal.style.display = 'block'; modalOverlay.style.display = 'block'; };
const openForgotPasswordModal = () => { if(forgotMessage) forgotMessage.textContent = ''; closeAllModals(); forgotPasswordModal.style.display = 'block'; modalOverlay.style.display = 'block'; };
const closeAllModals = () => {
loginModal.style.display = 'none';
registerModal.style.display = 'none';
forgotPasswordModal.style.display = 'none';
modalOverlay.style.display = 'none';
};
const toggleDropdown = (event) => {
const icon = event.target.closest('.profile-icon');
if (!icon) return;
const rect = icon.getBoundingClientRect();
userDropdown.style.left = rect.left + 'px';
userDropdown.style.top = (rect.bottom + window.scrollY + 5) + 'px';
userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
};
const closeDropdown = () => { if (userDropdown) userDropdown.style.display = 'none'; };

const setupProfileIconListeners = (user) => {
const profileIcon = document.querySelector('.profile-icon');
if (!profileIcon) return;
const freshProfileIcon = profileIcon.cloneNode(true);
profileIcon.parentNode.replaceChild(freshProfileIcon, profileIcon);
const action = user ? toggleDropdown : openLoginModal;
freshProfileIcon.addEventListener('click', action);
};

auth.onAuthStateChanged(user => {
setupProfileIconListeners(user);
if (!user) {
if(dashboardContainer) dashboardContainer.style.display = 'none';
closeDropdown();
}
});

window.addEventListener('click', function(event) {
if (!event.target.closest('.profile-icon') && !event.target.closest('#user-dropdown')) {
closeDropdown();
}
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('show-register-link')?.addEventListener('click', openRegisterModal);
    document.getElementById('show-login-link')?.addEventListener('click', openLoginModal);
    document.querySelector('#firebase-register-modal .modal-back')?.addEventListener('click', openLoginModal);
    document.querySelector('#firebase-forgot-password-modal .modal-back')?.addEventListener('click', openLoginModal);
    document.getElementById('forgot-password-link')?.addEventListener('click', openForgotPasswordModal);
    document.getElementById('send-reset-btn')?.addEventListener('click', function() {
        const email = document.getElementById('forgot-email').value;
        if (email) {
        auth.sendPasswordResetEmail(email)
        .then(() => {
        forgotMessage.textContent = "Success! A reset link has been sent.";
        forgotMessage.style.color = "#00b9e5";
        })
        .catch((error) => {
        forgotMessage.textContent = error.message;
        forgotMessage.style.color = "#ff6b6b";
        });
        } else {
        forgotMessage.textContent = "Please enter an email address.";
        forgotMessage.style.color = "#ff6b6b";
        }
    });
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        auth.signOut();
        closeDropdown();
        openLoginModal();
        showSuccessFeedback(loginModal, "Signed Out");
    });
    document.getElementById('show-dashboard-btn')?.addEventListener('click', () => {
        const user = auth.currentUser;
        if(dashboardContainer && user) {
        dashboardContainer.innerHTML = '<h3>Loading your downloads...</h3>';
        dashboardContainer.style.display = 'block';
        db.collection('users').doc(user.uid).get().then(doc => {
        let dashboardHTML = `<h3>Your Downloads</h3>`;
        if (doc.exists) {
        const userData = doc.data();
        if (Array.isArray(userData.downloadLinks) && userData.downloadLinks.length > 0) {
        dashboardHTML += '<ul>';
        userData.downloadLinks.forEach(link => {
        dashboardHTML += `<li><a href="${link}" target="_blank">Download File</a></li>`;
        });
        dashboardHTML += '</ul>';
        } else if (userData.downloadLink) {
        dashboardHTML += `<p><a href="${userData.downloadLink}" target="_blank">Click here to download your art</a></p>`;
        } else {
        dashboardHTML += `<p>No downloads found.</p>`;
        }
        } else {
        dashboardHTML += `<p>Your commission is in progress.</p>`;
        }
        dashboardContainer.innerHTML = dashboardHTML;
        dashboardContainer.scrollIntoView({ behavior: 'smooth' });
        });
        }
        closeDropdown();
    });
    document.querySelectorAll('.modal-close').forEach(btn => btn.addEventListener('click', closeAllModals));
    modalOverlay.addEventListener('click', e => { if(e.target === modalOverlay) closeAllModals(); });
    document.getElementById('signin-btn')?.addEventListener('click', () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me-checkbox').checked;
        const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
        auth.setPersistence(persistence)
        .then(() => auth.signInWithEmailAndPassword(email, pass))
        .then((userCredential) => {
        setupProfileIconListeners(userCredential.user);
        showSuccessFeedback(loginModal, "Login Successful");
        })
        .catch(error => loginError.textContent = error.message);
    });
    document.getElementById('create-account-btn')?.addEventListener('click', () => {
        const email = document.getElementById('register-email').value;
        const pass = document.getElementById('register-password').value;
        auth.createUserWithEmailAndPassword(email, pass)
        .then((userCredential) => {
        setupProfileIconListeners(userCredential.user);
        showSuccessFeedback(registerModal, "Account Created");
        })
        .catch(error => registerError.textContent = error.message);
    });
    document.getElementById('google-login-btn')?.addEventListener('click', () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        const rememberMe = document.getElementById('remember-me-checkbox').checked;
        const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
        auth.setPersistence(persistence)
        .then(() => auth.signInWithPopup(provider))
        .then((userCredential) => {
        setupProfileIconListeners(userCredential.user);
        showSuccessFeedback(loginModal, "Login Successful");
        })
        .catch(error => {
        if (error.code !== 'auth/popup-closed-by-user') {
        loginError.textContent = error.message;
        }
        });
    });
});

initializeStore();
});
