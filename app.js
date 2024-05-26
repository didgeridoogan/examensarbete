let currentMonthIndex = new Date().getMonth();
let months = [
    'Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni',
    'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'
];
let budget = 0;
let totalAmount = 0;
let items = [];
let categories = [];
let chart = null;

window.onload = function() {
    document.getElementById('currentMonth').textContent = months[currentMonthIndex];
    loadMonthData();
    loadStoredBudget();
    initializeChart();
};

function changeMonth(direction) {
    currentMonthIndex += direction;
    if (currentMonthIndex < 0) currentMonthIndex = 11;
    if (currentMonthIndex > 11) currentMonthIndex = 0;
    document.getElementById('currentMonth').textContent = months[currentMonthIndex];
    loadMonthData();
    loadStoredBudget();
    updateChart();
}

function loadMonthData() {
    const savedItems = localStorage.getItem(`items_${currentMonthIndex}`);
    if (savedItems) {
        items = JSON.parse(savedItems);
    } else {
        items = [];
    }
    renderItems();
    updateTotal();
    updateChart();
}

function setBudget() {
    const budgetInput = document.getElementById('budget');
    budget = parseFloat(budgetInput.value);
    localStorage.setItem(`budget_${currentMonthIndex}`, budget);
    updateTotal();
}

function loadStoredBudget() {
    const savedBudget = localStorage.getItem(`budget_${currentMonthIndex}`);
    if (savedBudget) {
        budget = parseFloat(savedBudget);
        document.getElementById('budget').value = budget;
    } else {
        budget = 0;
        document.getElementById('budget').value = '';
    }
    updateTotal();
}

function addItem() {
    const itemNameInput = document.getElementById('itemName');
    const itemAmountInput = document.getElementById('itemAmount');
    const itemCategoryInput = document.getElementById('itemCategory');

    const itemName = itemNameInput.value;
    const itemAmount = parseFloat(itemAmountInput.value);
    const itemCategory = itemCategoryInput.value.trim();

    if (itemName.trim() === '' || isNaN(itemAmount) || itemAmount <= 0 || itemCategory === '') {
        alert('Please enter valid item name, amount, and category.');
        return;
    }

    if (totalAmount + itemAmount > budget) {
        alert('Warning: Adding this item will exceed your budget!');
    }

    items.push({ name: itemName, amount: itemAmount, category: itemCategory });
    localStorage.setItem(`items_${currentMonthIndex}`, JSON.stringify(items));

    renderItems();
    updateTotal();
    updateChart();

    itemNameInput.value = '';
    itemAmountInput.value = '';
    itemCategoryInput.value = '';

    if (!categories.includes(itemCategory)) {
        categories.push(itemCategory);
        updateCategoryFilter();
    }
}

function updateCategoryFilter() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '<option value="all">Alla</option>';
    categories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });
}

function filterItems() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    renderItems(categoryFilter);
}

function renderItems(categoryFilter = 'all') {
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';
    items.forEach((item, index) => {
        if (categoryFilter === 'all' || item.category === categoryFilter) {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');

            const itemNameSpan = document.createElement('span');
            itemNameSpan.classList.add('item-name');
            itemNameSpan.textContent = item.name;

            const itemAmountSpan = document.createElement('span');
            itemAmountSpan.classList.add('item-amount');
            itemAmountSpan.textContent = item.amount.toFixed(2);

            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-btn');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', function() {
                totalAmount -= item.amount;
                items.splice(index, 1);
                localStorage.setItem(`items_${currentMonthIndex}`, JSON.stringify(items));
                renderItems(categoryFilter);
                updateTotal();
                updateChart(); // Update chart after deleting item
            });

            itemDiv.appendChild(itemNameSpan);
            itemDiv.appendChild(document.createTextNode(': '));
            itemDiv.appendChild(itemAmountSpan);
            itemDiv.appendChild(deleteBtn);

            itemsList.appendChild(itemDiv);
        }
    });
}

function updateTotal() {
    const totalDiv = document.getElementById('total');
    totalAmount = items.reduce((sum, item) => sum + item.amount, 0); // Recalculate total amount
    totalDiv.textContent = `Total: ${totalAmount.toFixed(2)} / ${budget.toFixed(2)}`;
    
    if (totalAmount > budget) {
        totalDiv.style.color = 'red';
        document.querySelectorAll('.item').forEach(item => {
            item.style.color = 'red';
        });
    } else {
        totalDiv.style.color = 'black';
        document.querySelectorAll('.item').forEach(item => {
            item.style.color = 'black';
        });
    }
}
