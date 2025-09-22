const SHELFS = {
    shelfs_arr:[],
    shelfs_no: 34,  //modify after your factory
    shelf_capacity: 100 //cost (50 regular glasses)
}

const orderIds = {
    ID_NO: null,
    Glassestype: {total_small: 0, total_normal: 0, total_big: 0},
    Located: [
        {shelfName: "", cost: 0}
    ] //(indexurile shelfurilor unde se afla comanda)
}

const hash = new Map();

function create_shelfs(no_rows, shelfsPerRow, start_point, spacing) {
    const container = document.getElementById('containerDepozit');         
    for (let row = 0; row < no_rows; row++) {
        const randRow = document.createElement('div');
        randRow.className = `rafturi-container`;
        randRow.style.top = `${start_point - (row * spacing)}%`;
        
        for (let shelf = 0; shelf < shelfsPerRow; shelf++) {
            const randShelf = document.createElement('div');
            randShelf.className = `raft`;
            randShelf.title = `rand ${row + 1} raft ${shelfsPerRow - shelf}`;
            randRow.appendChild(randShelf);
            const shelfObject = {
                name: `${row + 1}.${shelfsPerRow - shelf}`,
                capacity: SHELFS.shelf_capacity,
                remainingCapacity: SHELFS.shelf_capacity,
                orderIds: [], // array with orders IDs
                domElement: randShelf, // referinta la elementul DOM
                position: { row: row + 1, shelf: shelfsPerRow - shelf }
            };
            SHELFS.shelfs_arr.push(shelfObject);
            const shelf_index = SHELFS.shelfs_arr.length - 1;

            //when clicks on shelf popup information page
            randShelf.addEventListener('click', function() {
                showShelfPopup(shelf_index);
            });
            
            randRow.appendChild(randShelf);
        }
        container.appendChild(randRow);
    }
}

//creare fabrica
create_shelfs(4, 5, 42, 10);
create_shelfs(2, 7, 75, -10);

const test1 = {
    ID_NO: 69,
    Glassestype: {total_small: 3, total_normal: 7, total_big: 10},
    Located: [1.4]
}
const test2 = {
    ID_NO: 33,
    Glassestype: {total_small: 5, total_normal: 5, total_big: 0},
    Located: 0
}

//  SHELFS.shelfs_arr[1].orderIds.push(test1.ID_NO);
//  hash.set(69, test1);
// SHELFS.shelfs_arr[0].orderIds.push(test2.ID_NO);
// SHELFS.shelfs_arr[0].orderIds.push(test2.ID_NO);
// hash.set(test1.ID_NO, test1);
// hash.set(test2.ID_NO, test2);
// console.log(hash.get(69));

//ne raportam la un geam cu cost default = 2
const glassesTypes = {
    'small': { nume: 'Small Glass', cost: 1},
    'normal': { nume: 'Regular Glass', cost: 2},
    'big': { nume: 'Big Glass', cost: 4},
};

let currentShelfIndex = -1;

