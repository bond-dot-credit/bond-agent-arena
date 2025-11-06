import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, userType } = body;

    // Validate input
    if (!name || !email || !userType) {
      return NextResponse.json(
        { error: 'Name, email, and user type are required' },
        { status: 400 }
      );
    }

    // Insert into waitlist table
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{ name, email, user_type: userType }])
      .select();

    if (error) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit waitlist entry' },
      { status: 500 }
    );
  }
}
