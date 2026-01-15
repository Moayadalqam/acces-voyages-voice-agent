import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/app/lib/supabase';

// VAPI webhook handler for lead capture
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // VAPI sends the tool call result in message.toolCalls or directly
    // Handle different VAPI payload formats
    let leadData = body;

    // If VAPI sends nested structure
    if (body.message?.toolCalls) {
      const toolCall = body.message.toolCalls.find(
        (tc: { function?: { name: string } }) => tc.function?.name === 'capture_lead'
      );
      if (toolCall?.function?.arguments) {
        leadData = typeof toolCall.function.arguments === 'string'
          ? JSON.parse(toolCall.function.arguments)
          : toolCall.function.arguments;
      }
    }

    // Insert lead into Supabase
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('leads')
      .insert({
        caller_name: leadData.caller_name || 'Unknown',
        phone_number: leadData.phone_number || 'Unknown',
        email: leadData.email || null,
        travel_dates: leadData.travel_dates || null,
        destination: leadData.destination || 'Not specified',
        trip_type: leadData.trip_type || 'other',
        budget_range: leadData.budget_range || null,
        party_size: leadData.party_size || null,
        language: leadData.language || null,
        notes: leadData.notes || null,
        callback_time: leadData.callback_time || null,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Return success response for VAPI
    return NextResponse.json({
      success: true,
      message: `Lead captured successfully for ${leadData.caller_name}`,
      lead_id: data.id
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Lead capture webhook is active'
  });
}
