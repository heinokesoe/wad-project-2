import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ClaimRequest from '@/models/ClaimRequest';
import Item from '@/models/Item';
import { getUserFromRequest } from '@/lib/auth';

// Get claims related to the user
export async function GET(req) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();

        // User can see claims they submitted
        const myClaims = await ClaimRequest.find({ requesterId: user.id })
            .populate('itemId')
            .sort({ createdAt: -1 });

        // User can see claims on their items
        const myItems = await Item.find({ userId: user.id }).select('_id');
        const myItemIds = myItems.map(item => item._id);

        const claimsOnMyItems = await ClaimRequest.find({ itemId: { $in: myItemIds } })
            .populate('itemId')
            .populate('requesterId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            submittedClaims: myClaims,
            receivedClaims: claimsOnMyItems
        }, { status: 200 });

    } catch (error) {
        console.error('Fetch claims API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

// Submit a new claim
export async function POST(req) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();
        const data = await req.json();

        if (!data.itemId || !data.message) {
            return NextResponse.json({ message: 'itemId and message are required' }, { status: 400 });
        }

        const item = await Item.findById(data.itemId);
        if (!item) return NextResponse.json({ message: 'Item not found' }, { status: 404 });

        if (item.userId.toString() === user.id) {
            return NextResponse.json({ message: 'You cannot claim your own post' }, { status: 400 });
        }

        // Check if already claimed
        const existingClaim = await ClaimRequest.findOne({ itemId: data.itemId, requesterId: user.id });
        if (existingClaim) {
            return NextResponse.json({ message: 'You have already submitted a claim for this item' }, { status: 400 });
        }

        const newClaim = await ClaimRequest.create({
            ...data,
            requesterId: user.id,
            status: 'pending'
        });

        return NextResponse.json(newClaim, { status: 201 });
    } catch (error) {
        console.error('Create claim API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
