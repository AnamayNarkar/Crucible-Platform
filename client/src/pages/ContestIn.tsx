import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getContestQuestions, participateInContest, getContestLeaderboard } from '../services/api/contest';
import type { ContestQuestionsResponse, LeaderboardEntry } from '../services/types/contest';

const ContestIn = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const [contestData, setContestData] = useState<ContestQuestionsResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContestData = async () => {
      if (!contestId) return;
      
      try {
        setLoading(true);
        const data = await getContestQuestions(parseInt(contestId));
        if (data) {
          setContestData(data);
          // Fetch leaderboard if user has participated
          if (data.hasParticipated) {
            await fetchLeaderboard();
          }
        } else {
          setError('Failed to load contest data');
        }
      } catch (err) {
        setError('An error occurred while loading the contest');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContestData();
  }, [contestId]);

  const fetchLeaderboard = async () => {
    if (!contestId) return;
    
    try {
      const data = await getContestLeaderboard(parseInt(contestId));
      if (data) {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    }
  };

  const handleParticipate = async () => {
    if (!contestId) return;
    
    try {
      setParticipating(true);
      const result = await participateInContest(parseInt(contestId));
      if (result) {
        // Refresh contest data to update participation status
        const data = await getContestQuestions(parseInt(contestId));
        if (data) {
          setContestData(data);
          // Fetch leaderboard after participation
          await fetchLeaderboard();
        }
      }
    } catch (err) {
      console.error('Failed to participate:', err);
    } finally {
      setParticipating(false);
    }
  };

  const handleQuestionClick = (questionId: number) => {
    // Navigate to question detail page
    navigate(`/contests/${contestId}/problem/${questionId}`);
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !contestData) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || 'Contest not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      
      {/* Participation Banner */}
      {!contestData.hasParticipated && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/30 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-blue-900 dark:text-blue-100 font-medium">You haven't participated in this contest yet</p>
            <p className="text-blue-700 dark:text-blue-300 text-sm">Click participate to join and start solving problems</p>
          </div>
          <button
            onClick={handleParticipate}
            disabled={participating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {participating ? 'Joining...' : 'Participate'}
          </button>
        </div>
      )}

      {/* Contest Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {contestData.contestName}
        </h1>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side - Contest Info and Questions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Questions List */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Problems</h2>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {contestData.questions.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No problems available yet</p>
                </div>
              ) : (
                contestData.questions.map((question, index) => (
                  <div
                    key={question.id}
                    onClick={() => handleQuestionClick(question.id)}
                    className="px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{index + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                            {question.title}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 ml-4">
                        {question.hasSolved && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-green-600 dark:text-green-400">Solved</span>
                          </div>
                        )}
                        {question.hasAttempted && !question.hasSolved && (
                          <div className="flex items-center space-x-1">
                            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Attempted</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{question.points}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Leaderboard */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-8">
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Leaderboard</h2>
              {contestData?.hasParticipated && (
                <button
                  onClick={fetchLeaderboard}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  title="Refresh leaderboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {!contestData?.hasParticipated ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Participate in the contest to view the leaderboard</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No submissions yet</p>
                </div>
              ) : (
                leaderboard.map((participant) => (
                  <div
                    key={participant.userId}
                    className="px-6 py-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        participant.rank === 1 
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-100' 
                          : participant.rank === 2 
                          ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-100'
                          : participant.rank === 3
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-orange-100'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {participant.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {participant.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {participant.solvedProblems} solved
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{participant.totalScore}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">pts</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestIn;