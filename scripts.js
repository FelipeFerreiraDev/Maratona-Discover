/* Préload ============*/
var overlay = document.getElementById("overlay");

setTimeout(esconde, 3000)
function esconde () {
    overlay.style.visibility = 'hidden';

    /*    window.addEventListener('load', function () {
        overlay.style.visibility = 'hidden';
    });
*/
}


/* DarkMode ====================*/
/*DarkMode ===============
const $html = document.querySelector('html')
const $checkbox = document.querySelector('#switch')

$checkbox.addEventListener('change', function() {
    $html.classList.toogle('.dark-mode')
})*/



const html = document.querySelector("html")
const checkbox = document.querySelector("input[name=theme]")

const getStyle = (element, style) =>
    window
        .getComputedStyle(element)
        .getPropertyValue(style)


const initialColors = {
    bg: getStyle(html, "--bg"),
    header: getStyle(html, "--header"),
    text: getStyle(html, "--text"),
    textTable: getStyle(html, "--text-table"),
    total: getStyle(html, "--total"),
    transactionColor: getStyle(html, "--transaction-color"),
    button: getStyle(html, "--button"),
    textButton: getStyle(html, "--text-button"),
    buttonCancel: getStyle(html, "--button-cancel"),
    dataTable: getStyle(html, "--data-table"),
    tableColor: getStyle(html, "--table-color"),
    card: getStyle(html, "--card"),
    modal: getStyle(html, "--modal"),
    small: getStyle(html, "--small"),
    buttonBg: getStyle(html, "--button-bg"),
}

const darkMode = {
    bg: "#1C1C1C",
    header: "#000",
    textTable: "#FFF",
    text: "rgb(245, 245, 245)",
    textButton: "rgb(245, 245, 245)",
    total: "#363F5F",
    button: "#3DD705",
    buttonCancel: "#E92929",
    dataTable: "white",
    tableColor: "#363f5f",
    card: "rgb(37, 35, 35)",
    modal: "#000",
    small: "rgb(245,245,245)",
    buttonBg: "#49AA26"
}

const transformKey = key =>
    "--" + key.replace(/([A-Z])/, "-$1").toLowerCase()


const changeColors = (colors) => {
    Object.keys(colors).map(key =>
        html.style.setProperty(transformKey(key), colors[key])
    )
}


checkbox.addEventListener("change", ({ target }) => {
    target.checked ? changeColors(darkMode) : changeColors(initialColors)
})


const isExistLocalStorage = (key) =>
    localStorage.getItem(key) != null

const createOrEditLocalStorage = (key, value) =>
    localStorage.setItem(key, JSON.stringify(value))

const getValeuLocalStorage = (key) =>
    JSON.parse(localStorage.getItem(key))

checkbox.addEventListener("change", ({ target }) => {
    if (target.checked) {
        changeColors(darkMode)
        createOrEditLocalStorage('modo', 'darkMode')
    } else {
        changeColors(initialColors)
        createOrEditLocalStorage('modo', 'initialColors')
    }
})

if (!isExistLocalStorage('modo'))
    createOrEditLocalStorage('modo', 'initialColors')


if (getValeuLocalStorage('modo') === "initialColors") {
    checkbox.removeAttribute('checked')
    changeColors(initialColors);
} else {
    checkbox.setAttribute('checked', "")
    changeColors(darkMode);
}

/* APP ==========================*/



const Modal = {
    open() {
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')

    },
    close() {
        // fechar o modal
        // remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}


const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses() {
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)


        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value) {
        value = Number(value.replace(/\,\./g, "")) * 100

        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()

        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()

        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            swal('🚀Ops ainda não ',error.message,'error')
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

setTimeout(App.init, 3000)