function showShelfPopup(shelf_index) {
    currentShelfIndex = shelf_index;
    const shelf = SHELFS.shelfs_arr[shelf_index];
    const popup = document.getElementById('shelfPopup');

    document.getElementById('shelfPosition').textContent = `Row ${shelf.position.row}; Shelf ${shelf.position.shelf}`;

    const usedCapacity = shelf.capacity - shelf.remainingCapacity;
    document.getElementById('totalGlasses').textContent = `${usedCapacity} glasses`;
    
    const percentageUsed = (usedCapacity / shelf.capacity) * 100;
    document.getElementById('percentageUsed').textContent
    = `(${Math.round(percentageUsed)}%filled)`;

    const capacity = shelf.remainingCapacity;
    console.log(shelf.orderIds.length);
    if (shelf.orderIds.length == 0) {
        document.getElementById('remainingSpace').textContent =
            `${capacity} small | ${Math.floor(capacity / 2)} medium | ${Math.floor(capacity / 4)} big`;
        document.getElementById("orders").innerHTML =
            `<span style="color: white;">No orders in this shelf</span>`;
        document.getElementById("totalGlassesDetails").innerHTML = 
            `<div>total_small: 0</div><div>total_normal: 0</div><div>total_big: 0</div>`;
    } else {
        let html="";
        let totalGlsDet = {total_small: 0, total_normal: 0, total_big: 0};

        for (let i = 0; i < shelf.orderIds.length && shelf.orderIds.length > 0; i++) {
            const order = hash.get(shelf.orderIds[i]);
            console.log(order);
            for (const type in totalGlsDet)
                totalGlsDet[type] += order.Glassestype[type];
            html += `<p>ID: ${order.ID_NO}; Small: ${order.Glassestype.total_small}; 
            Normal: ${order.Glassestype.total_normal}; Big: ${order.Glassestype.total_big}</p>`;
        }
        const arr = Object.keys(totalGlsDet).map(key => `${key}: ${totalGlsDet[key]}`);
        //afiseaza fiecare tip cu nr lui de geamuri
        document.getElementById("totalGlassesDetails").innerHTML = arr
        .map(item => `<div>${item}</div>`)
        .join(" ");
        //afiseaza cate geamuri mai poti sa pui
        document.getElementById('remainingSpace').textContent =
        `${capacity} small | ${Math.floor(capacity / 2)} medium | ${Math.floor(capacity / 4)} big`;
        //afiseaza comenzile
        document.getElementById("orders").innerHTML = html;
    }
    popup.style.display = 'block';
}

function closePopup() {
    document.getElementById('shelfPopup').style.display = 'none';
}

function AddOrder() {
    if (currentShelfIndex == -1) {
        alert('You haven\'t selected any shelf');
        return;
    }

    const shelf = SHELFS.shelfs_arr[currentShelfIndex];
    if (shelf.remainingCapacity <= 0) {
        alert('This shelf is full!');
        return;
    }

    const orderIdInput = prompt('Enter the new order ID: ');
    if (!orderIdInput || orderIdInput.trim() == '') {
        return; // Utilizatorul a anulat sau nu a introdus nimic
    }

    const orderId = parseInt(orderIdInput.trim());
    if (isNaN(orderId) || orderId <= 0) {
        alert(`ID must be pozitive`);
        return;
    }

    if (hash.has(orderId)) {
        alert(`This ID already exists!`);
        return;
    }

    const orderData = {
        ID_NO: orderId,
        Glassestype: {
            total_small: getGlassInput('small glasses'),
            total_normal: getGlassInput('normal glasses'),
            total_big: getGlassInput('big glasses')
        },
        Located: []
    };

    const total_cost =  orderData.Glassestype.total_small * glassesTypes.small.cost +
                        orderData.Glassestype.total_normal * glassesTypes.normal.cost +
                        orderData.Glassestype.total_big * glassesTypes.big.cost;

    //orderData.Located.push(SHELFS.shelfs_arr[currentShelfIndex].name);

    if (total_cost > shelf.remainingCapacity) {
        alert(`The order is too big for this shelf!`); //continuare pentru impartirea automata
/*                                                       a comenzii pe alte rafturi*/
    } else {
        orderData.Located.push({ shelfName: SHELFS.shelfs_arr[currentShelfIndex].name, cost: total_cost });
        shelf.remainingCapacity -= total_cost;
        hash.set(orderId, orderData);
        shelf.orderIds.push(orderId);
    }

    showShelfPopup(currentShelfIndex);
    alert(`Order added succesfully!`);
}

function getGlassInput(glassType) {
    while(true) {
        const input = prompt(`Type the ${glassType} number`);

        if (!input)
            return null;

        if (input.trim() == '')
            return 0;

        const number_input = parseInt(input.trim());

        if (isNaN(number_input) || number_input < 0) {
            alert(`Type a valid number!`);
            continue;
        }
        return number_input;
    }
}

function RemoveOrder() {
    const removeID = prompt(`Type the order ID you want to remove: `);
    if (!removeID) return;

    const remID = parseInt(removeID.trim());
    if (isNaN(remID) || remID <= 0) {
        alert(`Type a valid ID!`);
        return;
    }

    const order_info = hash.get(remID);
    if (!order_info) {
        alert(`This order does not exist!`);
        return;
    }

    for (const loc of order_info.Located    ) {
        const shelf = SHELFS.shelfs_arr.find(s => s.name === loc.shelfName);
        if (!shelf) continue;

        // elimină ID-ul din shelf
        const index = shelf.orderIds.indexOf(remID);
        if (index !== -1) {
            shelf.orderIds.splice(index, 1);
        }

        // eliberează doar costul specific acelui raft
        shelf.remainingCapacity += loc.cost;
    }

    hash.delete(remID);

    if (currentShelfIndex !== -1) {
        showShelfPopup(currentShelfIndex);
    }

    alert(`Order ${remID} was removed successfully!`);
}

