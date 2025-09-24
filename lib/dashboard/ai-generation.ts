import { z } from "zod";

// For soal generation
const soalItemSchema = z.object({
  pertanyaan: z.string().min(1, "Question is required"),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  explanation: z.string().optional(),
  opsis: z.array(z.object({
    opsiText: z.string().min(1, "Option text is required"),
    isCorrect: z.boolean()
  })).min(3).max(5)
});

const soalItemsSchema = z.array(soalItemSchema).min(1).max(1);

// For vocabulary generation
const vocabularyItemSchema = z.object({
  korean: z.string().min(1, "Korean text is required"),
  indonesian: z.string().min(1, "Indonesian translation is required"),
  type: z.enum(["WORD", "SENTENCE", "IDIOM"]),
  korean_example_sentence: z.string().min(1, "Korean example sentence is required"),
  indonesian_example_sentence: z.string().min(1, "Indonesian example sentence is required")
});

const vocabularyItemsSchema = z.array(vocabularyItemSchema).min(1).max(10);

export async function generateItems<T>(
  prompt: string,
  type: 'soal' | 'vocabulary',
  existingItems: any[],
  schema: z.ZodSchema<T[]>,
  transformFn: (item: T) => any
): Promise<any[]> {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        type,
        existingItems,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const generatedData = await response.json();

    try {
      const validatedItems = schema.parse(generatedData);
      return validatedItems.map(transformFn);
    } catch (validationError) {
      console.error('Generated data validation failed:', validationError);
      // Fallback to old parsing method if validation fails
      const generated: any[] = Array.isArray(generatedData) ? generatedData : [];
      return generated.map((item) => {
        try {
          return transformFn(item);
        } catch {
          return null;
        }
      }).filter(Boolean);
    }
  } catch (error) {
    console.error('Error generating items:', error);
    throw error;
  }
}

export { soalItemSchema, soalItemsSchema, vocabularyItemSchema, vocabularyItemsSchema };