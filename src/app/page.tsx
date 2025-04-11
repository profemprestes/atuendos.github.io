'use client';

import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Slider} from '@/components/ui/slider';
import {Button} from '@/components/ui/button';
import {generateOutfitWithData} from '@/ai/flows/generate-outfit-with-data';
import prendas from '@/components/data/prendas.json';

const styles = [
  {name: 'Casual', icon: '👕'},
  {name: 'Formal', icon: '👔'},
  {name: 'Sporty', icon: '👟'},
  {name: 'Bohemian', icon: '🥻'},
  {name: 'Vintage', icon: '🎩'},
];

const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-34.9033&longitude=-56.1882&current=temperature_2m&timezone=auto';

export default function Home() {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('Casual');
  const [outfit, setOutfit] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemperature = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTemperature(data.current.temperature_2m);
      } catch (e: any) {
        setError(`Error al obtener la temperatura: ${e.message}`);
        console.error("Error fetching temperature:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTemperature();
  }, []);

  useEffect(() => {
    if (temperature !== null) {
      generateOutfit();
    }
  }, [temperature, selectedStyle]);

  const generateOutfit = async () => {
    if (temperature === null) {
      return;
    }

    try {
      const outfitData = await generateOutfitWithData({
        temperatureCelsius: temperature,
        style: selectedStyle,
      });

      if (outfitData) {
        try {
          const parsedOutfit = JSON.parse(outfitData.outfitSuggestion);
          setOutfit(parsedOutfit);
          setExplanation(outfitData.justification);
        } catch (parseError: any) {
          console.error('Error al analizar la sugerencia de atuendo:', parseError);
          setError(`Error al analizar la sugerencia de atuendo: ${parseError.message}`);
          setOutfit([]);
          setExplanation('');
        }
      } else {
        setOutfit([]);
        setExplanation('No hay sugerencia de atuendo disponible.');
      }
    } catch (err: any) {
      console.error('Error al generar el atuendo con datos:', err);
      setError(`Error al generar el atuendo: ${err.message}`);
      setOutfit([]);
      setExplanation('');
    }
  };

  return (
    <div className="container mx-auto p-4 grid gap-4 grid-cols-1 md:grid-cols-2">
      {/* Temperature Display */}
      <Card>
        <CardHeader>
          <CardTitle>Temperatura Actual</CardTitle>
          <CardDescription>
            {loading ? 'Cargando...' : (error ? `Error: ${error}` : `La temperatura actual es ${temperature}°C`)}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Temperature Input */}
      <Card>
        <CardHeader>
          <CardTitle>Temperatura Preferida</CardTitle>
          <CardDescription>Ajusta la temperatura para ver sugerencias de atuendos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Slider
              defaultValue={[20]}
              min={0}
              max={35}
              step={1}
              onValueChange={(value) => setTemperature(value[0])}
              disabled={loading || error !== null}
            />
            <span>{temperature !== null ? temperature : '--'}°C</span>
          </div>
        </CardContent>
      </Card>

      {/* Style Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Estilo</CardTitle>
          <CardDescription>Escoge tu estilo preferido.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-3">
          {styles.map((style) => (
            <Button
              key={style.name}
              variant={selectedStyle === style.name ? 'primary' : 'secondary'}
              onClick={() => setSelectedStyle(style.name)}
            >
              {style.icon} {style.name}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Outfit Suggestion Display */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Sugerencia de Atuendo</CardTitle>
          <CardDescription>Aquí hay una sugerencia de atuendo basada en tus preferencias.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {outfit && outfit.map((item: any, index: number) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={item.imagen_url || 'https://picsum.photos/100/100'} // Placeholder image
                alt={item.nombre}
                className="rounded-md shadow-md w-32 h-32 object-cover"
              />
              <p className="text-sm mt-2">{item.nombre}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Outfit Explanation */}
      {explanation && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Explicación</CardTitle>
            <CardDescription>Por qué este atuendo es adecuado.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{explanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
