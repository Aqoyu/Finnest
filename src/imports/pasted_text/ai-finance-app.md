Create a modern AI-powered financial planning web application with a premium fintech-style UI similar to Revolut, Monzo, Rocket Money, and Copilot Money.

MAIN FEATURE:
Users can upload bank statements (PDF, CSV, XLSX, images, screenshots), and AI automatically analyzes transactions, categorizes spending, detects subscriptions, calculates financial statistics, and builds a personal financial profile.

==================================================
CORE FUNCTIONALITY

Implement an “AI Statement Analyzer” system with:

1. File Upload

* Drag & drop upload area
* Support:
    * PDF
    * CSV
    * XLSX
    * JPG
    * PNG
* Multi-file upload
* Mobile support
* Real-time upload progress
* Animated loading state while AI processes statement

2. OCR + Parsing
    Use OCR and AI/NLP to extract:

* transaction date
* amount
* merchant/store name
* transfer destination
* payment type
* balance
* currency
* transaction description

AI should work even with:

* scanned PDFs
* screenshots
* partially damaged text
* mixed languages
* different bank formats

3. AI Categorization
    Automatically classify transactions into:

* Groceries
* Food
* Transport
* Taxi
* Fuel
* Shopping
* Entertainment
* Gaming
* Subscriptions
* Investments
* Salary
* Freelance
* Transfers
* Credit Payments
* Utilities
* Healthcare
* Education
* Taxes
* Savings
* Other

Examples:

* “FIGMA” → Software Subscription
* “Qazaq Oil” → Fuel
* “Magnum” → Groceries
* “Kaspi Red” → Credit Payment
* “inDrive” → Transport
* “Tele2” → Mobile Services
* “Helios” → Fuel

AI must understand merchant variations and typos.

4. Dashboard Analytics
    Generate:

* monthly income
* monthly expenses
* net savings
* savings rate
* average daily spending
* top spending categories
* recurring subscriptions
* biggest expenses
* spending trends
* financial score
* cash flow graph
* expense heatmap
* monthly comparisons

5. AI Financial Insights
    Generate personalized recommendations:

* overspending alerts
* unnecessary subscriptions
* savings opportunities
* budget suggestions
* spending behavior analysis
* lifestyle insights
* debt warnings
* financial health score

Example:
“You spent 34% more on food this month.”
“You have 4 recurring subscriptions.”
“You could save approximately 45,000₸ monthly by reducing entertainment expenses.”

6. Smart Features
    Add:

* AI chatbot financial assistant
* natural language transaction search
* smart budgeting
* subscription detection
* recurring payment detection
* anomaly detection
* auto-tagging
* editable categories
* export to CSV/PDF
* monthly reports
* spending notifications
* goal tracking
* dark/light mode

==================================================
UI/UX REQUIREMENTS

Style:

* premium fintech
* minimalistic
* modern glassmorphism
* smooth animations
* responsive design
* mobile-first
* rounded cards
* soft shadows
* clean typography

Include:

* sidebar navigation
* dashboard cards
* animated charts
* pie charts
* line graphs
* transaction table
* filters
* search bar
* profile page
* settings page

Color palette:

* dark mode primary
* accent gradients
* professional banking aesthetic

==================================================
TECH STACK

Frontend:

* React
* Next.js
* Tailwind CSS
* Framer Motion
* Recharts or Chart.js

Backend:

* Node.js or Supabase
* PostgreSQL
* Prisma ORM

AI:

* OpenAI API
* OCR engine
* NLP categorization
* embeddings for merchant recognition

Authentication:

* Clerk or Supabase Auth
* Google login
* Email/password login

Storage:

* encrypted cloud storage
* secure statement storage

==================================================
DATABASE STRUCTURE

Users Table:

* id
* name
* email
* avatar
* created_at

Transactions Table:

* id
* user_id
* amount
* currency
* merchant
* category
* type
* date
* description
* recurring
* created_at

Budgets Table:

* id
* user_id
* category
* limit
* spent

Subscriptions Table:

* id
* user_id
* merchant
* amount
* billing_cycle
* next_payment

==================================================
AI PROCESSING FLOW

1. User uploads statement
2. OCR extracts raw text
3. AI parses transactions
4. NLP categorizes merchants
5. System generates analytics
6. Dashboard updates automatically
7. AI generates financial insights
8. Data saves into user profile

==================================================
EXPECTED AI OUTPUT FORMAT

Return parsed data in JSON format:

{
“summary”: {
“income”: 325161,
“expenses”: 299505,
“savings”: 25656,
“top_category”: “Food”,
“subscriptions”: 3
},
“transactions”: [
{
“date”: “2026-05-15”,
“merchant”: “FIGMA”,
“amount”: -9766,
“category”: “Software Subscription”,
“type”: “expense”
},
{
“date”: “2026-05-15”,
“merchant”: “Qazaq Oil”,
“amount”: -5000,
“category”: “Fuel”,
“type”: “expense”
}
],
“insights”: [
“Food spending increased by 21%”,
“Detected recurring subscription: FIGMA”,
“Transport expenses are unusually high”
]
}

==================================================
SECURITY

Implement:

* encrypted file uploads
* secure authentication
* protected API routes
* GDPR-style privacy handling
* delete statement functionality
* private user-only financial data
* rate limiting
* validation and sanitization

==================================================
EXTRA FEATURES

Optional advanced features:

* AI spending predictions
* investment tracking
* crypto wallet support
* bank API integration
* Kaspi/Open Banking integration
* multi-currency support
* AI budgeting plans
* gamified savings system
* streaks and achievements
* financial calendar

==================================================
FINAL GOAL

The final product should feel like a real premium AI fintech startup product ready for production and investor presentation.