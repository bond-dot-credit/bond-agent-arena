import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, agentName, website } = body;

    // Validate input
    if (!name || !agentName || !website) {
      return NextResponse.json(
        { error: 'Name, agent name, and website are required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(website);
    } catch {
      return NextResponse.json(
        { error: 'Invalid website URL' },
        { status: 400 }
      );
    }

    // Insert into agent_submissions table
    const { data, error } = await supabase
      .from('agent_submissions')
      .insert([{
        name,
        agent_name: agentName,
        website,
        status: 'pending'
      }])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Agent submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit agent' },
      { status: 500 }
    );
  }
}
