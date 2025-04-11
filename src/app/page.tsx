'use client';

import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Slider} from '@/components/ui/slider';
import {Button} from '@/components/ui/button';
import {generateOutfitWithData} from '@/ai/flows/generate-outfit-with-data';
import {useToast} from "@/hooks/use-toast";
import {cn} from "@/lib/utils";
import {explainOutfitChoice} from "@/ai/flows/explain-outfit-choice";

const styles = [
  {name: 'Trabajo', icon: '💼'},
  {name: 'Trabajo Formal', icon: '👔'},
  {name: 'Casa', icon: '🏠'},
  {name: 'Casa Formal', icon: '🥻'},
  {name: 'Deporte', icon: '🏃'},
  {name: 'Salidas', icon: '🎭'},
];

const temperatureRanges = {
  frio: {min: -10, max: 10},
  templado: {min: 11, max: 25},
  calor: {min: 26, max: 40},
};

// Modified API_URL to fetch both current and next day temperature data
const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-34.9033&longitude=-56.1882&current=temperature_2m&daily=temperature_2m_max,temperature_2m_min&forecast_days=2&timezone=auto';

export default function Home() {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [nextDayMaxTemperature, setNextDayMaxTemperature] = useState<number | null>(null);
  const [nextDayMinTemperature, setNextDayMinTemperature] = useState<number | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('Trabajo');
  const [outfit, setOutfit] = useState<any[]>([]);
  const [tomorrowOutfit, setTomorrowOutfit] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [tomorrowExplanation, setTomorrowExplanation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {toast} = useToast();

  // useEffect to fetch temperature data
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

        if (!data.current || !data.daily || !data.daily.temperature_2m_max || !data.daily.temperature_2m_min) {
          setError("Error: API response missing expected data.");
          return;
        }

        const currentTemperature = data.current.temperature_2m;
        const nextDayMaxTemperature = data.daily.temperature_2m_max[1];
        const nextDayMinTemperature = data.daily.temperature_2m_min[1];

        setTemperature(currentTemperature);
        setNextDayMaxTemperature(nextDayMaxTemperature);
        setNextDayMinTemperature(nextDayMinTemperature);

      } catch (e: any) {
        setError(`Error al obtener la temperatura: ${e.message}`);
        console.error("Error fetching temperature:", e);
        toast({
          title: "Error",
          description: `Error al obtener la temperatura: ${e.message}`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemperature();
  }, []);

  useEffect(() => {
    if (temperature !== null) {
      generateOutfit();
      generateTomorrowOutfit();
    }
  }, [temperature, selectedStyle, nextDayMaxTemperature, nextDayMinTemperature]);

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
        setOutfit(outfitData);
        setExplanation(outfitData.justification);
      } else {
        setOutfit([]);
        setExplanation('No hay sugerencia de atuendo disponible.');
        toast({
          title: "Sin sugerencias",
          description: "No hay sugerencias de atuendo disponibles para los criterios seleccionados.",
        });
      }
    } catch (err: any) {
      console.error('Error al generar el atuendo con datos:', err);
      setError(`Error al generar el atuendo: ${err.message}`);
      setOutfit([]);
      setExplanation('');
      toast({
        title: "Error",
        description: `Error al generar el atuendo: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const generateTomorrowOutfit = async () => {
    if (nextDayMaxTemperature === null || nextDayMinTemperature === null) {
      return;
    }

    // Use the average temperature for tomorrow's outfit suggestion
    const avgTomorrowTemperature = (nextDayMaxTemperature + nextDayMinTemperature) / 2;

    try {
      const outfitData = await generateOutfitWithData({
        temperatureCelsius: avgTomorrowTemperature,
        style: selectedStyle,
      });

      if (outfitData) {
        setTomorrowOutfit(outfitData);
        setTomorrowExplanation(outfitData.justification);
      } else {
        setTomorrowOutfit([]);
        setTomorrowExplanation('No hay sugerencia de atuendo disponible para mañana.');
        toast({
          title: "Sin sugerencias para mañana",
          description: "No hay sugerencias de atuendo disponibles para los criterios seleccionados para mañana.",
        });
      }
    } catch (err: any) {
      console.error('Error al generar el atuendo para mañana con datos:', err);
      setError(`Error al generar el atuendo para mañana: ${err.message}`);
      setTomorrowOutfit([]);
      setTomorrowExplanation('');
      toast({
        title: "Error",
        description: `Error al generar el atuendo para mañana: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fade-in container mx-auto p-4 grid gap-4 grid-cols-1 md:grid-cols-2">
      {/* Temperature Display */}
      <Card className="shadow-md fade-in">
        <CardHeader>
          <CardTitle>Temperatura Actual y Pronóstico</CardTitle>
          <CardDescription>
            {loading ? 'Cargando...' : (error ? `Error: ${error}` : (
              <>
                La temperatura actual es {temperature}°C.
                <br />
                Pronóstico para mañana: Max {nextDayMaxTemperature}°C, Min {nextDayMinTemperature}°C
              </>
            ))}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Temperature Input */}
      <Card className="shadow-md fade-in">
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
      <Card className="shadow-md fade-in">
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
      <Card className="md:col-span-2 shadow-md fade-in">
        <CardHeader>
          <CardTitle>Sugerencia de Atuendo</CardTitle>
          <CardDescription>Aquí hay una sugerencia de atuendo basada en tus preferencias.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {outfit?.outfitSuggestion && Array.isArray(outfit?.outfitSuggestion) && outfit?.outfitSuggestion.map((item: any, index: number) => (
            <div key={index} className="flex flex-col items-center border p-2 rounded-lg hover:shadow-lg transition-shadow duration-300">
              <img
                src={item.imagen_url || 'https://picsum.photos/100/100'} // Placeholder image
                alt={item.nombre}
                className="rounded-md shadow-md w-32 h-32 object-cover"
              />
              <p className="text-sm mt-2">{item.nombre}</p>
              <div className="text-xs text-gray-500 mt-1">
                <div>Categoría: {item.categoria}</div>
                <div>Color: {item.color}</div>
                <div>Material: {item.material}</div>
                <div>Descripción: {item.descripcion_adicional}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Outfit Suggestion for Tomorrow Display */}
      <Card className="md:col-span-2 shadow-md fade-in">
        <CardHeader>
          <CardTitle>Sugerencia de Atuendo para Mañana</CardTitle>
          <CardDescription>Aquí hay una sugerencia de atuendo basada en el pronóstico para mañana.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {tomorrowOutfit?.outfitSuggestion && Array.isArray(tomorrowOutfit?.outfitSuggestion) && tomorrowOutfit?.outfitSuggestion.map((item: any, index: number) => (
            <div key={index} className="flex flex-col items-center border p-2 rounded-lg hover:shadow-lg transition-shadow duration-300">
              <img
                src={item.imagen_url || 'https://picsum.photos/100/100'} // Placeholder image
                alt={item.nombre}
                className="rounded-md shadow-md w-32 h-32 object-cover"
              />
              <p className="text-sm mt-2">{item.nombre}</p>
              <div className="text-xs text-gray-500 mt-1">
                <div>Categoría: {item.categoria}</div>
                <div>Color: {item.color}</div>
                <div>Material: {item.material}</div>
                <div>Descripción: {item.descripcion_adicional}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Outfit Explanation */}
      {explanation && (
        <Card className="md:col-span-2 shadow-md fade-in">
          <CardHeader>
            <CardTitle>Explicación</CardTitle>
            <CardDescription>Por qué este atuendo es adecuado.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Tomorrow Outfit Explanation */}
      {tomorrowExplanation && (
        <Card className="md:col-span-2 shadow-md fade-in">
          <CardHeader>
            <CardTitle>Explicación para el Atuendo de Mañana</CardTitle>
            <CardDescription>Por qué este atuendo es adecuado para el pronóstico de mañana.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{tomorrowExplanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
