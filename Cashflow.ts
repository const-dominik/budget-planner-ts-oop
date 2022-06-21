import { Category, ExpenseCategory, IncomeCategory } from './Category';

export abstract class Cashflow {
    static count: number = 0;
    id: number;
    amount: number;
    category: Category;
    date: Date;

    constructor(amount: number, category: Category, date: Date) {
        this.id = Cashflow.count++;
        this.amount = amount;
        this.category = category;
        this.date = date;
    }
}

export class Income extends Cashflow {
    category: IncomeCategory;

    constructor(amount: number, category: IncomeCategory, date: Date) {
        super(amount, category, date);
        this.category = category;
    }
}

export class Expense extends Cashflow {
    category: ExpenseCategory;

    constructor(amount: number, category: ExpenseCategory, date: Date) {
        super(amount, category, date);
        this.category = category;
    }
}