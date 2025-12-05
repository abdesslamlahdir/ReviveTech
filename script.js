let products = JSON.parse(localStorage.getItem('techRevive_stock')) || [
    { title: "Dell Latitude 7490", specs: "i5 - 8Go - SSD 256", desc: "Parfait pour la prise de note.", price: 150, co2: 210 },
    { title: "Lenovo ThinkPad T480", specs: "i5 - 16Go - SSD 512", desc: "Robuste et batterie longue durée.", price: 180, co2: 240 },
    { title: "HP EliteBook 840", specs: "i7 - 16Go - SSD 512", desc: "Puissant et léger pour les projets.", price: 220, co2: 190 }
];

let orders = JSON.parse(localStorage.getItem('techRevive_orders')) || [];
let messages = JSON.parse(localStorage.getItem('techRevive_messages')) || [];

let isAdmin = false;
let currentProductIndex = null;

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
});

function showSection(sectionId) {
    document.getElementById('section-home').classList.add('hidden');
    document.getElementById('section-catalogue').classList.add('hidden');
    document.getElementById('section-about').classList.add('hidden');
    document.getElementById('section-contact').classList.add('hidden');
    
    document.getElementById('section-' + sectionId).classList.remove('hidden');
}

function toggleAdminView() {
    if (!isAdmin) {
        const pass = prompt("Mot de passe Admin :");
        if (pass === "1234") {
            isAdmin = true;
            const navBtn = document.getElementById('nav-admin');
            navBtn.innerText = "Déconnexion (Admin)";
            navBtn.style.color = "#e74c3c";
            
            document.getElementById('admin-panel').classList.remove('hidden');
            showSection('catalogue');
            renderProducts();
            renderOrders(); 
            renderMessages();
        } else {
            alert("Mot de passe incorrect.");
        }
    } else {
        isAdmin = false;
        const navBtn = document.getElementById('nav-admin');
        navBtn.innerText = "Accès Admin";
        navBtn.style.color = "";
        
        document.getElementById('admin-panel').classList.add('hidden');
        renderProducts();
    }
}

function renderProducts() {
    const list = document.getElementById('product-list');
    list.innerHTML = '';

    if (products.length === 0) {
        list.innerHTML = '<p class="text-center w-100" style="opacity:0.7">Aucune offre disponible pour le moment.</p>';
        return;
    }

    products.forEach((prod, index) => {
        let actionBtn = isAdmin 
            ? `<button class="btn btn-danger" style="width:100%; margin-top:10px;" onclick="deleteProduct(${index})">Supprimer l'offre</button>`
            : `<button class="btn btn-reserver" onclick="openModal(${index})">Réserver</button>`;

        const card = `
            <div class="card">
                <span class="badge-co2">♻️ -${prod.co2}kg CO2</span>
                <h3>${prod.title}</h3>
                <p style="color:#a4b0be; font-size:0.9rem; font-weight:bold;">${prod.specs}</p>
                <p>${prod.desc}</p>
                <span class="card-price">${prod.price} €</span>
                ${actionBtn}
            </div>
        `;
        list.innerHTML += card;
    });
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;

    list.innerHTML = '';

    if (orders.length === 0) {
        list.innerHTML = '<p class="text-center" style="opacity:0.6">Aucune commande en attente.</p>';
        return;
    }

    orders.forEach((order, index) => {
        list.innerHTML += `
            <div class="order-item">
                <div class="order-details">
                    <strong>${order.product}</strong> (${order.price}€)<br>
                    <span style="font-size:0.9rem; color:#ccc;">👤 ${order.client.nom} ${order.client.prenom} | 📞 ${order.client.tel}</span>
                </div>
                <button class="btn btn-danger" style="padding:5px 10px; font-size:0.8rem;" onclick="deleteOrder(${index})">Terminer</button>
            </div>
        `;
    });
}

