import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { MapPin, Calendar, Tag, Search, Filter } from 'lucide-react';

const Items = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const fetchItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (statusFilter) params.append('status', statusFilter);
            if (categoryFilter) params.append('category', categoryFilter);

            const res = await api.get(`/items?${params.toString()}`);
            setItems(res.data.items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [search, statusFilter, categoryFilter]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 text-gray-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Browse Items</h1>
                    <p className="text-gray-600 mt-1">Search through all reported lost and found items on campus.</p>
                </div>
                <Link to="/report" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-md">
                    Report Item
                </Link>
            </div>

            <div className="glass p-4 rounded-xl mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="lost">Lost</option>
                        <option value="found">Found</option>
                        <option value="recovered">Recovered</option>
                    </select>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Documents">Documents/ID</option>
                        <option value="Others">Others</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-80 bg-gray-200 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No items found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <Link to={`/items/${item._id}`} key={item._id} className="group glass rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                            <div className="h-48 bg-gray-200 relative overflow-hidden flex-shrink-0">
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
                            <div className="p-6 flex flex-col flex-1">
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-2">{item.title}</h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>
                                <div className="space-y-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" /> <span className="truncate">{item.location}</span></div>
                                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" /> <span className="truncate">{new Date(item.date).toLocaleDateString()}</span></div>
                                    <div className="flex items-center gap-2"><Tag className="w-4 h-4 text-gray-400 flex-shrink-0" /> <span className="truncate">{item.category}</span></div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Items;
