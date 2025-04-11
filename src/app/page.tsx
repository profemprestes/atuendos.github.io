'use client';

import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Slider} from '@/components/ui/slider';
import {Button} from '@/components/ui/button';
import {generateOutfitWithData} from '@/ai/flows/generate-outfit-with-data';
import {useToast} from "@/hooks/use-toast";
import {cn} from "@/lib/utils";
import {explainOutfitChoice} from "@/ai/flows/explain-outfit-choice";
import styles from './page.module.css';

const stylesArr = [
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
    <div className={cn("fade-in container mx-auto p-4 grid gap-4 grid-cols-1 md:grid-cols-2", styles.container)}>
      {/* Temperature Display */}
      <Card className={cn("shadow-md fade-in", styles.card, styles.temperatureDisplayCard)}>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>Temperatura Actual y Pronóstico</CardTitle>
          <CardDescription className={styles.cardDescription}>
            {loading ? 'Cargando...' : (error ? `Error: ${error}` : (
              <>
                La temperatura actual es <span className={styles.temperature}>{temperature}°C</span>.
                <br />
                Pronóstico para mañana: Max <span className={styles.temperature}>{nextDayMaxTemperature}°C</span>, Min <span className={styles.temperature}>{nextDayMinTemperature}°C</span>
              </>
            ))}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Temperature Input */}
      <Card className={cn("shadow-md fade-in", styles.card, styles.temperatureInputCard)}>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>Temperatura Preferida</CardTitle>
          <CardDescription className={styles.cardDescription}>Ajusta la temperatura para ver sugerencias de atuendos.</CardDescription>
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
            <span className={styles.temperatureValue}>{temperature !== null ? temperature : '--'}°C</span>
          </div>
        </CardContent>
      </Card>

      {/* Style Selection */}
      <Card className={cn("shadow-md fade-in", styles.card)}>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>Estilo</CardTitle>
          <CardDescription className={styles.cardDescription}>Escoge tu estilo preferido.</CardDescription>
        </CardHeader>
        <CardContent className={cn("grid gap-4 grid-cols-3", styles.styleButtons)}>
          {stylesArr.map((style) => (
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
      <Card className={cn("md:col-span-2 shadow-md fade-in", styles.card)}>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>Sugerencia de Atuendo</CardTitle>
          <CardDescription className={styles.cardDescription}>Aquí hay una sugerencia de atuendo basada en tus preferencias.</CardDescription>
        </CardHeader>
        <CardContent className={cn("grid gap-4 grid-cols-1 md:grid-cols-3", styles.outfitGrid)}>
          {outfit && Array.isArray(outfit) && outfit.map((item: any, index: number) => (
            <div key={index} className={cn("flex flex-col items-center", styles.outfitItem)}>
              <img
                src={item.imagen_url || 'https://picsum.photos/100/100'} // Placeholder image
                alt={item.nombre}
                className={cn("rounded-md shadow-md w-32 h-32 object-cover", styles.outfitImage)}
              />
              <div className="text-xs text-gray-500 mt-1">
                <div>Categoría: {item.categoria}</div>
                <div>Color: {item.color}</div>
                <div>Material: {item.material}</div>
                <div>Descripción: {item.descripcion_adicional}</div>
              </div>
              <p className={cn("text-sm mt-2", styles.outfitName)}>{item.nombre}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Outfit Suggestion for Tomorrow Display */}
      <Card className={cn("md:col-span-2 shadow-md fade-in", styles.card)}>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>Sugerencia de Atuendo para Mañana</CardTitle>
          <CardDescription className={styles.cardDescription}>Aquí hay una sugerencia de atuendo basada en el pronóstico para mañana.</CardDescription>
        </CardHeader>
        <CardContent className={cn("grid gap-4 grid-cols-1 md:grid-cols-3", styles.outfitGrid)}>
          {tomorrowOutfit && Array.isArray(tomorrowOutfit) && tomorrowOutfit.map((item: any, index: number) => (
            <div key={index} className={cn("flex flex-col items-center", styles.outfitItem)}>
              <img
                src={item.imagen_url || 'https://picsum.photos/100/100'} // Placeholder image
                alt={item.nombre}
                className={cn("rounded-md shadow-md w-32 h-32 object-cover", styles.outfitImage)}
              />
              <div className="text-xs text-gray-500 mt-1">
                <div>Categoría: {item.categoria}</div>
                <div>Color: {item.color}</div>
                <div>Material: {item.material}</div>
                <div>Descripción: {item.descripcion_adicional}</div>
              </div>
              <p className={cn("text-sm mt-2", styles.outfitName)}>{item.nombre}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Outfit Explanation */}
      {explanation && (
        <Card className={cn("md:col-span-2 shadow-md fade-in", styles.card)}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Explicación</CardTitle>
            <CardDescription className={styles.cardDescription}>Por qué este atuendo es adecuado.</CardDescription>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <p className={styles.explanation}>{explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Tomorrow Outfit Explanation */}
      {tomorrowExplanation && (
        <Card className={cn("md:col-span-2 shadow-md fade-in", styles.card)}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Explicación para el Atuendo de Mañana</CardTitle>
            <CardDescription className={styles.cardDescription}>Por qué este atuendo es adecuado para el pronóstico de mañana.</CardDescription>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            <p className={styles.explanation}>{tomorrowExplanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
