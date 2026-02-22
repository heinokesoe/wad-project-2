import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ClaimRequest from '@/models/ClaimRequest';
import Item from '@/models/Item';
import { getUserFromRequest } from '@/lib/auth';

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();
        const claim = await ClaimRequest.findById(id).populate('itemId');

        if (!claim) {
            return NextResponse.json({ message: 'Claim not found' }, { status: 404 });
        }

        const { status, message } = await req.json();

        // 1. Owner Action: Accept/Reject
        if (status) {
            if (claim.itemId.userId.toString() !== user.id) {
                return NextResponse.json({ message: 'Forbidden: Only item owner can update status' }, { status: 403 });
            }
            if (!['accepted', 'rejected'].includes(status)) {
                return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
            }
            claim.status = status;

            // If accepted, mark item as recovered and reject all other pending claims
            if (status === 'accepted') {
                await Item.findByIdAndUpdate(claim.itemId._id, { status: 'recovered' });
                await ClaimRequest.updateMany(
                    { itemId: claim.itemId._id, _id: { $ne: claim._id }, status: 'pending' },
                    { status: 'rejected' }
                );
            }
        // 2. Requester Action: Update Message (mutually exclusive with status action)
        } else if (message !== undefined) {
            if (claim.requesterId.toString() !== user.id) {
                return NextResponse.json({ message: 'Forbidden: Only requester can update message' }, { status: 403 });
            }
            if (claim.status !== 'pending') {
                return NextResponse.json({ message: 'Cannot edit message of a resolved claim' }, { status: 400 });
            }
            claim.message = message;
        }

        await claim.save();

        return NextResponse.json(claim, { status: 200 });
    } catch (error) {
        console.error('Update claim API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const user = getUserFromRequest(req);
        if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectToDatabase();
        const claim = await ClaimRequest.findById(id);

        if (!claim) {
            return NextResponse.json({ message: 'Claim not found' }, { status: 404 });
        }

        // Only the requester can delete/cancel their claim
        if (claim.requesterId.toString() !== user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await ClaimRequest.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Claim cancelled successfully' }, { status: 200 });
    } catch (error) {
        console.error('Delete claim API error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
