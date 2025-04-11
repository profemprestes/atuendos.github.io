'use server';

/**
 * @fileOverview Explains why a given outfit is suitable for the weather and style.
 *
 * - explainOutfitChoice - A function that explains the outfit choice.
 * - ExplainOutfitChoiceInput - The input type for the explainOutfitChoice function.
 * - ExplainOutfitChoiceOutput - The return type for the explainOutfitChoice function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ExplainOutfitChoiceInputSchema = z.object({
  temperatureCelsius: z.number().describe('The temperature in Celsius.'),
  style: z.string().describe('The selected style (e.g., casual, formal).'),
  outfit: z.array(z.string()).describe('The outfit items.'),
  userCloset: z.string().optional().describe('A description of the user closet.'),
});
export type ExplainOutfitChoiceInput = z.infer<typeof ExplainOutfitChoiceInputSchema>;

const ExplainOutfitChoiceOutputSchema = z.object({
  explanation: z.string().describe('The explanation of why the outfit is suitable.'),
});
export type ExplainOutfitChoiceOutput = z.infer<typeof ExplainOutfitChoiceOutputSchema>;

export async function explainOutfitChoice(input: ExplainOutfitChoiceInput): Promise<ExplainOutfitChoiceOutput> {
  return explainOutfitChoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainOutfitChoicePrompt',
  input: {
    schema: z.object({
      temperatureCelsius: z.number().describe('The temperature in Celsius.'),
      style: z.string().describe('The selected style (e.g., casual, formal).'),
      outfit: z.array(z.string()).describe('The outfit items.'),
      userCloset: z.string().optional().describe('A description of the user closet.  If the closet description is empty, then do not refer to user closet in explanation.'),
    }),
  },
  output: {
    schema: z.object({
      explanation: z.string().describe('The explanation of why the outfit is suitable.'),
    }),
  },
  prompt: `Eres un estilista personal explicando por qué un atuendo es adecuado para el clima y el estilo seleccionado.

  La temperatura es {{temperatureCelsius}} grados Celsius.
  El estilo seleccionado es {{style}}.
  El atuendo consiste en los siguientes elementos: {{#each outfit}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

  {{#if userCloset}}
  Considera que el armario del usuario contiene los siguientes elementos: {{{userCloset}}}.
  {{/if}}

  Explica por qué este atuendo es adecuado para el clima y el estilo.  Ten en cuenta las tendencias de la moda actuales y los principios generales de estilo.`, // Ensure this is a single backtick
});

const explainOutfitChoiceFlow = ai.defineFlow<
  typeof ExplainOutfitChoiceInputSchema,
  typeof ExplainOutfitChoiceOutputSchema
>({
  name: 'explainOutfitChoiceFlow',
  inputSchema: ExplainOutfitChoiceInputSchema,
  outputSchema: ExplainOutfitChoiceOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});