function FindOrder() {
    if (currentShelfIndex === -1) {
        alert("No shelf selected!");
        return;
    }

    const shelf = SHELFS.shelfs_arr[currentShelfIndex];
    const orderIDInput = prompt("Enter the order ID to find in this shelf:");
    if (!orderIDInput) return;

    const orderID = parseInt(orderIDInput.trim());
    if (isNaN(orderID) || orderID <= 0) {
        alert("Type a valid ID!");
        return;
    }

    if (shelf.orderIds.includes(orderID)) {
        showShelfPopup(currentShelfIndex);

        const ordersDiv = document.getElementById("orders");
        const orderElements = ordersDiv.querySelectorAll("p");
        orderElements.forEach(el => {
            if (el.textContent.includes(`ID: ${orderID};`)) {
                el.style.backgroundColor = "red";
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });

    } else {
        showShelfPopup(currentShelfIndex);
        alert(`Order ${orderID} is not in this shelf.`);
    }
}



































function planificaDepozitare() {
    
}

function reseteazaDepozit() {
    if (!confirm("⚠️ Ești sigur că vrei să resetezi depozitul?\n\nDacă nu l-ai salvat, vei pierde toate datele!")) return;
    document.getElementById('containerDepozit').innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #666;">
            <h2>🏪 Depozitul este gol</h2>
            <p>Apasă "Planifică Depozitarea" pentru a începe</p>
        </div>`;
    document.getElementById('infoPanel').style.display = 'none';
    depozitCurent = null;
    alert("🗑️ Depozitul a fost resetat!\n\nDatele salvate în istoric rămân intacte.");
}
const SHELFS = {
    shelfs_arr:[],
    shelfs_no: 34,  //modify after your factory
    shelf_capacity: 100 //cost (50 regular glasses)
}

const orderIds = {
    ID_NO: null,
    Glassestype: {total_small: 0, total_normal: 0, total_big: 0},
    Located: [
        {shelfName: "", cost: 0}
    ] //(indexurile shelfurilor unde se afla comanda)
}

const hash = new Map();

function create_shelfs(no_rows, shelfsPerRow, start_point, spacing) {
    const container = document.getElementById('containerDepozit');         
    for (let row = 0; row < no_rows; row++) {
        const randRow = document.createElement('div');
        randRow.className = `rafturi-container`;
        randRow.style.top = `${start_point - (row * spacing)}%`;
        
        for (let shelf = 0; shelf < shelfsPerRow; shelf++) {
            const randShelf = document.createElement('div');
            randShelf.className = `raft`;
            randShelf.title = `rand ${row + 1} raft ${shelfsPerRow - shelf}`;
            randRow.appendChild(randShelf);
            const shelfObject = {
                name: `${row + 1}.${shelfsPerRow - shelf}`,
                capacity: SHELFS.shelf_capacity,
                remainingCapacity: SHELFS.shelf_capacity,
                orderIds: [], // array with orders IDs
                domElement: randShelf, // referinta la elementul DOM
                position: { row: row + 1, shelf: shelfsPerRow - shelf }
            };
            SHELFS.shelfs_arr.push(shelfObject);
            const shelf_index = SHELFS.shelfs_arr.length - 1;

            //when clicks on shelf popup information page
            randShelf.addEventListener('click', function() {
                showShelfPopup(shelf_index);
            });
            
            randRow.appendChild(randShelf);
        }
        container.appendChild(randRow);
    }
}

//creare fabrica
create_shelfs(4, 5, 42, 10);
create_shelfs(2, 7, 75, -10);

const test1 = {
    ID_NO: 69,
    Glassestype: {total_small: 3, total_normal: 7, total_big: 10},
    Located: [1.4]
}
const test2 = {
    ID_NO: 33,
    Glassestype: {total_small: 5, total_normal: 5, total_big: 0},
    Located: 0
}

//  SHELFS.shelfs_arr[1].orderIds.push(test1.ID_NO);
//  hash.set(69, test1);
// SHELFS.shelfs_arr[0].orderIds.push(test2.ID_NO);
// SHELFS.shelfs_arr[0].orderIds.push(test2.ID_NO);
// hash.set(test1.ID_NO, test1);
// hash.set(test2.ID_NO, test2);
// console.log(hash.get(69));

//ne raportam la un geam cu cost default = 2
const glassesTypes = {
    'small': { nume: 'Small Glass', cost: 1},
    'normal': { nume: 'Regular Glass', cost: 2},
    'big': { nume: 'Big Glass', cost: 4},
};

let currentShelfIndex = -1;

function showShelfPopup(shelf_index) {
    currentShelfIndex = shelf_index;
    const shelf = SHELFS.shelfs_arr[shelf_index];
    const popup = document.getElementById('shelfPopup');

    document.getElementById('shelfPosition').textContent = `Row ${shelf.position.row}; Shelf ${shelf.position.shelf}`;

    const usedCapacity = shelf.capacity - shelf.remainingCapacity;
    document.getElementById('totalGlasses').textContent = `${usedCapacity} glasses`;
    
    const percentageUsed = (usedCapacity / shelf.capacity) * 100;
    document.getElementById('percentageUsed').textContent
    = `(${Math.round(percentageUsed)}%filled)`;

    const capacity = shelf.remainingCapacity;
    console.log(shelf.orderIds.length);
    if (shelf.orderIds.length == 0) {
        document.getElementById('remainingSpace').textContent =
            `${capacity} small | ${Math.floor(capacity / 2)} medium | ${Math.floor(capacity / 4)} big`;
        document.getElementById("orders").innerHTML =
            `<span style="color: white;">No orders in this shelf</span>`;
        document.getElementById("totalGlassesDetails").innerHTML = 
            `<div>total_small: 0</div><div>total_normal: 0</div><div>total_big: 0</div>`;
    } else {
        let html="";
        let totalGlsDet = {total_small: 0, total_normal: 0, total_big: 0};

        for (let i = 0; i < shelf.orderIds.length && shelf.orderIds.length > 0; i++) {
            const order = hash.get(shelf.orderIds[i]);
            console.log(order);
            for (const type in totalGlsDet)
                totalGlsDet[type] += order.Glassestype[type];
            html += `<p>ID: ${order.ID_NO}; Small: ${order.Glassestype.total_small}; 
            Normal: ${order.Glassestype.total_normal}; Big: ${order.Glassestype.total_big}</p>`;
        }
        const arr = Object.keys(totalGlsDet).map(key => `${key}: ${totalGlsDet[key]}`);
        //afiseaza fiecare tip cu nr lui de geamuri
        document.getElementById("totalGlassesDetails").innerHTML = arr
        .map(item => `<div>${item}</div>`)
        .join(" ");
        //afiseaza cate geamuri mai poti sa pui
        document.getElementById('remainingSpace').textContent =
        `${capacity} small | ${Math.floor(capacity / 2)} medium | ${Math.floor(capacity / 4)} big`;
        //afiseaza comenzile
        document.getElementById("orders").innerHTML = html;
    }
    popup.style.display = 'block';
}

function closePopup() {
    document.getElementById('shelfPopup').style.display = 'none';
}

function AddOrder() {
    if (currentShelfIndex == -1) {
        alert('You haven\'t selected any shelf');
        return;
    }

    const shelf = SHELFS.shelfs_arr[currentShelfIndex];
    if (shelf.remainingCapacity <= 0) {
        alert('This shelf is full!');
        return;
    }

    const orderIdInput = prompt('Enter the new order ID: ');
    if (!orderIdInput || orderIdInput.trim() == '') {
        return; // Utilizatorul a anulat sau nu a introdus nimic
    }

    const orderId = parseInt(orderIdInput.trim());
    if (isNaN(orderId) || orderId <= 0) {
        alert(`ID must be pozitive`);
        return;
    }

    if (hash.has(orderId)) {
        alert(`This ID already exists!`);
        return;
    }

    const orderData = {
        ID_NO: orderId,
        Glassestype: {
            total_small: getGlassInput('small glasses'),
            total_normal: getGlassInput('normal glasses'),
            total_big: getGlassInput('big glasses')
        },
        Located: []
    };

    const total_cost =  orderData.Glassestype.total_small * glassesTypes.small.cost +
                        orderData.Glassestype.total_normal * glassesTypes.normal.cost +
                        orderData.Glassestype.total_big * glassesTypes.big.cost;

    //orderData.Located.push(SHELFS.shelfs_arr[currentShelfIndex].name);

    if (total_cost > shelf.remainingCapacity) {
        alert(`The order is too big for this shelf!`); //continuare pentru impartirea automata
/*                                                       a comenzii pe alte rafturi*/
    } else {
        orderData.Located.push({ shelfName: SHELFS.shelfs_arr[currentShelfIndex].name, cost: total_cost });
        shelf.remainingCapacity -= total_cost;
        hash.set(orderId, orderData);
        shelf.orderIds.push(orderId);
    }

    showShelfPopup(currentShelfIndex);
    alert(`Order added succesfully!`);
}

function getGlassInput(glassType) {
    while(true) {
        const input = prompt(`Type the ${glassType} number`);

        if (!input)
            return null;

        if (input.trim() == '')
            return 0;

        const number_input = parseInt(input.trim());

        if (isNaN(number_input) || number_input < 0) {
            alert(`Type a valid number!`);
            continue;
        }
        return number_input;
    }
}

function RemoveOrder() {
    const removeID = prompt(`Type the order ID you want to remove: `);
    if (!removeID) return;

    const remID = parseInt(removeID.trim());
    if (isNaN(remID) || remID <= 0) {
        alert(`Type a valid ID!`);
        return;
    }

    const order_info = hash.get(remID);
    if (!order_info) {
        alert(`This order does not exist!`);
        return;
    }

    for (const loc of order_info.Located    ) {
        const shelf = SHELFS.shelfs_arr.find(s => s.name === loc.shelfName);
        if (!shelf) continue;

        // elimină ID-ul din shelf
        const index = shelf.orderIds.indexOf(remID);
        if (index !== -1) {
            shelf.orderIds.splice(index, 1);
        }

        // eliberează doar costul specific acelui raft
        shelf.remainingCapacity += loc.cost;
    }

    hash.delete(remID);

    if (currentShelfIndex !== -1) {
        showShelfPopup(currentShelfIndex);
    }

    alert(`Order ${remID} was removed successfully!`);
}

function FindOrder() {
    if (currentShelfIndex === -1) {
        alert("No shelf selected!");
        return;
    }

    const shelf = SHELFS.shelfs_arr[currentShelfIndex];
    const orderIDInput = prompt("Enter the order ID to find in this shelf:");
    if (!orderIDInput) return;

    const orderID = parseInt(orderIDInput.trim());
    if (isNaN(orderID) || orderID <= 0) {
        alert("Type a valid ID!");
        return;
    }

    if (shelf.orderIds.includes(orderID)) {
        showShelfPopup(currentShelfIndex);

        const ordersDiv = document.getElementById("orders");
        const orderElements = ordersDiv.querySelectorAll("p");
        orderElements.forEach(el => {
            if (el.textContent.includes(`ID: ${orderID};`)) {
                el.style.backgroundColor = "red";
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });

    } else {
        showShelfPopup(currentShelfIndex);
        alert(`Order ${orderID} is not in this shelf.`);
    }
}



































function planificaDepozitare() {
    
}

function reseteazaDepozit() {
    if (!confirm("⚠️ Ești sigur că vrei să resetezi depozitul?\n\nDacă nu l-ai salvat, vei pierde toate datele!")) return;
    document.getElementById('containerDepozit').innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #666;">
            <h2>🏪 Depozitul este gol</h2>
            <p>Apasă "Planifică Depozitarea" pentru a începe</p>
        </div>`;
    document.getElementById('infoPanel').style.display = 'none';
    depozitCurent = null;
    alert("🗑️ Depozitul a fost resetat!\n\nDatele salvate în istoric rămân intacte.");
}
