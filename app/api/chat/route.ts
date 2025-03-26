import { NextRequest, NextResponse } from 'next/server';
import { VoyentraAI } from '@/app/services/ai/voyentra-ai';

// Create a singleton instance
let voyentraAI: VoyentraAI | null = null;

export async function POST(req: NextRequest) {
  try {
    // Check if API key is present
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('Missing Gemini API key in environment variables');
      return NextResponse.json(
        { 
          response: "I'm sorry, I'm not able to access my travel database at the moment. Please check back later." 
        },
        { status: 200 }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { 
          response: "I didn't catch that. Could you please ask a travel question?" 
        },
        { status: 200 }
      );
    }

    // Initialize the AI instance if it doesn't exist
    if (!voyentraAI) {
      try {
        console.log('Initializing VoyentraAI instance...');
        voyentraAI = new VoyentraAI();
        console.log('VoyentraAI instance created successfully');
      } catch (initError) {
        console.error('Failed to initialize VoyentraAI:', initError);
        return NextResponse.json(
          { 
            response: "I'm having trouble connecting to my travel knowledge database. Please try again in a moment." 
          },
          { status: 200 }
        );
      }
    }

    console.log('Sending message to AI:', message);
    const response = await voyentraAI.sendMessage(message);
    console.log('AI response received');
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { 
        response: "I apologize for the inconvenience. I'm experiencing some technical difficulties accessing my travel information. Could you please try again with a different question?" 
      },
      { status: 200 }
    );
  }
} 