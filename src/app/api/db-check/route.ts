import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase'

export async function GET() {
    const {data,error} = await supabase
    .from('categories')
    .select("id,name")
    .order ("name");
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }else {
        return NextResponse.json(data);
    }
}