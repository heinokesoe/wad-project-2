import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Check, X, Eye, Edit2 } from 'lucide-react';

const Dashboard = ({ user }) => {
    const [data, setData] = useState({ submittedClaims: [], receivedClaims: [] });
    const [myItems, setMyItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit Claim Modal State
    const [editingClaim, setEditingClaim] = useState(null);
    const [editMessage, setEditMessage] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const [claimsRes, itemsRes] = await Promise.all([
                api.get('/claims'),
                api.get(`/items?userId=${user.id}&limit=100`)
            ]);

            // Filter out claims where the associated item has been deleted (itemId is null)
            const validReceivedClaims = claimsRes.data.receivedClaims.filter(c => c.itemId != null);
            const validSubmittedClaims = claimsRes.data.submittedClaims.filter(c => c.itemId != null);

            setData({
                receivedClaims: validReceivedClaims,
                submittedClaims: validSubmittedClaims
            });

            setMyItems(itemsRes.data.items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleClaimAction = async (claimId, status) => {
        try {
            await api.put(`/claims/${claimId}`, { status });
            fetchDashboardData(); // Refresh UI
        } catch (err) {
            alert('Failed to update claim');
        }
    };

    const handleCancelClaim = async (claimId) => {
        if (!window.confirm('Are you sure you want to cancel this request?')) return;
        try {
            await api.delete(`/claims/${claimId}`);
            fetchDashboardData();
        } catch (err) {
            alert('Failed to cancel request');
        }
    };

    const handleUpdateClaimMessage = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            await api.put(`/claims/${editingClaim._id}`, { message: editMessage });
            setEditingClaim(null);
            fetchDashboardData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update message');
        } finally {
            setEditLoading(false);
        }
    };

    if (!user) return <div className="p-12 text-center text-gray-500">Please log in to view your dashboard.</div>;
    if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading dashboard...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-10 space-y-12">
            <header>
                <h1 className="text-3xl font-bold text-gray-900">Your Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your reported items and respond to claims.</p>
            </header>

            {/* Received Claims (Pending Actions) */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Responses on Your Listed Items
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-sm">{data.receivedClaims.length}</span>
                </h2>
                <div className="glass rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <ul className="divide-y divide-gray-100">
                        {data.receivedClaims.length === 0 ? (
                            <li className="p-6 text-center text-gray-500">No responses received yet.</li>
                        ) : (
                            data.receivedClaims.map(claim => (
                                <li key={claim._id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500 mb-1">Sent by <span className="font-medium text-gray-900">{claim.requesterId.name}</span> on {new Date(claim.createdAt).toLocaleDateString()}</p>
                                        <p className="font-medium text-gray-900 mb-2">Item: <Link to={`/items/${claim.itemId._id}`} className="text-primary-600 hover:underline">{claim.itemId.title}</Link> <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-sm ${claim.itemId.status === 'lost' ? 'bg-red-100 text-red-700' : claim.itemId.status === 'found' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{claim.itemId.status.toUpperCase()}</span></p>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700 mt-2 italic">"{claim.message}"</div>
                                    </div>
                                    <div className="flex sm:flex-col gap-2">
                                        {claim.status === 'pending' && claim.itemId.status !== 'recovered' ? (
                                            <>
                                                <button onClick={() => handleClaimAction(claim._id, 'accepted')} className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 font-medium rounded-lg border border-green-200 transition-colors">
                                                    <Check className="w-4 h-4" /> Accept
                                                </button>
                                                <button onClick={() => handleClaimAction(claim._id, 'rejected')} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 font-medium rounded-lg border border-red-200 transition-colors">
                                                    <X className="w-4 h-4" /> Reject
                                                </button>
                                            </>
                                        ) : (
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${claim.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    claim.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {claim.status}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </section>

            {/* Submitted Claims */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Your Sent Responses
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-sm">{data.submittedClaims.length}</span>
                </h2>
                <div className="glass rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <ul className="divide-y divide-gray-100">
                        {data.submittedClaims.length === 0 ? (
                            <li className="p-6 text-center text-gray-500">You haven't submitted any claims yet.</li>
                        ) : (
                            data.submittedClaims.map(claim => (
                                <li key={claim._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 mb-1">Item: <Link to={`/items/${claim.itemId._id}`} className="text-primary-600 hover:underline">{claim.itemId.title}</Link></p>
                                        <p className="text-sm text-gray-500">Submitted on {new Date(claim.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 mr-2 rounded-full text-sm font-bold uppercase tracking-wider
                      ${claim.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                claim.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    `}>
                                            {claim.status}
                                        </span>
                                        {claim.status === 'pending' && (
                                            <>
                                                <button onClick={() => { setEditingClaim(claim); setEditMessage(claim.message); }} className="text-gray-500 hover:text-primary-600 p-1 rounded-full hover:bg-gray-100 transition-colors" title="Edit Message">
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleCancelClaim(claim._id)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors" title="Cancel Request">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </section>

            {/* My Items */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    Your Listed Items
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-sm">{myItems.length}</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myItems.map(item => (
                        <div key={item._id} className="glass rounded-xl p-5 border border-gray-100 flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-gray-900 line-clamp-1 flex-1 pr-2">{item.title}</h3>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.status === 'lost' ? 'bg-red-100 text-red-700' : item.status === 'found' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>{item.status}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{item.description}</p>
                            <Link to={`/items/${item._id}`} className="inline-flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm">
                                <Eye className="w-4 h-4" /> View Item Details
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* Edit Message Modal */}
            {editingClaim && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-900">Edit Claim Message</h3>
                            <button onClick={() => setEditingClaim(null)} className="text-gray-400 hover:text-gray-600 focus:outline-none">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateClaimMessage} className="p-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                            <textarea
                                required
                                rows="4"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                            ></textarea>
                            <div className="mt-6 flex justify-end gap-3">
                                <button type="button" onClick={() => setEditingClaim(null)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                <button type="submit" disabled={editLoading} className="px-5 py-2.5 bg-primary-600 text-white font-medium hover:bg-primary-700 rounded-lg transition-colors shadow-md shadow-primary-500/20 disabled:opacity-70">
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
