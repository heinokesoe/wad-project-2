import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { MapPin, Calendar, Tag, ChevronRight, BarChart3 } from 'lucide-react';

const Home = () => {
    const [stats, setStats] = useState(null);
    const [recentItems, setRecentItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, itemsRes] = await Promise.all([
                    api.get('/statistics'),
                    api.get('/items?limit=6')
                ]);
                setStats(statsRes.data);
                setRecentItems(itemsRes.data.items);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Loading dashboard...</div>;

    return (
        <div className="flex flex-col gap-12 pb-16">
            {/* Hero Section */}
            <section className="bg-primary-600 text-white pt-20 pb-24 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        Lost something? Let's find it.
                    </h1>
                    <p className="text-xl md:text-2xl text-primary-100 max-w-2xl mx-auto">
                        The central hub for all lost and found items on campus.
                    </p>
                    <div className="pt-4 flex justify-center gap-4">
                        <Link to="/items" className="px-6 py-3 bg-white text-primary-600 font-bold rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
                            Browse Items
                        </Link>
                        <Link to="/report" className="px-6 py-3 bg-primary-700 text-white font-bold rounded-lg shadow-lg hover:bg-primary-800 transition-colors border border-primary-500">
                            Report an Item
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Lost</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.overview?.lost || 0}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="glass p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Found</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.overview?.found || 0}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="glass p-6 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Recovered Items</p>
                            <p className="text-3xl font-bold text-gray-900">{stats?.overview?.recovered || 0}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <BarChart3 className="h-6 w-6" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Items Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Recently Reported</h2>
                        <p className="text-gray-600 mt-1">Latest items added to the system.</p>
                    </div>
                    <Link to="/items" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1 group">
                        View all <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentItems.map((item) => (
                        <Link to={`/items/${item._id}`} key={item._id} className="group glass rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No image</div>
                                )}
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                  ${item.status === 'lost' ? 'bg-red-500 text-white' : item.status === 'found' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}
                `}>
                                    {item.status}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">{item.description}</p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" /> <span className="truncate">{item.location}</span></div>
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" /> <span>{new Date(item.date).toLocaleDateString()}</span></div>
                                    <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400" /> <span>{item.category}</span></div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
