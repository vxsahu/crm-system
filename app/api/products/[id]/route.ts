import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

import mongoose from 'mongoose';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await requireAuth();
    
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    // Sanitize body
    const { _id, id: bodyId, createdAt, updatedAt, ...updateData } = body;
    
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
        ...product.toObject(),
        id: product._id.toString()
    });
  } catch (error: any) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    
    console.error('Failed to update product:', error);

    // Enhanced error details
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Error',
      code: (error as any).code,
      validationErrors: (error as any).errors ? Object.keys((error as any).errors).map((key: string) => ({
        field: key,
        message: (error as any).errors[key].message
      })) : undefined
    };

    return NextResponse.json({ 
      error: 'Failed to update product',
      details: error instanceof Error ? error.message : String(error),
      validation: errorDetails.validationErrors
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await requireAuth();
    
    await dbConnect();
    const { id } = await params;
    
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
