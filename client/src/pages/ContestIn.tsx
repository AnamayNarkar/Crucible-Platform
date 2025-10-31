import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getContestQuestions, participateInContest } from '../services/api/contest';
import type { ContestQuestionsResponse } from '../services/types/contest';

const ContestIn = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const [contestData, setContestData] = useState<ContestQuestionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Static leaderboard data (will be replaced with real data later)
  const staticLeaderboard = [
    { rank: 1, username: 'CodeMaster', score: 450, solved: 5 },
    { rank: 2, username: 'AlgoExpert', score: 420, solved: 5 },
    { rank: 3, username: 'DevNinja', score: 380, solved: 4 },
    { rank: 4, username: 'ByteWizard', score: 350, solved: 4 },
    { rank: 5, username: 'CodeWarrior', score: 320, solved: 3 },
  ];

  useEffect(() => {
    const fetchContestData = async () => {
      if (!contestId) return;
      
      try {
        setLoading(true);
        const data = await getContestQuestions(parseInt(contestId));
        if (data) {
          setContestData(data);
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
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Leaderboard</h2>
            </div>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {staticLeaderboard.map((participant) => (
                <div
                  key={participant.rank}
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
                        : 'bg-gray-100 text-gray-600 dark:text-gray-700 dark:text-gray-200'
                    }`}>
                      {participant.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {participant.username}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{participant.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContestIn;