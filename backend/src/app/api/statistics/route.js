import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Item from '@/models/Item';

export async function GET() {
    try {
        await connectToDatabase();

        // Aggregate to find most frequent item categories
        const frequentCategories = await Item.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Aggregate to find most common locations where items are reported
        const commonLocations = await Item.aggregate([
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Total counts by status
        const statusCounts = await Item.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const stats = {
            frequentLostCategories: frequentCategories.map(c => ({ category: c._id, count: c.count })),
            commonFoundLocations: commonLocations.map(l => ({ location: l._id, count: l.count })),
            overview: {
                lost: statusCounts.find(s => s._id === 'lost')?.count || 0,
                found: statusCounts.find(s => s._id === 'found')?.count || 0,
                recovered: statusCounts.find(s => s._id === 'recovered')?.count || 0,
            }
        };

        return NextResponse.json(stats, { status: 200 });
    } catch (error) {
        console.error('Fetch statistics API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
