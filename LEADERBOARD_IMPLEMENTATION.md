# Leaderboard Implementation Summary

## Overview
Implemented a contest leaderboard feature that displays the top 5 participants ranked by their total score and solved problems count.

## Backend Changes

### 1. New DTOs Created

#### `LeaderboardEntryDto.java`
- Location: `src/main/java/com/crucible/platform/v1/dto/contest/`
- Fields:
  - `userId`: Long
  - `username`: String
  - `totalScore`: Integer
  - `solvedProblems`: Integer
  - `rank`: Integer

#### `ContestLeaderboardResponse.java`
- Location: `src/main/java/com/crucible/platform/v1/dto/contest/`
- Fields:
  - `contestId`: Long
  - `contestName`: String
  - `leaderboard`: List<LeaderboardEntryDto>

### 2. Service Layer

#### `ContestService.java`
Added method: `getContestLeaderboard(Long contestId, Long userId)`

**Features:**
- Verifies contest exists
- Checks if user has participated (required to view leaderboard)
- Fetches all contest participants
- Calculates score for each participant based on:
  - Accepted submissions only
  - Points from solved questions (no duplicates)
- Sorts by total score (descending), then by solved problems (descending)
- Returns top 5 participants only
- Assigns ranks (1-5)

### 3. Controller Layer

#### `ContestController.java`
Added endpoint: `GET /api/v1/contests/{contestId}/leaderboard`

**Authorization:**
- Requires user to be authenticated (WebSession)
- User must have participated in the contest

## Frontend Changes

### 1. Type Definitions

#### `contest.ts`
Added interfaces:
- `LeaderboardEntry`: Matches backend DTO
- `ContestLeaderboardResponse`: Matches backend response

### 2. API Service

#### `contest.ts`
Added function: `getContestLeaderboard(contestId: number)`
- Fetches leaderboard data from backend
- Returns `ContestLeaderboardResponse` or null on error

### 3. UI Component

#### `ContestIn.tsx`
**State Management:**
- Added `leaderboard` state to store leaderboard entries
- Replaced static leaderboard with dynamic data

**Features:**
- Fetches leaderboard automatically when user has participated
- Displays "Participate to view leaderboard" message for non-participants
- Shows "No submissions yet" when leaderboard is empty
- Refresh button to manually reload leaderboard
- Visual rank indicators:
  - Rank 1: Gold background
  - Rank 2: Silver background
  - Rank 3: Bronze background
  - Ranks 4-5: Gray background
- Displays username, solved problems count, and total score
- Dark mode support

**Functions:**
- `fetchLeaderboard()`: Fetches leaderboard data
- Updated `handleParticipate()`: Fetches leaderboard after joining contest
- Updated `useEffect()`: Fetches leaderboard on initial load if participated

## API Endpoint

### GET `/api/v1/contests/{contestId}/leaderboard`

**Request:**
- Path parameter: `contestId` (Long)
- Requires authenticated session

**Response:**
```json
{
  "message": "Leaderboard retrieved successfully",
  "data": {
    "contestId": 1,
    "contestName": "Spring Code Challenge",
    "leaderboard": [
      {
        "userId": 10,
        "username": "john_doe",
        "totalScore": 450,
        "solvedProblems": 5,
        "rank": 1
      },
      {
        "userId": 15,
        "username": "jane_smith",
        "totalScore": 420,
        "solvedProblems": 5,
        "rank": 2
      }
    ]
  }
}
```

**Error Cases:**
- 404: Contest not found
- 403: User has not participated in the contest

## Scoring Logic

1. Only "Accepted" submissions are counted
2. Each question is counted only once (first accepted submission)
3. Total score = Sum of points from all solved questions
4. Ranking:
   - Primary: Total score (descending)
   - Secondary: Number of solved problems (descending)
5. Only top 5 participants are returned

## Testing Recommendations

1. **Test with no participants**: Should show empty state
2. **Test without participation**: Should show "participate first" message
3. **Test refresh button**: Should fetch latest data
4. **Test after solving a problem**: Leaderboard should update
5. **Test with ties**: Verify correct ranking behavior
6. **Test dark mode**: Ensure proper styling