function renderMessages() {
    const list = document.getElementById('messages-list');
    if (!list) return;

    list.innerHTML = '';

    if (messages.length === 0) {
        list.innerHTML = '<p class="text-center" style="opacity:0.6">Aucun message.</p>';
        return;
    }

    messages.forEach((msg, index) => {
        list.innerHTML += `
            <div class="msg-item">
                <div class="msg-details">
                    <strong>${msg.name}</strong> (${msg.email})<br>
                    <span style="font-size:0.9rem; color:#ccc;">${msg.message}</span>
                </div>
                <button class="btn btn-danger" style="padding:5px 10px; font-size:0.8rem;" onclick="deleteMessage(${index})">X</button>
            </div>
        `;
    });
}

function deleteOrder(index) {
    if(confirm("Confirmer que cette commande a été traitée ?")) {
        orders.splice(index, 1);
        localStorage.setItem('techRevive_orders', JSON.stringify(orders));
        renderOrders();
    }
}

function deleteMessage(index) {
    if(confirm("Supprimer ce message ?")) {
        messages.splice(index, 1);
        localStorage.setItem('techRevive_messages', JSON.stringify(messages));
        renderMessages();
    }
}

const addForm = document.getElementById('add-form');
if (addForm) {
    addForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newProd = {
            title: document.getElementById('title').value,
            specs: document.getElementById('specs').value,
            price: document.getElementById('price').value,
            co2: document.getElementById('co2').value,
            desc: document.getElementById('desc').value
        };

        products.push(newProd);
        saveProducts();
        
        this.reset();
        alert("Offre ajoutée avec succès !");
    });
}

function deleteProduct(index) {
    if (confirm("Voulez-vous vraiment supprimer cette offre du catalogue ?")) {
        products.splice(index, 1);
        saveProducts();
    }
}

function saveProducts() {
    localStorage.setItem('techRevive_stock', JSON.stringify(products));
    renderProducts();
}

function openModal(index) {
    currentProductIndex = index;
    const prod = products[index];
    const modalTitle = document.getElementById('modal-product-name');
    if (modalTitle) modalTitle.innerText = prod.title + " (" + prod.price + "€)";
    document.getElementById('reservation-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('reservation-modal').classList.add('hidden');
}

const resForm = document.getElementById('reservation-form');
if (resForm) {
    resForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const nom = document.getElementById('res-nom').value;
        const prenom = document.getElementById('res-prenom').value;
        const tel = document.getElementById('res-tel').value;
        const prod = products[currentProductIndex];

        const newOrder = {
            id: Date.now(),
            product: prod.title,
            price: prod.price,
            client: { nom, prenom, tel },
            date: new Date().toLocaleDateString()
        };

        orders.push(newOrder);
        localStorage.setItem('techRevive_orders', JSON.stringify(orders));

        closeModal();
        alert(`Merci ${prenom} ! Votre ${prod.title} est réservé. Nous vous appellerons au ${tel} pour le retrait.`);
        
        this.reset();
        if(isAdmin) renderOrders();
    });
}

const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-msg').value;

        const newMsg = {
            id: Date.now(),
            name: name,
            email: email,
            message: message,
            date: new Date().toLocaleDateString()
        };

        messages.push(newMsg);
        localStorage.setItem('techRevive_messages', JSON.stringify(messages));

        alert("Message envoyé ! Nous vous répondrons sous 24h.");
        this.reset();
        if(isAdmin) renderMessages();
    });
}

function calculerImpact() {
    const budgetInput = document.getElementById('budgetInput');
    const resultDiv = document.getElementById('result-impact');
    const budget = budgetInput.value;

    if (budget > 0) {
        const co2 = Math.floor(budget * 0.8);
        const mat = Math.floor(budget * 1.5);
        
        resultDiv.innerHTML = `
            Avec <span style="color:var(--accent); font-size:1.2rem;">${budget}€</span> chez TechRevive, vous évitez :<br><br>
            ☁️ <strong>${co2} kg</strong> d'émissions de CO2<br>
            🪨 <strong>${mat} kg</strong> d'extraction de matières premières.
        `;
    } else {
        resultDiv.innerText = "Entrez un budget valide pour voir la magie.";
    }
}