export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      name,
      skills,
      yearsOfExperience,
      seniority,
    } = body;

    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          fullName: name,
          skills, // array → jsonb o text[]
          yearsOfExperience: yearsOfExperience,
          seniority,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      employee: data,
    });
  } catch (error: any) {
    console.error('❌ Supabase insert error:', error);

    return NextResponse.json(
      {
        error: 'Failed to add employee',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

