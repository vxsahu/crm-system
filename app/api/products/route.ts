import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAuth, unauthorizedResponse } from '@/lib/auth';

export async function GET() {
  try {
    // Require authentication
    await requireAuth();
    
    await dbConnect();
    const products = await Product.find({}).sort({ createdAt: -1 });
    // Map _id to id for frontend compatibility
    const formattedProducts = products.map(doc => ({
      ...doc.toObject(),
      id: doc._id.toString(),
      _id: undefined,
      __v: undefined
    }));
    return NextResponse.json(formattedProducts);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Require authentication
    await requireAuth();
    
    await dbConnect();
    const body = await request.json();

    console.log('POST /api/products - Received:', Array.isArray(body) ? `Array of ${body.length} items` : 'Single item');

    // Check if it's a bulk insert (array) or single insert
    if (Array.isArray(body)) {
      console.log('Bulk insert - Sample item:', body[0]);

      // Validate that array is not empty
      if (body.length === 0) {
        return NextResponse.json({
          error: 'Empty array',
          details: 'Cannot import empty product list'
        }, { status: 400 });
      }

      // Check for duplicates in the incoming list itself
      const tagMap = new Map();
      const serialMap = new Map();
      const duplicatesInRequest: string[] = [];

      body.forEach((item: any) => {
        if (tagMap.has(item.tagNumber)) duplicatesInRequest.push(`Duplicate Tag in file: ${item.tagNumber}`);
        tagMap.set(item.tagNumber, true);

        if (serialMap.has(item.serialNumber)) duplicatesInRequest.push(`Duplicate Serial in file: ${item.serialNumber}`);
        serialMap.set(item.serialNumber, true);
      });

      if (duplicatesInRequest.length > 0) {
        return NextResponse.json({
          error: 'Duplicate items in file',
          details: duplicatesInRequest.slice(0, 5).join(', ') + (duplicatesInRequest.length > 5 ? '...' : '')
        }, { status: 400 });
      }

      // Check for duplicates in Database
      const tagNumbers = body.map((p: any) => p.tagNumber);
      const serialNumbers = body.map((p: any) => p.serialNumber);

      const existingTags = await Product.find({ tagNumber: { $in: tagNumbers } }).select('tagNumber');
      const existingSerials = await Product.find({ serialNumber: { $in: serialNumbers } }).select('serialNumber');

      const dbDuplicates: string[] = [];
      if (existingTags.length > 0) {
        dbDuplicates.push(`Tags already exist: ${existingTags.map(p => p.tagNumber).join(', ')}`);
      }
      if (existingSerials.length > 0) {
        dbDuplicates.push(`Serials already exist: ${existingSerials.map(p => p.serialNumber).join(', ')}`);
      }

      if (dbDuplicates.length > 0) {
        return NextResponse.json({
          error: 'Duplicate items found in database',
          details: dbDuplicates.join('; ')
        }, { status: 409 });
      }

      // Insert products - insertMany returns array of documents
      const products = await Product.insertMany(body, {
        ordered: false // Continue inserting even if some fail
      });

      console.log('Bulk insert successful:', products.length, 'products');

      // Format response - products is already an array of documents
      const formattedProducts = products.map(doc => ({
        ...doc.toObject(),
        id: doc._id.toString(),
        _id: undefined,
        __v: undefined
      }));

      return NextResponse.json(formattedProducts, { status: 201 });
    } else {
      const product = await Product.create(body);
      const productDoc = Array.isArray(product) ? product[0] : product;

      return NextResponse.json({
        ...productDoc.toObject(),
        id: productDoc._id.toString(),
        _id: undefined,
        __v: undefined
      }, { status: 201 });
    }
  } catch (error: any) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse();
    }
    
    console.error('Failed to create product(s):', error);

    // Enhanced error details
    const errorDetails = {
      message: error.message,
      name: error.name,
      code: error.code,
      validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    };

    console.error('Error details:', errorDetails);

    return NextResponse.json({
      error: 'Failed to create product(s)',
      details: error.message || String(error),
      validation: errorDetails.validationErrors
    }, { status: 500 });
  }
}
