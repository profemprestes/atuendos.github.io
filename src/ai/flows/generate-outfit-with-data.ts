'use server';

/**
 * @fileOverview Generates outfit suggestions using data from prendas.json.
 *
 * - generateOutfitWithData - A function that generates an outfit suggestion.
 * - GenerateOutfitWithDataInput - The input type for the generateOutfitWithData function.
 * - GenerateOutfitWithDataOutput - The return type for the generateOutfitWithData function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';
import prendas from '@/components/data/prendas.json';

const GenerateOutfitWithDataInputSchema = z.object({
  temperatureCelsius: z.number().describe('The temperature in Celsius.'),
  style: z.string().describe('The selected style (e.g., casual, formal).'),
});
export type GenerateOutfitWithDataInput = z.infer<typeof GenerateOutfitWithDataInputSchema>;

const GenerateOutfitWithDataOutputSchema = z.object({
  outfitSuggestion: z.array(z.object({
    nombre: z.string(),
    imagen_url: z.string(),
  })).describe('The outfit suggestion, an array of items with name and image URL.'),
  justification: z.string().describe('The justification for the outfit suggestion.'),
});
export type GenerateOutfitWithDataOutput = z.infer<typeof GenerateOutfitWithDataOutputSchema>;

export async function generateOutfitWithData(input: GenerateOutfitWithDataInput): Promise<GenerateOutfitWithDataOutput> {
  return generateOutfitWithDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOutfitWithDataPrompt',
  input: {
    schema: z.object({
      temperatureCelsius: z.number().describe('The temperature in Celsius.'),
      style: z.string().describe('The selected style (e.g., casual, formal).'),
      clothingItems: z.array(z.object({
        id: z.string(),
        nombre: z.string(),
        categoria: z.string(),
        material: z.string(),
        color: z.string(),
        talla: z.string(),
        estilos: z.array(z.string()),
        temperatura_adecuada: z.array(z.string()),
        imagen_url: z.string(),
        descripcion_adicional: z.string(),
      })).describe('An array of clothing items from prendas.json.'),
    }),
  },
  output: {
    schema: z.object({
      outfitSuggestion: z.array(z.object({
        nombre: z.string(),
        imagen_url: z.string(),
      })).describe('The outfit suggestion, an array of items with name and image URL.'),
      justification: z.string().describe('The justification for the outfit suggestion.'),
    }),
  },
  prompt: `Eres un estilista personal.
  La temperatura es {{temperatureCelsius}} grados Celsius.
  El estilo seleccionado es {{style}}.
  Tienes las siguientes prendas disponibles:
  {{#each clothingItems}}
  - {{nombre}} (categoría: {{categoria}}, estilos: {{estilos}})
  {{/each}}
  Genera una sugerencia de atuendo adecuada para la temperatura y el estilo, utilizando solo las prendas proporcionadas.
  Proporciona una justificación para la sugerencia de atuendo, teniendo en cuenta las tendencias de la moda y los principios de estilo.
  Responde en formato JSON con las claves "outfitSuggestion" (un array de objetos con nombre e imagen_url) y "justification".`,
});

const generateOutfitWithDataFlow = ai.defineFlow<
  typeof GenerateOutfitWithDataInputSchema,
  typeof GenerateOutfitWithDataOutputSchema
>({
  name: 'generateOutfitWithDataFlow',
  inputSchema: GenerateOutfitWithDataInputSchema,
  outputSchema: GenerateOutfitWithDataOutputSchema,
}, async input => {
  // Filter clothing items based on temperature and style
  const filteredClothingItems = prendas.filter(item => {
    const tempMatch = item.temperatura_adecuada.some(temp => {
      if (input.temperatureCelsius <= 10) {
        return temp.toLowerCase().includes('frío') || temp.toLowerCase().includes('muy frío');
      } else if (input.temperatureCelsius <= 25) {
        return temp.toLowerCase().includes('templado');
      } else {
        return temp.toLowerCase().includes('calor');
      }
    });
    const styleMatch = item.estilos.includes(input.style);
    return tempMatch && styleMatch;
  });

  const {output} = await prompt({
    temperatureCelsius: input.temperatureCelsius,
    style: input.style,
    clothingItems: filteredClothingItems,
  });
  return output!;
});
