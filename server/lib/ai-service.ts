import * as openaiService from './openai';
import * as mistralService from './mistral';

// Determine which service to use based on available API keys
const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
const hasGroqKey = !!process.env.GROQ_API_KEY;

// Function to select the best available service
function selectService() {
  if (hasGroqKey) {
    return 'mistral';
  // TODO - Reimplement OpenAI support
  // } else if (hasOpenAIKey) {
  //   return 'openai';
  } else {
    console.warn("No API keys found for OpenAI or Groq. Using OpenAI as default but it may fail.");
    return 'openai';
  }
}

// Default to using OpenAI, fallback to Mistral if needed
export async function analyzePRDiff(diff: string) {
  const primaryService = selectService();

  try {
    if (primaryService === 'openai') {
      return await openaiService.analyzePRDiff(diff);
    } else {
      return await mistralService.analyzePRDiff(diff);
    }
  } catch (error) {
    console.log(`${primaryService} API error, attempting fallback:`, error);

    // Try the other service as fallback
    if (primaryService === 'openai' && hasGroqKey) {
      return await mistralService.analyzePRDiff(diff);
    } else if (primaryService === 'mistral' && hasOpenAIKey) {
      return await openaiService.analyzePRDiff(diff);
    } else {
      throw new Error("Both primary and fallback APIs failed");
    }
  }
}

export function generatePRComment(analysis: any) {
  // Either service can generate comments since the structure is the same
  const service = selectService();
  if (service === 'openai') {
    return openaiService.generatePRComment(analysis);
  } else {
    return mistralService.generatePRComment(analysis);
  }
}

export async function getChatResponse(message: string) {
  const primaryService = selectService();

  try {
    if (primaryService === 'openai') {
      const response = await openaiService.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful code assistant. Provide clear, concise, and accurate responses about code, development practices, and technical concepts. When appropriate, include code examples."
          },
          {
            role: "user",
            content: message
          }
        ]
      });

      const reply = response.choices[0].message.content;
      if (!reply) {
        throw new Error("No response from OpenAI");
      }

      return reply;
    } else {
      return await mistralService.getChatResponse(message);
    }
  } catch (error) {
    console.log(`${primaryService} API error, attempting fallback:`, error);

    // Try the other service as fallback
    if (primaryService === 'openai' && hasGroqKey) {
      return await mistralService.getChatResponse(message);
    } else if (primaryService === 'mistral' && hasOpenAIKey) {
      const response = await openaiService.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful code assistant. Provide clear, concise, and accurate responses about code, development practices, and technical concepts. When appropriate, include code examples."
          },
          {
            role: "user",
            content: message
          }
        ]
      });

      const reply = response.choices[0].message.content;
      if (!reply) {
        throw new Error("No response from OpenAI");
      }

      return reply;
    } else {
      throw new Error("Both primary and fallback APIs failed");
    }
  }
}