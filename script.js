//creare fabrica
const index1row = 4, index1collum = 5;
const index2row = 2, index2collum = 7;

const SHELFS = {
    shelfs_arr:[],
    shelfs_no: index1row * index1collum + index2row * index2collum,  //modify after your factory
    shelf_capacity: 100 /*cost (50 regular glasses)*/,
}

const orderIds = {
    ID_NO: null,
    Glassestype: {total_small: 0, total_normal: 0, total_big: 0},
    Located: [
        {shelfName: "", cost: 0, glasses:""}
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

create_shelfs(index1row, index1collum, 42, 10);
create_shelfs(index2row, index2collum, 75, -10);

let remainingFactorySpace = SHELFS.shelfs_no * SHELFS.shelf_capacity;
console.log(`${remainingFactorySpace}`);

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

        for (let i = 0; i < shelf.orderIds.length; i++) {
            const order = hash.get(shelf.orderIds[i]);
            
            //Finds how many specific glasses on that shelf
            const locationInfo = order.Located.find(loc => loc.shelfName === shelf.name);
            
            if (locationInfo && locationInfo.glasses) {
                const glassesOnThisShelf = locationInfo.glasses;
                totalGlsDet.total_small += glassesOnThisShelf.small;
                totalGlsDet.total_normal += glassesOnThisShelf.normal;
                totalGlsDet.total_big += glassesOnThisShelf.big;
                
                html += `<p>ID: ${order.ID_NO}; Small: ${glassesOnThisShelf.small}; 
                Normal: ${glassesOnThisShelf.normal}; Big: ${glassesOnThisShelf.big}</p>`;
            } else {
                for (const type in totalGlsDet)
                    totalGlsDet[type] += order.Glassestype[type];
                html += `<p>ID: ${order.ID_NO}; Small: ${order.Glassestype.total_small}; 
                Normal: ${order.Glassestype.total_normal}; Big: ${order.Glassestype.total_big}</p>`;
            }
        }
        const arr = Object.keys(totalGlsDet).map(key => `${key}: ${totalGlsDet[key]}`);
        //show every glasses type with it s number
        document.getElementById("totalGlassesDetails").innerHTML = arr
        .map(item => `<div>${item}</div>`)
        .join(" ");
        //show how many more glasses you can add
        document.getElementById('remainingSpace').textContent =
        `${capacity} small | ${Math.floor(capacity / 2)} medium | ${Math.floor(capacity / 4)} big`;
        //show all orders on the shelf
        document.getElementById("orders").innerHTML = html;
    }
    popup.style.display = 'block';
}

function closePopup() {
    document.getElementById('shelfPopup').style.display = 'none';
}

function AddOrderOnShelf() {
    if (currentShelfIndex == -1) {
        alert('You haven\'t selected any shelf');
        return;
    }

    const shelf = SHELFS.shelfs_arr[currentShelfIndex];
    if (shelf.remainingCapacity <= 0) {
        alert('This shelf is full!');
        return;
    }

	const orderId = parse_new_order();
	if (orderId == -1)
		return;

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
        alert(`The order is too big for this shelf!`);
		return;
    } else {
        orderData.Located.push({ shelfName: SHELFS.shelfs_arr[currentShelfIndex].name, cost: total_cost });
        shelf.remainingCapacity -= total_cost;
        hash.set(orderId, orderData);
        shelf.orderIds.push(orderId);
    }

    updateShelfColor(currentShelfIndex);
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

    for (const loc of order_info.Located) {
        const shelf = SHELFS.shelfs_arr.find(s => s.name == loc.shelfName);
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
    updateAllShelfColors();;

    if (currentShelfIndex !== -1) {
        showShelfPopup(currentShelfIndex);
    }

    alert(`Order ${remID} was removed successfully!`);
}

