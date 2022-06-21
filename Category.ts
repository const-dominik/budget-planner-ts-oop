import fs from "fs";

export enum Priority {
    low, medium, high
}

type Categories = {
    incomes: IncomeCategory[];
    expenses: ExpenseCategory[];
}

export abstract class Category {
    private name: string;
    private description?: string;

    constructor(name: string, description?: string) {
        this.name = name;
        this.description = description;

        this.addCategory();
    };

    addCategory(): void {
        const categories: Categories = JSON.parse(fs.readFileSync("./categories.json", "utf8"));
        if (this instanceof IncomeCategory) {
            if (categories.incomes.some(category => category.name === this.name)) return;
            categories.incomes.push(this);
        }
        if (this instanceof ExpenseCategory) {
            if (categories.expenses.some(category => category.name === this.name)) return;
            categories.expenses.push(this);
        }
        fs.writeFileSync("./categories.json", JSON.stringify(categories));
    }

    updateCategory(): void {
        const categories: Categories = JSON.parse(fs.readFileSync("./categories.json", "utf8"));
        if (this instanceof IncomeCategory) {
            const index = categories.incomes.findIndex(category => category.name === this.name);
            if (index === -1) return;
            categories.incomes[index] = this;
        }
        if (this instanceof ExpenseCategory) {
            const index = categories.expenses.findIndex(category => category.name === this.name);
            if (index === -1) return;
            categories.expenses[index] = this;
        }
        fs.writeFileSync("./categories.json", JSON.stringify(categories));
    }

    changeName(name: string) {
        this.name = name;
        this.updateCategory();
    }

    changeDescription(description: string) {
        this.description = description;
        this.updateCategory();
    }

    createCategoryElement(): HTMLElement {
        const categoryElement = document.createElement("div");
        
        categoryElement.classList.add("category");
        categoryElement.innerHTML = ``;
        return categoryElement;
    }
}

export class IncomeCategory extends Category {
    constructor(name: string, description?: string) {
        super(name, description);
        this.addCategory();
    }
}

export class ExpenseCategory extends Category {
    private budget!: number;
    private priority!: Priority;

    constructor(name: string, description?: string) {
        super(name, description);
        this.addCategory();
    }

    setBudget(budget: number) {
        this.budget = budget;
        this.updateCategory();
    }

    setPriority(priority: Priority) {
        this.priority = priority;
        this.updateCategory();
    }

    getBudget(): number {
        return this.budget;
    }

    getPriority(): Priority {
        return this.priority;
    }
};