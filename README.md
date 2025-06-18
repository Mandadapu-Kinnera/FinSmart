
# FinSmart - Personal Finance Tracker

**FinSmart** is a full-stack finance tracking application that helps users monitor their income, expenses, savings, and budgets effectively. Built with a modern tech stack including React, Node.js, Express, and Tailwind CSS, it provides a clean UI and powerful backend features for managing personal finances.


## Features

### User Features

- Registration and secure login
- Add, edit, and delete income/expense transactions
- Category-based transaction tracking
- Budget and savings goal tracking
- View historical financial data
- Visual analytics and reports using charts
- Reminder notifications for due bills or budgets
- Responsive and mobile-friendly design

### Admin/Advanced Features (optional)

- Multi-user management
- Role-based access control
- Export data as CSV or PDF
- Data backup and restore

## Tech Stack

### Frontend (`/client`)
- React
- Vite
- Tailwind CSS
- Axios
- React Router

### Backend (`/server`)
- Node.js
- Express.js
- MongoDB / PostgreSQL (depending on configuration)
- Drizzle ORM (based on config files)
- JWT for authentication

### Dev Tools
- TypeScript
- ESLint + Prettier
- Vite for frontend bundling
- PostCSS and Tailwind for styling
- Replit and VSCode support


## Folder Structure


FinSmart/
├── client/               # React frontend

├── server/               # Express backend

├── shared/               # Shared constants/types

├── attached\_assets/      # Static assets

├── node\_modules/         # Installed dependencies

├── drizzle.config.ts     # Drizzle ORM config

├── tailwind.config.ts    # Tailwind config

├── vite.config.ts        # Vite config

├── tsconfig.json         # TypeScript config

├── package.json          # Project metadata and scripts

└── .gitignore            # Git ignored files


## Getting Started

### 1. Clone the Repository


git clone https://github.com/Mandadapu-Kinnera/FinSmart.git

cd FinSmart


### 2. Install Dependencies

Install root-level tools (if any):


npm install


Install client and server packages:


cd client && npm install
cd ../server && npm install


### 3. Configure Environment Variables

Create a `.env` file in the `/server` directory with:

PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret


Optional: Create `.env` in `/client` for frontend configuration.

### 4. Run the Application

Start backend:

cd server
npm run dev


Start frontend:

cd client
npm run dev

## Scripts

Run these from project root or inside respective folders.

* `npm run dev` – Starts development server
* `npm run build` – Builds production frontend
* `npm run lint` – Lints code (if ESLint configured)



## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature-name`)
3. Commit your changes
4. Push to the branch
5. Open a pull request


## Author

**Mandadapu Kinnera**
