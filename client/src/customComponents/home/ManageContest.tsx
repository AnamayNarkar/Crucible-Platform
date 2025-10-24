import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  getManageContestData, 
  addAdminToContest, 
  removeAdminFromContest,
  deleteContest,
  updateContest
} from '../../services/api/contest';
import type { ManageContestData } from '../../services/types/manageContest';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Users, 
  FileQuestion,
  Loader2,
  UserPlus,
  Mail,
  X,
  CheckCircle,
  ImageIcon,
  Sparkles,
  Shield,
  Save
} from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import EditContestDetails, { type ContestFormData } from './EditContestDetails';
import ErrorComponent from '../global/errors';
import Forbidden from '../global/errors/Forbidden';

const ManageContest = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ManageContestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminActionLoading, setAdminActionLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState<ContestFormData>({
    name: '',
    bannerImageUrl: '',
    cardDescription: '',
    markdownDescription: '',
    startTime: '',
    endTime: '',
  });

  const user = useSelector((state: any) => state.auth.user);
  const isCreator = user && data ? user.id === data.contest.creatorId : false;

  useEffect(() => {
    const fetchContestData = async () => {
      if (!contestId) return;

      try {
        setLoading(true);
        setError(null);
        const response = await getManageContestData(Number(contestId));
        if (response && response.data) {
          setData(response.data);
        } else {
          setError('Failed to load contest data');
        }
      } catch (err: any) {
        if (err.status === 403) {
          setIsForbidden(true);
        } else {
          setError(err.message || 'Failed to fetch contest data');
        }
        console.error('Error fetching contest data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContestData();
  }, [contestId]);

  const handleEditContest = () => {
    if (!data) return;
    
    setEditFormData({
      name: data.contest.name,
      bannerImageUrl: data.contest.bannerImageUrl,
      cardDescription: data.contest.cardDescription,
      markdownDescription: data.contest.markdownDescription,
      startTime: data.contest.startTime,
      endTime: data.contest.endTime,
    });
    setIsEditModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMarkdownChange = (value: string | undefined) => {
    setEditFormData(prev => ({ ...prev, markdownDescription: value || '' }));
  };

  const handleUpdateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contestId) return;
    
    setIsSubmitting(true);
    
    try {
      const payload: any = {
        cardDescription: editFormData.cardDescription,
        markdownDescription: editFormData.markdownDescription,
      };
      if (isCreator) {
        payload.name = editFormData.name;
        payload.bannerImageUrl = editFormData.bannerImageUrl;
        payload.startTime = editFormData.startTime;
        payload.endTime = editFormData.endTime;
      }
      const result = await updateContest(Number(contestId), payload);
      
      if (result && result.data) {
        // Update local state with the updated contest
        setData(prevData => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            contest: result.data
          };
        });
        setIsEditModalOpen(false);
        setSuccessMessage(result.message || 'Contest updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Error updating contest:', error);
      alert(error?.message || 'Failed to update contest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !contestId) return;

    try {
      setAdminActionLoading('adding');
      const success = await addAdminToContest(Number(contestId), newAdminEmail);
      
      if (success) {
        const response = await getManageContestData(Number(contestId));
        if (response && response.data) {
          setData(response.data);
        }
        setNewAdminEmail('');
        setSuccessMessage('Admin added successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add admin');
    } finally {
      setAdminActionLoading(null);
    }
  };

  const handleRemoveAdmin = async (adminId: string, adminEmail: string) => {
    if (!contestId) return;
    
    if (!confirm('Are you sure you want to remove this admin?')) return;

    try {
      setAdminActionLoading(adminId);
      const success = await removeAdminFromContest(Number(contestId), adminEmail);
      
      if (success) {
        const response = await getManageContestData(Number(contestId));
        if (response && response.data) {
          setData(response.data);
        }
        setSuccessMessage('Admin removed successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove admin');
    } finally {
      setAdminActionLoading(null);
    }
  };

  const handleDeleteContest = async () => {
    if (!contestId) return;
    
    if (!confirm('Are you sure you want to delete this contest? This action cannot be undone.')) return;

    try {
      const success = await deleteContest(Number(contestId));
      if (success) {
        setData(null);
        navigate("/");
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete contest');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700 font-medium">Loading contest data...</p>
        </div>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <Forbidden
        title="403 - Forbidden"
        message="You don't have permission to manage this contest."
        backButtonText="Back to Contests"
        backButtonPath="/contests"
      />
    );
  }

  if (error) {
    return (
      <ErrorComponent
        type="404"
        title="Contest Not Found"
        message={error}
        backButtonText="Back to Contests"
        backButtonPath="/contests"
      />
    );
  }

  if (!data) {
    return (
      <ErrorComponent
        type="404"
        title="Contest Not Found"
        message="No contest data available. This contest may have been deleted or doesn't exist."
        backButtonText="Back to Contests"
        backButtonPath="/contests"
      />
    );
  }

  const { contest, admins, questions } = data;

  return (
    <>
      {/* Edit Contest Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Edit className="w-6 h-6 text-blue-500" />
                <span>Edit Contest</span>
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <EditContestDetails
                formData={editFormData}
                handleInputChange={handleInputChange}
                onMarkdownChange={handleMarkdownChange}
                isCreator={isCreator}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateContest}
                disabled={isSubmitting}
                className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Questions Modal */}
      {isQuestionsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <FileQuestion className="w-6 h-6 text-blue-500" />
                <span>Manage Questions</span>
              </h2>
              <button
                onClick={() => setIsQuestionsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">Manage your contest questions here</p>
                <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                  <span>Add Question</span>
                </button>
              </div>

              {questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1 min-w-0">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex-shrink-0">
                            #{index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 mb-1">{question.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="font-medium">Points: {question.points}</span>
                              <span>•</span>
                              <span>ID: {question.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit question">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete question">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No questions added yet</p>
                  <button className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm">
                    Add Your First Question
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
              <button
                onClick={() => setIsQuestionsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen pb-12">
        <div className="max-w-[1800px] min-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/contests')}
                className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300 transition-all shadow-sm hover:shadow-md cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <Sparkles className="w-8 h-8 text-blue-500" />
                  <span>Manage Contest</span>
                </h1>
                <p className="text-gray-600 mt-1">Configure and manage your contest</p>
              </div>
            </div>
            {isCreator && (
              <button
                onClick={handleDeleteContest}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium shadow-lg shadow-red-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Contest</span>
              </button>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">{successMessage}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Contest Description (Half width) */}
            <div>
              <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                    <span>Contest Overview</span>
                  </h2>
                  <button
                    onClick={handleEditContest}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-all shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Banner */}
                  {contest.bannerImageUrl && (
                    <div className="relative h-48 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={contest.bannerImageUrl}
                        alt="Contest Banner"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-xl">{contest.name}</h3>
                      </div>
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Contest Name</label>
                      <p className="text-gray-900 text-lg">{contest.name}</p>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-1 block">Short Description</label>
                      <p className="text-gray-700">{contest.cardDescription}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-2 text-blue-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-semibold">Start</span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {new Date(contest.startTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(contest.startTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-2 text-blue-600 mb-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-semibold">End</span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {new Date(contest.endTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(contest.endTime).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Markdown Description */}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Full Description</label>
                    <div className="bg-white rounded-xl border border-gray-200 p-4 prose prose-sm max-w-none" data-color-mode="light">
                      <MDEditor.Markdown source={contest.markdownDescription} />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Admins (top) and Questions (bottom) */}
            <div className="space-y-6">
              {/* Admins Section - Fixed height with scroll */}
              <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <span>Admins ({admins.length})</span>
                  </h2>
                </div>

                <div className="p-6">
                  {/* Add Admin Form */}
                  {isCreator && (
                    <form onSubmit={handleAddAdmin} className="mb-4">
                      <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Add Admin by Email
                      </label>
                      <div className="flex space-x-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="email"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)}
                            placeholder="admin@example.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={adminActionLoading === 'adding'}
                          className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                          {adminActionLoading === 'adding' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Admin List - Fixed height with scroll */}
                  <div className="max-h-[240px] overflow-y-auto space-y-3 pr-2">
                    {admins.length > 0 ? (
                      admins.map((admin) => (
                        <div
                          key={admin.id}
                          className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                                <Users className="w-4 h-4 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate text-sm">{admin.username}</p>
                                <p className="text-xs text-gray-600 truncate">{admin.email}</p>
                              </div>
                            </div>
                            {isCreator && (
                              <button
                                onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                                disabled={adminActionLoading === admin.id}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                title="Remove admin"
                              >
                                {adminActionLoading === admin.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No admins assigned yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Questions Section */}
              <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <FileQuestion className="w-5 h-5 text-blue-500" />
                    <span>Questions ({questions.length})</span>
                  </h2>
                  <button 
                    onClick={() => setIsQuestionsModalOpen(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    <span>Edit</span>
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  {questions.length > 0 ? (
                    <div className="space-y-3">
                      {questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex-shrink-0">
                                #{index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">{question.title}</h3>
                                <p className="text-xs text-gray-600">Points: {question.points}</p>
                              </div>
                            </div>
                            <button 
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                              title="Delete question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <FileQuestion className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No questions added yet</p>
                      <button className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors shadow-sm">
                        Add Your First Question
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageContest;