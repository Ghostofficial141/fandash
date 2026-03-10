const now = new Date();
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

export const mockUser = {
    id: "u1",
    name: "John Doe",
    email: "john@jmsolutionss.com",
    avatar: null,
    currency: "USD",
    monthlySpendingLimit: 4000,
    createdAt: now.toISOString()
};

export const mockTransactions = [
    {
        id: "t1",
        type: "income",
        amount: 5500,
        category: "Salary",
        recipientName: "Tech Corp",
        status: "completed",
        date: new Date(now.getFullYear(), now.getMonth(), 2).toISOString(),
        notes: "Monthly Salary",
        createdAt: now.toISOString()
    },
    {
        id: "t2",
        type: "expense",
        amount: 120,
        category: "Food & Grocery",
        recipientName: "Trader Joe's",
        status: "completed",
        date: new Date(now.getFullYear(), now.getMonth(), 5).toISOString(),
        notes: "Groceries",
        createdAt: now.toISOString()
    },
    {
        id: "t3",
        type: "expense",
        amount: 50,
        category: "Entertainment",
        recipientName: "Netflix",
        status: "completed",
        date: new Date(now.getFullYear(), now.getMonth(), 6).toISOString(),
        notes: "Monthly subscription",
        createdAt: now.toISOString()
    },
    {
        id: "t4",
        type: "income",
        amount: 300,
        category: "Freelance",
        recipientName: "Client A",
        status: "completed",
        date: new Date(now.getFullYear(), now.getMonth(), 10).toISOString(),
        notes: "Web design project",
        createdAt: now.toISOString()
    },
    {
        id: "t5",
        type: "expense",
        amount: 850,
        category: "Travel",
        recipientName: "Delta Airlines",
        status: "completed",
        date: new Date(now.getFullYear(), now.getMonth(), 12).toISOString(),
        notes: "Flight tickets",
        createdAt: now.toISOString()
    }
];

export const mockCards = [
    {
        id: "c1",
        cardNumber: "**** **** **** 4242",
        cardholderName: "JOHN DOE",
        expiryDate: "12/28",
        cardType: "visa",
        nickname: "Primary Spend",
        createdAt: now.toISOString()
    },
    {
        id: "c2",
        cardNumber: "**** **** **** 5555",
        cardholderName: "JOHN DOE",
        expiryDate: "05/27",
        cardType: "mastercard",
        nickname: "Travel Rewards",
        createdAt: now.toISOString()
    }
];

export const mockGoals = [
    {
        id: "g1",
        name: "Emergency Fund",
        targetAmount: 10000,
        currentAmount: 4500,
        targetDate: new Date(now.getFullYear() + 1, 11, 31).toISOString(),
        createdAt: now.toISOString()
    },
    {
        id: "g2",
        name: "Vacation",
        targetAmount: 3000,
        currentAmount: 850,
        targetDate: new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString(),
        createdAt: now.toISOString()
    }
];

export const mockBudget = [
    {
        id: "b1",
        category: "Investment",
        allocatedAmount: 1500,
        spentAmount: 0,
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    },
    {
        id: "b2",
        category: "Travelling",
        allocatedAmount: 1000,
        spentAmount: 850,
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    },
    {
        id: "b3",
        category: "Food & Grocery",
        allocatedAmount: 600,
        spentAmount: 120,
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    },
    {
        id: "b4",
        category: "Entertainment",
        allocatedAmount: 300,
        spentAmount: 50,
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    },
    {
        id: "b5",
        category: "Healthcare",
        allocatedAmount: 200,
        spentAmount: 0,
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    }
];
