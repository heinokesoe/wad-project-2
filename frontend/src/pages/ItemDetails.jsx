import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { MapPin, Calendar, Tag, User as UserIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

const ItemDetails = ({ user }) => {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Claim state
    const [claimMessage, setClaimMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [claimSuccess, setClaimSuccess] = useState('');
    const [claimError, setClaimError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await api.get(`/items/${id}`);
                setItem(res.data);
            } catch (err) {
                setError('Item not found or an error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handleClaim = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setClaimError('');
        setClaimSuccess('');
        try {
            await api.post('/claims', { itemId: item._id, message: claimMessage });
            setClaimSuccess('Message sent successfully!');
            setClaimMessage('');
        } catch (err) {
            setClaimError(err.response?.data?.message || 'Failed to submit claim request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            try {
                await api.delete(`/items/${item._id}`);
                navigate('/items');
            } catch (err) {
                alert('Failed to delete item.');
            }
        }
    };

    if (loading) return <div className="p-12 text-center animate-pulse">Loading item details...</div>;
    if (error || !item) return <div className="p-12 text-center text-red-500">{error}</div>;

    const isOwner = user?.id === item.userId._id;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 w-full py-10">
            <Link to="/items" className="text-primary-600 hover:text-primary-700 font-medium mb-6 inline-block">&larr; Back to items</Link>

            <div className="glass rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-xl">
                {/* Image Section */}
                <div className="md:w-1/2 bg-gray-100 min-h-[300px] md:min-h-[500px] relative">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">No image provided</div>
                    )}
                    <div className={`absolute top-4 right-4 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg
            ${item.status === 'lost' ? 'bg-red-500 text-white' : item.status === 'found' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}
          `}>
                        {item.status}
                    </div>
                </div>

                {/* Details Section */}
                <div className="md:w-1/2 p-8 md:p-10 flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

                    <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><MapPin className="w-4 h-4 text-primary-500" /> {item.location}</div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><Calendar className="w-4 h-4 text-primary-500" /> {new Date(item.date).toLocaleDateString()}</div>
                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100"><Tag className="w-4 h-4 text-primary-500" /> {item.category}</div>
                    </div>

                    <div className="mb-8 flex-1">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Description</h3>
                        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{item.description}</p>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary-100 p-2 rounded-full text-primary-600"><UserIcon className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-sm text-gray-500">Reported by</p>
                                    <p className="font-semibold text-gray-900">{item.userId.name}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400">Listed on {new Date(item.createdAt).toLocaleDateString()}</p>
                        </div>

                        {/* Actions */}
                        {isOwner ? (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to={`/edit-item/${item._id}`} className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors bg-white font-medium">Edit Post</Link>
                                <button onClick={handleDelete} className="flex-1 flex items-center justify-center py-3 px-4 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors bg-white font-medium">Delete Post</button>
                                <Link to="/dashboard" className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md shadow-primary-500/20 text-center">View Responses</Link>
                            </div>
                        ) : item.status === 'recovered' ? (
                            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5" />
                                <span className="font-medium">This item has been recovered.</span>
                            </div>
                        ) : user ? (
                            <form onSubmit={handleClaim} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    {item.status === 'lost' ? 'I Found This Item' : 'Claim This Item'}
                                </h4>
                                {claimSuccess && <div className="mb-3 text-sm text-green-600 font-medium bg-green-50 p-2 rounded-lg">{claimSuccess}</div>}
                                {claimError && <div className="mb-3 text-sm text-red-600 font-medium bg-red-50 p-2 rounded-lg">{claimError}</div>}
                                <textarea
                                    required
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none mb-3"
                                    placeholder={item.status === 'lost' ? "Describe how or where you found it, and how to contact you..." : "Provide proof this is yours (serial number, specific marks)..."}
                                    value={claimMessage}
                                    onChange={(e) => setClaimMessage(e.target.value)}
                                ></textarea>
                                <button type="submit" disabled={submitting} className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-70">
                                    {submitting ? 'Submitting...' : 'Send Message'}
                                </button>
                            </form>
                        ) : (
                            <div className="bg-blue-50 text-blue-700 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5" /> <span>Login to {item.status === 'lost' ? 'report you found it' : 'claim this item'}</span></div>
                                <Link to="/login" className="px-4 py-1.5 bg-white rounded shadow-sm text-sm font-bold text-blue-700 hover:bg-gray-50">Log In</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetails;
