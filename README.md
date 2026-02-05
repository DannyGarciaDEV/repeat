# Repeat - Spaced Repetition Learning System

A beautiful, full-featured flashcard application built with Next.js, TypeScript, and MongoDB. Master anything with intelligent spaced repetition and organized flashcard sets.

## ✨ Features

### 🔐 Authentication & Profiles
- **User Authentication**: Secure login and registration
- **User Profiles**: Customizable profile with name, bio, and profile image
- **Personal Collections**: Each user has their own flashcard collection

### 📚 Flashcard Management
- **Create Flashcards**: Add custom flashcards with front and back content
- **Edit & Delete**: Full CRUD operations for your cards
- **Organize with Sets**: Create custom sets/categories to organize your flashcards
- **Set Filtering**: Filter cards by set or view all cards together

### 🧠 Intelligent Spaced Repetition
Custom algorithm that adapts to your learning:
- **Again (0)**: Card failed, review immediately
- **Hard (1)**: Repeat every 3 times - perfect for challenging cards
- **Good (2)**: Repeat every 5 questions - balanced learning
- **Easy (3)**: No repeat - long intervals for mastered content

### 🎯 Quiz Mode
- Interactive quiz interface
- Show/hide answers
- Track your performance
- Automatic scheduling based on your responses

### 📅 Calendar View
- Visual calendar showing when cards were created
- Track your learning activity over time
- Navigate between months

### 📊 Statistics Dashboard
- Total cards count
- Cards due today
- Mastered cards
- Sets count

### 🎨 Beautiful UI
- Modern, gradient-based design
- Dark mode support
- Responsive layout
- Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.nbqmops.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=flashcards
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Register a new account or login to get started!

## 📖 How It Works

### Spaced Repetition Algorithm

The app uses a custom spaced repetition algorithm:

- **Hard (Quality 1)**: When you mark a card as "Hard", it will repeat every 3 times. This helps you master challenging content through repetition.

- **Good (Quality 2)**: When you mark a card as "Good", it will repeat every 5 questions. This provides balanced learning intervals.

- **Easy (Quality 3)**: When you mark a card as "Easy", it won't repeat for a long time. Perfect for content you've mastered.

- **Again (Quality 0)**: If you fail a card, it resets and you'll review it again immediately.

### Using the App

1. **Register/Login**: Create an account or login to access your personal collection
2. **Create Sets**: Organize your flashcards into custom sets (e.g., "Spanish Vocabulary", "Math Formulas")
3. **Add Cards**: Create flashcards with front and back content, optionally assign them to sets
4. **Review Cards**: Use Quiz Mode to review cards due for study
5. **Track Progress**: View statistics and calendar to monitor your learning
6. **Manage Profile**: Customize your profile with name, bio, and profile image

## 🏗️ Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/              # Authentication endpoints
│   │   ├── flashcards/        # CRUD operations for flashcards
│   │   ├── sets/              # CRUD operations for sets
│   │   ├── users/             # User profile endpoints
│   │   └── calendar/          # Calendar data endpoint
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── profile/               # User profile page
│   ├── page.tsx               # Main dashboard
│   └── layout.tsx             # Root layout
├── components/
│   ├── CardList.tsx           # Display all flashcards
│   ├── CardForm.tsx           # Create/edit flashcard form
│   ├── QuizMode.tsx           # Quiz interface
│   ├── CalendarView.tsx       # Calendar visualization
│   └── SetManager.tsx         # Sets management
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── lib/
│   ├── mongodb.ts             # MongoDB connection
│   └── spacedRepetition.ts    # Spaced repetition algorithm
└── types/
    ├── flashcard.ts           # Flashcard types
    ├── user.ts                # User types
    └── set.ts                 # Set types
```

## 🛠️ Technologies

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **MongoDB**: Database for flashcard and user storage
- **Tailwind CSS**: Styling and responsive design
- **date-fns**: Date manipulation utilities
- **bcryptjs**: Password hashing

## 📝 License

MIT

## 🎯 Future Enhancements

- Export/import flashcards
- Sharing sets with other users
- Advanced statistics and analytics
- Mobile app version
- Spaced repetition algorithm customization

---

Built with ❤️ for effective learning
# repeat
