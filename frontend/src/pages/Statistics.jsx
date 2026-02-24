import { useState, useEffect } from 'react';
import api from '../api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, MapPin, PackageX } from 'lucide-react';

const COLORS = ['#0284c7', '#0369a1', '#075985', '#0c4a6e', '#bae6fd'];
const STATUS_COLORS = {
    lost: '#ef4444',     // Red
    found: '#22c55e',    // Green
    recovered: '#3b82f6' // Blue
};

const Statistics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/statistics');
                setStats(response.data);
            } catch (err) {
                setError('Failed to load statistics data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading statistics...</div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>;
    if (!stats) return null;

    // Prepare data for Pie Chart
    const statusData = [
        { name: 'Lost', value: stats.overview.lost },
        { name: 'Found', value: stats.overview.found },
        { name: 'Recovered', value: stats.overview.recovered }
    ].filter(item => item.value > 0);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-10 space-y-8 animate-fade-in">
            <header className="mb-8 border-b border-gray-200 pb-5">
                <h1 className="text-3xl font-bold text-gray-900">Campus Insights</h1>
                <p className="text-gray-600 mt-2">Data and trends on lost and found items across campus.</p>
            </header>

            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                        <PackageX className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Currently Lost</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.overview.lost}</p>
                    </div>
                </div>
                <div className="glass p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                        <MapPin className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Currently Found</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.overview.found}</p>
                    </div>
                </div>
                <div className="glass p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Recovered</p>
                        <p className="text-3xl font-bold text-gray-900">{stats.overview.recovered}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Status Distribution Pie Chart */}
                <div className="glass p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Item Status Distribution</h3>
                    <div className="h-80">
                        {statusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [value, 'Items']}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available yet.</div>
                        )}
                    </div>
                </div>

                {/* Most Frequently Reported Categories Bar Chart */}
                <div className="glass p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Most Frequently Reported Categories</h3>
                    <div className="h-80">
                        {stats.frequentLostCategories.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.frequentLostCategories} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={40}>
                                        {stats.frequentLostCategories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available yet.</div>
                        )}
                    </div>
                </div>

                {/* Top Reported Locations Bar Chart (Full Width) */}
                <div className="glass p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Top Locations for Reported Items</h3>
                    <div className="h-80">
                        {stats.commonFoundLocations.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.commonFoundLocations} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="location" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={50} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">No data available yet.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Statistics;
