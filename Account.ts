import { Cashflow, Income, Expense } from './Cashflow';
import { ExpenseCategory, Priority } from './Category';
import fs from "fs";


/*
    todo: daylimit, balance shit, maybe different classes for different timestamps
    daily, weekly, monthly, yearly budgeting 
*/

type Accounts = {
    [name: string]: {
        balance: number;
        logs: Cashflow[];
        expenses: Expense[];
        incomes: Income[];
    }
}

export class Account {
    private plannerName: string;
    private currentBalance: number;
    private logs: Cashflow[];
    private expenses: Expense[];
    private incomes: Income[];

    constructor(name: string) {
        this.plannerName = name;
        this.currentBalance = 0;
        this.logs = [];
        this.expenses = [];
        this.incomes = [];
    }

    static getProfile(name: string): Accounts {
        const acc = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
        return acc[name];
    }

    save(): void {
        const accounts: Accounts = JSON.parse(fs.readFileSync("accounts.json", "utf8"));
        const current = {
            balance: this.currentBalance,
            logs: this.logs,
            expenses: this.expenses,
            incomes: this.incomes
        }
        accounts[this.plannerName] = current;
        fs.writeFileSync("accounts.json", JSON.stringify(accounts));
    }

    checkCashflowDue(cashflow: Cashflow): boolean {
        return cashflow.date.getTime() <= new Date().getTime();
    }

    updatePlansAndBalance() {
        const ids: number[] = [];
        this.expenses.forEach(cashflow => {
            if (this.checkCashflowDue(cashflow)) {
                ids.push(cashflow.id);
                this.currentBalance -= cashflow.amount;
                this.logs.push(cashflow);
            }
        });
        this.incomes.forEach(cashflow => {
            if (this.checkCashflowDue(cashflow)) {
                ids.push(cashflow.id);
                this.currentBalance += cashflow.amount;
                this.logs.push(cashflow);
            }
        })
        this.expenses = this.expenses.filter(cashflow => !ids.includes(cashflow.id));
        this.incomes = this.incomes.filter(cashflow => !ids.includes(cashflow.id));
    }

    getBalanceAtDate(date: Date): number {
        const incomes = this.incomes.filter(inc => inc.date.getTime() <= date.getTime());
        const expenses = this.expenses.filter(exp => exp.date.getTime() <= date.getTime());
        const incomesTillDate = incomes.reduce((acc, inc) => acc + inc.amount, 0);
        const expensesTillDate = expenses.reduce((acc, exp) => acc + exp.amount, 0);
        return this.currentBalance + incomesTillDate - expensesTillDate;
    }

    addPlan(cashflow: Cashflow) {
        if (cashflow instanceof Expense) {
            const newBalance = this.getBalanceAtDate(cashflow.date);
            if (newBalance - cashflow.amount < 0) {
                console.log("yeah u're not a rich bitch not the upper class")
                const lowerPriorityExpenses = this.expenses.filter(exp => exp.category.getPriority() < cashflow.category.getPriority());
                if (lowerPriorityExpenses.length > 0) {
                    console.log("you can get rid of those as they're not as important :)", lowerPriorityExpenses);
                }
            } else {
                this.expenses.push(cashflow);
            }
        } else {
            this.incomes.push(cashflow);
        }
        this.updatePlansAndBalance();
    }
}

const user = new Account("Dominik");
//user creates account, then i have to get their incomes and expenses and ask them to set a day limit
const food = new ExpenseCategory("food", "food expenses ..");
food.setBudget(500);
food.setPriority(Priority.high);
const videoGames = new ExpenseCategory("games", "new games and generally games shit");
videoGames.setBudget(100);
videoGames.setPriority(Priority.low);
//umm create setters to this shit in categories and update categories.json  
const expense = new Expense(200, food, new Date());
const games = new Expense(50, videoGames, new Date(2023, 5));
user.addPlan(games);
user.addPlan(expense);