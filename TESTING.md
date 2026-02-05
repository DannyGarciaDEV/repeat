# Testing Guide for Repeat App

This document outlines the testing strategy and test cases for the Repeat flashcard application.

## Test Setup

Run tests with:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## Test Coverage

### 1. Spaced Repetition Algorithm Tests

**Location**: `__tests__/spacedRepetition.test.ts`

Tests verify:
- ✅ Again (0): Card resets properly
- ✅ Hard (1): Increments hardCount, resets after 3
- ✅ Good (2): Increments goodCount, resets after 5
- ✅ Easy (3): Sets long interval, no repeat
- ✅ Due date calculations
- ✅ Card filtering by due date

### 2. Manual Testing Checklist

#### Authentication
- [ ] User can register with email, password, and name
- [ ] User can login with correct credentials
- [ ] User cannot login with incorrect credentials
- [ ] User stays logged in after page refresh
- [ ] User can logout successfully
- [ ] Protected routes redirect to login when not authenticated

#### User Profile
- [ ] User can view their profile
- [ ] User can update their name
- [ ] User can update their bio
- [ ] User can update their profile image URL
- [ ] Profile changes persist after page refresh

#### Flashcard Sets
- [ ] User can create a new set with name, description, and color
- [ ] User can edit an existing set
- [ ] User can delete a set (cards move to "All Cards")
- [ ] User can view all sets
- [ ] Set card count displays correctly
- [ ] User can navigate to set detail page

#### Flashcards
- [ ] User can create a new flashcard with front and back
- [ ] User can assign flashcard to a set
- [ ] User can edit an existing flashcard
- [ ] User can delete a flashcard
- [ ] User can view all flashcards
- [ ] User can filter flashcards by set
- [ ] Cards display set badge when in a set

#### Set Detail Page
- [ ] User can view all flashcards in a specific set
- [ ] User can add new cards directly to a set
- [ ] User can edit cards from set detail page
- [ ] User can delete cards from set detail page
- [ ] Set statistics display correctly (total, due, mastered)
- [ ] User can navigate back to dashboard

#### Quiz Mode
- [ ] User can start quiz with due cards
- [ ] User can see question (front)
- [ ] User can reveal answer (back)
- [ ] User can rate card as Again (0)
- [ ] User can rate card as Hard (1)
- [ ] User can rate card as Good (2)
- [ ] User can rate card as Easy (3)
- [ ] Card scheduling updates after review
- [ ] Progress bar updates correctly
- [ ] Quiz completes when all cards reviewed

#### Spaced Repetition Behavior
- [ ] Hard cards repeat every 3 times
- [ ] Good cards repeat every 5 questions
- [ ] Easy cards have long intervals (no immediate repeat)
- [ ] Again resets card completely
- [ ] Due cards appear in quiz mode
- [ ] Next review date updates correctly

#### Calendar View
- [ ] Calendar displays current month
- [ ] Days with created cards are highlighted
- [ ] User can navigate to previous month
- [ ] User can navigate to next month
- [ ] Card count displays on days with cards
- [ ] Today is highlighted

#### Dashboard
- [ ] Statistics display correctly (total, due, mastered, sets)
- [ ] User can switch between tabs (Cards, Quiz, Sets, Calendar)
- [ ] Set filter works correctly
- [ ] All navigation links work

## API Endpoint Tests

### Authentication Endpoints
- [ ] `POST /api/auth/register` - Creates new user
- [ ] `POST /api/auth/login` - Authenticates user
- [ ] `GET /api/auth/session` - Verifies session

### User Endpoints
- [ ] `GET /api/users/[id]` - Gets user profile
- [ ] `PUT /api/users/[id]` - Updates user profile

### Set Endpoints
- [ ] `GET /api/sets?userId=...` - Gets all sets for user
- [ ] `POST /api/sets` - Creates new set
- [ ] `GET /api/sets/[id]` - Gets single set
- [ ] `PUT /api/sets/[id]` - Updates set
- [ ] `DELETE /api/sets/[id]` - Deletes set

### Flashcard Endpoints
- [ ] `GET /api/flashcards?userId=...` - Gets all cards
- [ ] `GET /api/flashcards?userId=...&setId=...` - Gets cards in set
- [ ] `POST /api/flashcards` - Creates new card
- [ ] `GET /api/flashcards/[id]` - Gets single card
- [ ] `PUT /api/flashcards/[id]` - Updates card
- [ ] `DELETE /api/flashcards/[id]` - Deletes card
- [ ] `POST /api/flashcards/[id]/review` - Reviews card

### Calendar Endpoint
- [ ] `GET /api/calendar?year=...&month=...` - Gets calendar data

## Integration Test Scenarios

### Scenario 1: Complete Learning Flow
1. Register new user
2. Create a set "Spanish Vocabulary"
3. Add 5 flashcards to the set
4. Start quiz mode
5. Review all cards (mix of Hard, Good, Easy)
6. Verify cards are scheduled correctly
7. Check calendar shows card creation dates

### Scenario 2: Set Management
1. Create 3 different sets
2. Add cards to each set
3. Edit one set (name, description, color)
4. View set detail page
5. Add more cards from set detail page
6. Delete one set
7. Verify cards from deleted set are now in "All Cards"

### Scenario 3: Spaced Repetition Verification
1. Create a card
2. Mark as Hard 3 times - verify it resets
3. Mark as Good 5 times - verify interval increases
4. Mark as Easy - verify long interval
5. Mark as Again - verify complete reset

## Performance Tests

- [ ] Dashboard loads quickly with 100+ cards
- [ ] Set detail page loads quickly with 50+ cards
- [ ] Quiz mode is responsive
- [ ] Calendar renders quickly
- [ ] API responses are fast (< 500ms)

## Browser Compatibility

Test in:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Accessibility Tests

- [ ] All buttons are keyboard accessible
- [ ] Forms have proper labels
- [ ] Color contrast meets WCAG standards
- [ ] Screen reader compatible
- [ ] Focus indicators visible

## Security Tests

- [ ] Passwords are hashed (bcrypt)
- [ ] Users can only access their own data
- [ ] API endpoints validate user ownership
- [ ] No sensitive data in localStorage
- [ ] XSS protection in place

## Known Issues

None currently.

## Running All Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test spacedRepetition.test.ts
```

## Test Data

For manual testing, use:
- Email: test@example.com
- Password: test123456
- Name: Test User

Or create your own test account.

