import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import heic2any from 'heic2any';

const ReportItem = ({ user }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Electronics',
        location: '',
        date: new Date().toISOString().split('T')[0],
        status: 'lost'
    });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    if (!user) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            let file = e.target.files[0];
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith('.heic') || fileName.endsWith('.heif')) {
                try {
                    setLoading(true);
                    const convertedBlob = await heic2any({
                        blob: file,
                        toType: "image/jpeg",
                        quality: 0.8
                    });
                    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
                    file = new File([blob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: "image/jpeg" });
                } catch (err) {
                    console.error("HEIC conversion error:", err);
                    setError("Failed to process HEIC file. Please upload a standard image format.");
                } finally {
                    setLoading(false);
                }
            }
            setImageFile(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });
            if (imageFile) {
                submitData.append('image', imageFile);
            }

            const res = await api.post('/items', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate(`/items/${res.data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full py-12">
            <div className="glass p-8 md:p-10 rounded-2xl shadow-xl">
                <div className="mb-8 border-b border-gray-200 pb-5">
                    <h1 className="text-3xl font-bold text-gray-900">Report an Item</h1>
                    <p className="text-gray-600 mt-2">Fill out the details below to report a lost or found item to the campus community.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 text-gray-800">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-4 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.status === 'lost' ? 'border-red-500 bg-red-50 text-red-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="status" value="lost" checked={formData.status === 'lost'} onChange={handleChange} className="sr-only" />
                                    I Lost Something
                                </label>
                                <label className={`flex-1 flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.status === 'found' ? 'border-green-500 bg-green-50 text-green-700 font-bold' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input type="radio" name="status" value="found" checked={formData.status === 'found'} onChange={handleChange} className="sr-only" />
                                    I Found Something
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                            <input type="text" name="title" required value={formData.title} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                placeholder="e.g. Blue Hydroflask Water Bottle" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea name="description" required value={formData.description} onChange={handleChange} rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                                placeholder="Describe the item in detail (color, brand, distinguishing marks...)"></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select name="category" required value={formData.category} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                                <option value="Electronics">Electronics</option>
                                <option value="Clothing">Clothing</option>
                                <option value="Accessories">Accessories</option>
                                <option value="Documents">Documents/ID</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" name="date" required value={formData.date} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input type="text" name="location" required value={formData.location} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                                placeholder="e.g. 2nd Floor Library, near the printers" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload (Optional)</label>
                            <input type="file" name="image" accept="image/*,.heic,.heif" onChange={handleFileChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer bg-white" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors shadow-lg disabled:bg-primary-400 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportItem;