function FindOrderOnShelf() {
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

function getShelfColor(percentageFilled) {
    if (percentageFilled == 0)
        return '#5fd863ff';
    let red, green, blue = 0;
    if (percentageFilled <= 50) {
        green = 170;
        red = Math.round(255 * (percentageFilled/ 50));
    } else {
        red = 255;
        green = Math.round(255 * ((100 - percentageFilled) / 50));
    }
    return `rgb(${red}, ${green}, ${blue})`;
}

function updateShelfColor(shelfIndex) {
    const shelf = SHELFS.shelfs_arr[shelfIndex];
    const usedCapacity = shelf.capacity - shelf.remainingCapacity;
    const percentageFilled = (usedCapacity / shelf.capacity) * 100;
    
    const newColor = getShelfColor(percentageFilled);
    shelf.domElement.style.backgroundColor = newColor;
    shelf.domElement.style.borderColor = newColor;
    shelf.domElement.textContent = `~${Math.floor(shelf.remainingCapacity / 2)}`;
}

function updateAllShelfColors() {
    for (let i = 0; i < SHELFS.shelfs_arr.length; i++) {
        updateShelfColor(i);
    }
}

function AddOrder() {
	const orderId = parse_new_order();
	if (orderId == -1)
		return;

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

	if (total_cost > remainingFactorySpace) {
		// const result = matchGlassesCost(orderData.Glassestype.total_small, orderData.Glassestype.total_normal,
		// 								orderData.Glassestype.total_big, remainingFactorySpace);
		//trebuie sa verific daca geamurile pe care le am intra pe rafturi
		
		alert('The order is bigger than the remaining capacity!');
		return;
	}

	placeOrderSmart(orderData, total_cost);
}


function parse_new_order() {
	const orderIdInput = prompt('Enter the new order ID: ');
    if (!orderIdInput || orderIdInput.trim() == '') {
        return -1; // Utilizatorul a anulat sau nu a introdus nimic
    }

    const orderId = parseInt(orderIdInput.trim());
    if (isNaN(orderId) || orderId <= 0) {
        alert(`ID must be pozitive`);
        return -1;
    }

    if (hash.has(orderId)) {
        alert(`This ID already exists!`);
        return -1;
    }
	return orderId;
}

function placeOrderSmart(orderData, total_cost) {
    if (total_cost > remainingFactorySpace) {
        alert('The order is bigger than the remaining capacity!');
        return;
    }

    const needed_full_shelfs = Math.floor(total_cost / SHELFS.shelf_capacity);
    const remainder = total_cost % SHELFS.shelf_capacity;
    
    const emptyShelves = SHELFS.shelfs_arr.filter(
        shelf => shelf.remainingCapacity == SHELFS.shelf_capacity
    );

    const usedShelves = []; // {shelf, cost, glasses: {small, normal, big}}

    // Case 1: The order fits perfectly on empty shelfs
    if (remainder == 0) {
        if (emptyShelves.length < needed_full_shelfs) {
            alert('Not enough empty shelves for this order!');
            return;
        }
        
        if (!distributeGlassesOnShelves(orderData, usedShelves, needed_full_shelfs, 0, emptyShelves)) {
            alert('Cannot distribute glasses properly on shelves!');
            return;
        }
    } 
    // Case 2: The order doesn't fit perfectly
    else {
        if (emptyShelves.length < needed_full_shelfs) {
            alert('Not enough empty shelves for this order!');
            return;
        }
        
        // SUBCASE 1: Limited empty shelfs (max on 2 occupied shelfs)
        if (emptyShelves.length == needed_full_shelfs) {
            const foundShelves = findShelvesForRemainderOn2(remainder);
            
            if (!foundShelves) {
                alert('Cannot fit the remainder on existing partial shelves!');
                return;
            }

            if (!distributeGlassesOnShelves(orderData, usedShelves, needed_full_shelfs, 
                                           foundShelves.length, emptyShelves, foundShelves)) {
                alert('Cannot distribute glasses properly on shelves!');
                return;
            }
        }
        // SUBCASE 2: (if the remainder doesn't fit on max 1 occupied shelf, put on empty one)
        else {
            const suitableShelf = findBestFitShelf(remainder);
            const partialShelvesCount = suitableShelf ? 1 : 0;
            const extraEmptyShelf = suitableShelf ? 0 : 1;

            const partialShelves = suitableShelf ? 
                [{ shelf: suitableShelf, cost: remainder }] : 
                [{ shelf: emptyShelves[needed_full_shelfs], cost: remainder }];

            if (!distributeGlassesOnShelves(orderData, usedShelves, needed_full_shelfs + extraEmptyShelf, 
                                           partialShelvesCount, emptyShelves, 
                                           suitableShelf ? partialShelves : null)) {
                alert('Cannot distribute glasses properly on shelves!');
                return;
            }
        }
    }

    finalizeOrderPlacement(orderData, usedShelves, total_cost);
}

function finalizeOrderPlacement(orderData, usedShelves, total_cost) {
    hash.set(orderData.ID_NO, orderData);
    
    for (const shelfData of usedShelves) {
        const { shelf, cost, glasses } = shelfData;
        
        shelf.remainingCapacity -= cost;
        shelf.orderIds.push(orderData.ID_NO);
        orderData.Located.push({ 
            shelfName: shelf.name, 
            cost: cost,
            glasses: glasses 
        });
        
        const shelfIndex = SHELFS.shelfs_arr.indexOf(shelf);
        updateShelfColor(shelfIndex);
    }

    remainingFactorySpace -= total_cost;
    alert(`Order ${orderData.ID_NO} placed successfully on ${usedShelves.length} shelf/shelves!`);
}

function distributeGlassesOnShelves(orderData, usedShelves, emptyShelvesCount, partialShelvesCount, 
                                   emptyShelves, partialShelves = null) {
    let remainingSmall = orderData.Glassestype.total_small;
    let remainingNormal = orderData.Glassestype.total_normal;
    let remainingBig = orderData.Glassestype.total_big;
    
    // Distribute on empty shelves first
    for (let i = 0; i < emptyShelvesCount; i++) {
        const result = matchGlassesCost(remainingSmall, remainingNormal, remainingBig, SHELFS.shelf_capacity);
        
        usedShelves.push({
            shelf: emptyShelves[i],
            cost: SHELFS.shelf_capacity - result.remaining_cost,
            glasses: {
                small: result.used_small,
                normal: result.used_normal,
                big: result.used_big
            }
        });
        
        remainingSmall -= result.used_small;
        remainingNormal -= result.used_normal;
        remainingBig -= result.used_big;
    }
    
    // Distribute on partial shelves if any
    if (partialShelves && partialShelvesCount > 0) {
        for (const { shelf, cost } of partialShelves) {
            const result = matchGlassesCost(remainingSmall, remainingNormal, remainingBig, cost);
            
            usedShelves.push({
                shelf: shelf,
                cost: cost,
                glasses: {
                    small: result.used_small,
                    normal: result.used_normal,
                    big: result.used_big
                }
            });
            
            remainingSmall -= result.used_small;
            remainingNormal -= result.used_normal;
            remainingBig -= result.used_big;
        }
    }
    
    // Verify all glasses were distributed
    if (remainingSmall != 0 || remainingNormal != 0 || remainingBig != 0) {
        return false;
    }
    
    return true;
}

function matchGlassesCost(small, normal, big, cost) {
    let used_big = Math.min(Math.floor(cost / glassesTypes.big.cost), big);
    cost -= (used_big * glassesTypes.big.cost);
    
    let used_normal = Math.min(Math.floor(cost / glassesTypes.normal.cost), normal);
    cost -= (used_normal * glassesTypes.normal.cost);
    
    let used_small = Math.min(cost / glassesTypes.small.cost, small);
    cost -= used_small * glassesTypes.small.cost;
    
    return { used_small, used_normal, used_big, remaining_cost: cost };
}

function findBestFitShelf(remainder) {
    let bestShelf = null;
    let minWaste = Infinity;
    
    for (const shelf of SHELFS.shelfs_arr) {
        if (shelf.remainingCapacity >= remainder && 
            shelf.remainingCapacity < SHELFS.shelf_capacity) {
            
            const waste = shelf.remainingCapacity - remainder;
            
            if (waste < minWaste) {
                minWaste = waste;
                bestShelf = shelf;
            }
        }
    }
    
    return bestShelf;
}

function findShelvesForRemainderOn2(remainder) {
    const partialShelves = [];
    
    for (const shelf of SHELFS.shelfs_arr) {
        if (shelf.remainingCapacity > 0 && shelf.remainingCapacity < SHELFS.shelf_capacity) {
            if (shelf.remainingCapacity >= remainder) {
                return [{ shelf, cost: remainder }];
            }
            partialShelves.push(shelf);
        }
    }
    
    for (let i = 0; i < partialShelves.length; i++) {
        const s1 = partialShelves[i];
        const needed = remainder - s1.remainingCapacity;
        
        for (let j = i + 1; j < partialShelves.length; j++) {
            const s2 = partialShelves[j];
            
            if (s2.remainingCapacity >= needed) {
                return [
                    { shelf: s1, cost: s1.remainingCapacity },
                    { shelf: s2, cost: needed }
                ];
            }
        }
    }
    
    return null;
}

updateAllShelfColors();






























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
