"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpenseCategory = exports.IncomeCategory = exports.Category = exports.Expense = exports.Income = exports.Cashflow = exports.Account = void 0;
const fs_1 = __importDefault(require("fs"));
var Priority;
(function (Priority) {
    Priority[Priority["low"] = 0] = "low";
    Priority[Priority["medium"] = 1] = "medium";
    Priority[Priority["high"] = 2] = "high";
})(Priority || (Priority = {}));
class Account {
    static initControlInterval() {
        setInterval(() => {
            const data = JSON.parse(fs_1.default.readFileSync("./cashflows.json", "utf8"));
            const timesUp = data.plans.filter(plan => new Date(plan.date).getTime() <= new Date().getTime());
            if (timesUp.length > 0) {
                for (const plan of timesUp) {
                    const type = plan.category.hasOwnProperty("budget") ? "expense" : "income";
                    data.logs.push(plan);
                    data.plans = data.plans.filter(p => p.id !== plan.id);
                    data.currBalance += type === "income" ? plan.amount : -plan.amount;
                }
                Account.initBalanceOnLoad();
                fs_1.default.writeFileSync("./cashflows.json", JSON.stringify(data));
            }
        }, 15 * 1000);
    }
    static initBalanceOnLoad() {
        const data = JSON.parse(fs_1.default.readFileSync("./cashflows.json", "utf8"));
        const balanceElement = document.querySelector(".overview p:nth-child(3)");
        if (balanceElement) {
            balanceElement.textContent = `Current balance: ${data.currBalance.toString()}$`;
        }
    }
    static init() {
        Cashflow.initListeners();
        Cashflow.initCategories();
        Cashflow.initLogs();
        Category.initListeners();
        Category.initCategories();
        Account.initBalanceOnLoad();
        Account.initControlInterval();
    }
}
exports.Account = Account;
//Cashflow ====================================================================================
class Cashflow {
    constructor(name, amount, category, date) {
        if (name && amount !== undefined && category && date) {
            this.id = Cashflow.count++;
            this.name = name;
            this.amount = amount;
            this.category = category;
            this.date = date;
        }
    }
    static generateCashflowLog(cf) {
        const [main, title, category, cash, date] = ["div", "div", "div", "div", "div"].map(el => document.createElement(el));
        const type = cf.category.hasOwnProperty("budget") ? "Expense" : "Income";
        const cfInstance = type === "Expense" ? Object.assign(new Expense(), cf) : Object.assign(new Income(), cf);
        main.classList.add("log");
        main.classList.add(cfInstance instanceof Income ? "g" : "r");
        title.classList.add("w-40");
        category.classList.add("w-30");
        cash.classList.add("w-20");
        date.classList.add("w-20");
        title.textContent = cfInstance.getName();
        category.textContent = `(${cfInstance.category.name})`;
        cash.textContent = String(cfInstance.amount) + "$";
        date.textContent = new Date(cfInstance.date).toLocaleDateString();
        [title, category, cash, date].forEach(el => main.appendChild(el));
        return main;
    }
    getName() {
        return this.name;
    }
    getAmount() {
        return this.amount;
    }
    getDate() {
        return this.date;
    }
    checkCashflowDue() {
        return new Date(this.date).getTime() <= new Date().getTime();
    }
    updateBalanceElement(newValue) {
        const balanceElement = document.querySelector(".overview p:nth-child(3)");
        if (balanceElement) {
            balanceElement.textContent = `Current balance: ${newValue.toString()}$`;
        }
    }
    static initListeners() {
        const submit = document.querySelector(".submit");
        const type = document.querySelector("select[name='type']");
        if (submit) {
            submit.addEventListener("click", Cashflow.handleSubmit);
        }
        if (type) {
            type.addEventListener("change", Cashflow.initCategories);
        }
    }
    static handleSubmit() {
        const type = document.querySelector("select[name='type']");
        const name = document.querySelector("input[name='cashflow']");
        const value = document.querySelector("input[name='value']");
        const dateElement = document.querySelector("input[name='date']");
        const category = document.querySelector("select[name='category']");
        if (type && name && value && dateElement && category) {
            if (type.value === "Expense") {
                new Expense(name.value, parseFloat(value.value), ExpenseCategory.getCategoryByName(category.value), dateElement.value);
            }
            else {
                new Income(name.value, parseFloat(value.value), IncomeCategory.getCategoryByName(category.value), dateElement.value);
            }
        }
        ;
        [name, value, dateElement].forEach(el => {
            if (el)
                el.value = "";
        });
    }
    static initCategories() {
        const type = document.querySelector("select[name='type']");
        if (type) {
            const selectedType = type.value;
            const categories = Category.getCategories(selectedType === "Expense" ? "exp" : "inc");
            const category = document.querySelector("select[name='category']");
            if (category) {
                while (category.lastChild) {
                    category.removeChild(category.lastChild);
                }
                categories.forEach(cat => {
                    const option = document.createElement("option");
                    option.value = cat;
                    option.textContent = cat;
                    category.appendChild(option);
                });
            }
        }
    }
    static initLogs() {
        const cashflows = JSON.parse(fs_1.default.readFileSync("./cashflows.json", "utf8"));
        const logsContainer = document.querySelector(".logs");
        const incLogsContainer = document.querySelector(".logs-inc");
        if (logsContainer) {
            cashflows.logs.sort((a, b) => (new Date(a.date).getTime() - (new Date(b.date).getTime()))).forEach(log => {
                const logElement = Cashflow.generateCashflowLog(log);
                if (logsContainer) {
                    logsContainer.appendChild(logElement);
                }
            });
        }
        if (incLogsContainer) {
            cashflows.plans.sort((a, b) => (new Date(a.date).getTime() - (new Date(b.date).getTime()))).forEach(plan => {
                const logElement = Cashflow.generateCashflowLog(plan);
                if (incLogsContainer) {
                    incLogsContainer.appendChild(logElement);
                }
            });
        }
    }
}
exports.Cashflow = Cashflow;
Cashflow.count = 0;
class Income extends Cashflow {
    constructor(name, amount, category, date) {
        if (name && amount !== undefined && category && date) {
            super(name, amount, category, date);
            this.category = category;
            this.addCashflow();
        }
        else {
            super();
        }
    }
    addCashflow() {
        const cashflows = JSON.parse(fs_1.default.readFileSync("./cashflows.json", "utf8"));
        if (new Date(this.date).getTime() <= new Date().getTime()) {
            cashflows.logs.push(this);
            cashflows.currBalance += this.amount;
            this.updateBalanceElement(cashflows.currBalance);
        }
        else {
            cashflows.plans.push(this);
        }
        fs_1.default.writeFileSync("./cashflows.json", JSON.stringify(cashflows));
    }
}
exports.Income = Income;
class Expense extends Cashflow {
    constructor(name, amount, category, date) {
        if (name && amount !== undefined && category && date) {
            super(name, amount, category, date);
            this.category = category;
            this.addCashflow();
        }
        else {
            super();
        }
    }
    addCashflow() {
        const cashflows = JSON.parse(fs_1.default.readFileSync("./cashflows.json", "utf8"));
        const plansTillDay = cashflows.plans.filter(cf => new Date(cf.date).getTime() >= new Date(this.date).getTime());
        const incomesTillDate = plansTillDay.filter(plan => plan.category.hasOwnProperty("budget")).reduce((acc, inc) => acc + inc.amount, 0);
        const expensesTillDate = plansTillDay.filter(plan => !plan.category.hasOwnProperty("budget")).reduce((acc, exp) => acc + exp.amount, 0);
        const newBalance = cashflows.currBalance + incomesTillDate - expensesTillDate - this.amount;
        if (newBalance < 0) {
            const expenses = cashflows.plans.filter((plan) => plan.category.hasOwnProperty("budget"));
            const lowerPriorityExpenses = expenses.filter((exp) => exp.category.priority < this.category.priority);
            const err = document.querySelector(".error");
            if (err) {
                err.style.display = "block";
                setTimeout(() => {
                    err.style.display = "none";
                }, 5000);
            }
            return;
        }
        if (new Date(this.date).getTime() <= new Date().getTime()) {
            cashflows.logs.push(this);
            cashflows.currBalance -= this.amount;
            this.updateBalanceElement(cashflows.currBalance);
        }
        else {
            cashflows.plans.push(this);
        }
        fs_1.default.writeFileSync("./cashflows.json", JSON.stringify(cashflows));
    }
}
exports.Expense = Expense;
//Category ==============================================================================
class Category {
    constructor(name, description) {
        if (name) {
            this.name = name;
            this.description = description;
            this.addCategory();
        }
    }
    ;
    getName() {
        return this.name;
    }
    getId() {
        return this.id;
    }
    addCategory() {
        const categories = JSON.parse(fs_1.default.readFileSync("./categories.json", "utf8"));
        this.id = categories.lastId;
        if (this instanceof IncomeCategory) {
            if (categories.incomes.some(category => category.id === this.id))
                return;
            categories.incomes.push(this);
        }
        if (this instanceof ExpenseCategory) {
            if (categories.expenses.some(category => category.id === this.id))
                return;
            categories.expenses.push(this);
        }
        categories.lastId++;
        fs_1.default.writeFileSync("./categories.json", JSON.stringify(categories));
    }
    updateCategoriesFile() {
        const categories = JSON.parse(fs_1.default.readFileSync("./categories.json", "utf8"));
        if (this instanceof IncomeCategory) {
            const index = categories.incomes.findIndex(category => category.id === this.id);
            if (index === -1)
                return;
            categories.incomes[index] = this;
        }
        if (this instanceof ExpenseCategory) {
            const index = categories.expenses.findIndex(category => category.id === this.id);
            if (index === -1)
                return;
            categories.expenses[index] = this;
        }
        fs_1.default.writeFileSync("./categories.json", JSON.stringify(categories));
    }
    static removeCategory(id) {
        const categories = JSON.parse(fs_1.default.readFileSync("./categories.json", "utf8"));
        categories.incomes = categories.incomes.filter(category => category.id !== id);
        categories.expenses = categories.expenses.filter(category => category.id !== id);
        fs_1.default.writeFileSync("./categories.json", JSON.stringify(categories));
    }
    generateCategoryElement() {
        const [category, header, description, gap, rm] = ["div", "h2", "p", "div", "p"].map(type => document.createElement(type));
        category.classList.add("category-prev");
        header.classList.add("header");
        description.classList.add("description");
        gap.classList.add("gap");
        rm.classList.add("rm");
        header.textContent = this.name;
        description.textContent = this.description || "";
        rm.textContent = "remove";
        if (this instanceof ExpenseCategory) {
            const [container, budget, b_title, b_value, priority, p_title, p_value] = ["div", "div", "h3", "p", "div", "h3", "p"].map(type => document.createElement(type));
            container.classList.add("container");
            budget.setAttribute("id", "budget");
            priority.setAttribute("id", "priority");
            b_title.textContent = "Budget";
            b_value.textContent = String(this.getBudget());
            p_title.textContent = "Priority";
            p_value.textContent = String(Priority[this.getPriority()]);
            [p_title, p_value].forEach(el => priority.appendChild(el));
            [b_title, b_value].forEach(el => budget.appendChild(el));
            [budget, priority].forEach(el => container.appendChild(el));
            [header, description, gap, container, rm].forEach(el => category.appendChild(el));
        }
        else {
            [header, description, gap, rm].forEach(el => category.appendChild(el));
        }
        rm.addEventListener("click", () => {
            Category.removeCategory(this.id);
            category.remove();
        });
        return category;
    }
    static handleSubmit() {
        const type = document.querySelector("select[name='type']");
        const name = document.querySelector("input[name='category']");
        const description = document.querySelector("input[name='description']");
        const budget = document.querySelector("input[name='budget']");
        const priority = document.querySelector("select[name='priority']");
        const categories = document.querySelector(".categories");
        if (type && type.options[type.selectedIndex].value === "expense") {
            if (name && budget && priority) {
                const c = new ExpenseCategory(Number(budget.value) || 0, Priority[priority.options[priority.selectedIndex].text], name.value || "None", (description === null || description === void 0 ? void 0 : description.value) || "");
                categories === null || categories === void 0 ? void 0 : categories.appendChild(c.generateCategoryElement());
            }
        }
        else {
            if (name) {
                const c = new IncomeCategory(name.value || "None", (description === null || description === void 0 ? void 0 : description.value) || "");
                categories === null || categories === void 0 ? void 0 : categories.appendChild(c.generateCategoryElement());
            }
        }
        [name, budget, description].forEach(el => {
            if (el)
                el.value = "";
        });
    }
    static initListeners() {
        const submit = document.querySelector(".submit");
        const type = document.querySelector("select[name='type']");
        if (submit) {
            submit.addEventListener("click", ExpenseCategory.handleSubmit);
        }
        if (type) {
            type.addEventListener("change", () => {
                const selectedValue = type.options[type.selectedIndex].value;
                const expProperties = document.querySelector(".expense-properties");
                if (expProperties) {
                    expProperties.style.display = selectedValue === "expense" ? "block" : "none";
                }
            });
        }
    }
    static initCategories() {
        const categories = JSON.parse(fs_1.default.readFileSync("./categories.json", "utf8"));
        const categoriesContainer = document.querySelector(".categories");
        categories.incomes = categories.incomes.map(c => Object.assign(new IncomeCategory(), c));
        categories.expenses = categories.expenses.map(c => Object.assign(new ExpenseCategory(), c));
        [...categories.incomes, ...categories.expenses].forEach(category => {
            const categoryElement = category.generateCategoryElement();
            if (categoriesContainer) {
                categoriesContainer.appendChild(categoryElement);
            }
        });
    }
    static getCategories(type) {
        const categories = JSON.parse(fs_1.default.readFileSync("./categories.json", "utf8"));
        categories.incomes = categories.incomes.map(c => Object.assign(new IncomeCategory(), c));
        categories.expenses = categories.expenses.map(c => Object.assign(new ExpenseCategory(), c));
        if (type === "inc") {
            return categories.incomes.map(c => c.name);
        }
        else {
            return categories.expenses.map(c => c.name);
        }
    }
}
exports.Category = Category;
class IncomeCategory extends Category {
    constructor(name, description) {
        if (name) {
            super(name, description);
        }
        else {
            super();
        }
    }
    static getCategoryByName(name) {
        const categories = JSON.parse(fs_1.default.readFileSync("./categories.json", "utf8"));
        categories.incomes = categories.incomes.map(c => Object.assign(new IncomeCategory(), c));
        const cat = categories.incomes.find(category => category.getName() === name);
        if (cat) {
            return cat;
        }
        throw new Error("category not found");
    }
}
exports.IncomeCategory = IncomeCategory;
class ExpenseCategory extends Category {
    constructor(budget, priority, name, description) {
        if (budget !== undefined && priority !== undefined && name !== undefined) {
            super(name, description);
            this.budget = budget;
            this.priority = priority;
            this.updateCategoriesFile();
        }
        else {
            super();
        }
    }
    getBudget() {
        return this.budget;
    }
    getPriority() {
        return this.priority;
    }
    static getCategoryByName(name) {
        const categories = JSON.parse(fs_1.default.readFileSync("./categories.json", "utf8"));
        categories.expenses = categories.expenses.map(c => Object.assign(new ExpenseCategory(), c));
        const cat = categories.expenses.find(category => category.getName() === name);
        if (cat) {
            return cat;
        }
        throw new Error("category not found");
    }
}
exports.ExpenseCategory = ExpenseCategory;
;
Account.init();
