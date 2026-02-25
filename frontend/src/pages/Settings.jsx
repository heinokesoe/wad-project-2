import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { User, AlertTriangle, Save, LogOut } from 'lucide-react';

const Settings = ({ user, setUser }) => {
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password && password !== passwordConfirm) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const updates = { name, email };
            if (password) updates.password = password;

            const res = await api.put(`/users/${user.id}`, updates);

            // Update local storage and app state
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);

            setSuccess('Profile updated successfully!');
            setPassword('');
            setPasswordConfirm('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you absolutely sure? This action cannot be undone and will delete all your items and claims.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await api.delete(`/users/${user.id}`);

            // Clear auth purely
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);

            navigate('/');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete account');
            setIsDeleting(false);
        }
    };

    if (!user) return <div className="p-12 text-center text-gray-500">Please log in to view settings.</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full py-10 space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <User className="w-8 h-8 text-primary-600" /> Account Settings
                </h1>
                <p className="text-gray-600 mt-2">Manage your profile information and security.</p>
            </header>

            <div className="glass rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Profile Information</h2>

                    {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100">{error}</div>}
                    {success && <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg text-sm border border-green-100">{success}</div>}

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase">Change Password</h3>
                            <p className="text-sm text-gray-500 mb-4">Leave blank if you don't want to change your password.</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        minLength="6"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        minLength="6"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                        value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-md shadow-primary-500/20 disabled:opacity-70"
                            >
                                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 rounded-xl overflow-hidden bg-white mt-12">
                <div className="bg-red-50 p-6 border-b border-red-200 flex items-start sm:items-center gap-4">
                    <div className="bg-red-100 p-3 rounded-full text-red-600 hidden sm:block">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
                        <p className="text-red-700 text-sm mt-1">Irreversible and destructive actions for your account.</p>
                    </div>
                </div>
                <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <h3 className="font-bold text-gray-900">Delete Account</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Permanently delete your account, reported items, and all claim requests. This action cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="whitespace-nowrap inline-flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        <AlertTriangle className="w-4 h-4" /> {isDeleting ? 'Deleting...' : 'Delete Account'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
