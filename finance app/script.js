let transactions = JSON.parse(localStorage.getItem('transactions')) || {};
let isDarkTheme = localStorage.getItem('isDarkTheme') === 'true';
let editingTransaction = null;

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

function updateSummary() {
    const currentDate = getCurrentDate();
    const todayTransactions = transactions[currentDate] || [];
    
    const totalIncome = todayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = todayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    document.getElementById('totalIncome').textContent = totalIncome.toFixed(2) + ' ₽';
    document.getElementById('totalExpense').textContent = totalExpense.toFixed(2) + ' ₽';
    document.getElementById('totalBalance').textContent = balance.toFixed(2) + ' ₽';

    const balanceElement = document.getElementById('totalBalance');
    balanceElement.className = 'summary-value ' + (balance > 0 ? 'income' : balance < 0 ? 'expense' : '');
}

function renderTransactions() {
    const currentDate = getCurrentDate();
    const todayTransactions = transactions[currentDate] || [];
    const transactionList = document.getElementById('transactionList');
    transactionList.innerHTML = '';

    todayTransactions.forEach((transaction, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${transaction.category}</span>
            <span class="${transaction.type}">${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)} ₽</span>
            <button class="edit-btn" data-index="${index}">✏️</button>
            <button class="delete-btn" data-index="${index}">🗑️</button>
        `;
        transactionList.appendChild(li);
    });

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', editTransaction);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', deleteTransaction);
    });
}

function addTransaction(event) {
    event.preventDefault();

    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;

    if (isNaN(amount) || category.trim() === '') {
        alert('Пожалуйста, введите корректные данные');
        return;
    }

    const currentDate = getCurrentDate();
    if (!transactions[currentDate]) {
        transactions[currentDate] = [];
    }

    if (editingTransaction) {
        const index = transactions[currentDate].indexOf(editingTransaction);
        transactions[currentDate][index] = { amount, category, type };
        editingTransaction = null;
    } else {
        transactions[currentDate].push({ amount, category, type });
    }

    localStorage.setItem('transactions', JSON.stringify(transactions));

    document.getElementById('amount').value = '';
    document.getElementById('category').value = '';
    document.getElementById('type').value = 'expense';
    document.getElementById('submitButton').textContent = 'Добавить';

    updateSummary();
    renderTransactions();
}

function editTransaction(event) {
    const currentDate = getCurrentDate();
    const index = event.target.dataset.index;
    editingTransaction = transactions[currentDate][index];

    document.getElementById('amount').value = editingTransaction.amount;
    document.getElementById('category').value = editingTransaction.category;
    document.getElementById('type').value = editingTransaction.type;

    document.getElementById('submitButton').textContent = 'Обновить';
}

function deleteTransaction(event) {
    const currentDate = getCurrentDate();
    const index = event.target.dataset.index;
    if (confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
        transactions[currentDate].splice(index, 1);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateSummary();
        renderTransactions();
    }
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    localStorage.setItem('isDarkTheme', isDarkTheme);
    updateThemeToggleButton();
}

function updateThemeToggleButton() {
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.textContent = isDarkTheme ? '☀️' : '🌙';
}

function analyzeTransactions() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    if (!startDate || !endDate) {
        alert('Пожалуйста, выберите начальную и конечную дату');
        return;
    }

    let totalIncome = 0;
    let totalExpense = 0;
    let categories = {};

    for (let date in transactions) {
        if (date >= startDate && date <= endDate) {
            transactions[date].forEach(transaction => {
                if (transaction.type === 'income') {
                    totalIncome += transaction.amount;
                } else {
                    totalExpense += transaction.amount;
                }

                if (!categories[transaction.category]) {
                    categories[transaction.category] = { income: 0, expense: 0 };
                }
                categories[transaction.category][transaction.type] += transaction.amount;
            });
        }
    }

    const balance = totalIncome - totalExpense;

    let result = `
        <h3>Анализ за период ${startDate} - ${endDate}</h3>
        <p>Общий доход: ${totalIncome.toFixed(2)} ₽</p>
        <p>Общий расход: ${totalExpense.toFixed(2)} ₽</p>
        <p>Баланс: ${balance.toFixed(2)} ₽</p>
        <h4>По категориям:</h4>
    `;

    for (let category in categories) {
        result += `
            <p>${category}:</p>
            <ul>
                <li>Доход: ${categories[category].income.toFixed(2)} ₽</li>
                <li>Расход: ${categories[category].expense.toFixed(2)} ₽</li>
            </ul>
        `;
    }

    document.getElementById('analyticsResult').innerHTML = result;
}

document.getElementById('transactionForm').addEventListener('submit', addTransaction);
document.getElementById('themeToggle').addEventListener('click', toggleTheme);
document.getElementById('analyzeButton').addEventListener('click', analyzeTransactions);

// Инициализация
document.body.classList.toggle('dark-theme', isDarkTheme);
updateThemeToggleButton();
updateSummary();
renderTransactions();

// Установка текущей даты для полей выбора даты
const today = new Date().toISOString().split('T')[0];
document.getElementById('startDate').value = today;
document.getElementById('endDate').value = today;