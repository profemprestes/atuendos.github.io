'use client';

import React, {useState, useEffect, useContext} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Slider} from '@/components/ui/slider';
import {Button} from '@/components/ui/button';
import {generateOutfitWithData} from '@/ai/flows/generate-outfit-with-data';
import {useToast} from "@/hooks/use-toast";
import {cn} from "@/lib/utils";
import pageStyles from './page.module.css';
import { metadata } from './head';
import Hero from './hero';

// First, add this import at the top with other imports
import { Icons } from '@/components/icons';

const stylesArr = [
  {name: 'Trabajo', icon: 'workflow'},
  {name: 'Trabajo Formal', icon: 'user'},
  {name: 'Casa', icon: 'home'},
  {name: 'Casa Formal', icon: 'shield'},
  {name: 'Deporte', icon: 'share'},
  {name: 'Salidas', icon: 'messageSquare'},
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

  const handleApiError = (err: any) => {
    if (err.message.includes('429 Too Many Requests')) {
      return 'El servicio está ocupado. Por favor intente nuevamente en un momento.';
    }
    return `Error: ${err.message}`;
  };

  const generateOutfit = async () => {
    if (temperature === null) return;

    try {
      const outfitData = await generateOutfitWithData({
        temperatureCelsius: temperature,
        style: selectedStyle,
      });

      if (outfitData) {
        setOutfit(outfitData.outfitSuggestion);
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
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      setOutfit([]);
      setExplanation('');
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const generateTomorrowOutfit = async () => {
    if (nextDayMaxTemperature === null || nextDayMinTemperature === null) return;

    // Use the average temperature for tomorrow's outfit suggestion
    const avgTomorrowTemperature = (nextDayMaxTemperature + nextDayMinTemperature) / 2;

    try {
      const outfitData = await generateOutfitWithData({
        temperatureCelsius: avgTomorrowTemperature,
        style: selectedStyle,
      });

      if (outfitData) {
        setTomorrowOutfit(outfitData.outfitSuggestion);
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
      const errorMessage = handleApiError(err);
      setError(errorMessage);
      setTomorrowOutfit([]);
      setTomorrowExplanation('');
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  // Document title effect - moved inside the component
  useEffect(() => {
    if (temperature !== null) {
      document.title = `Atuendos para ${temperature}°C | ${metadata.title?.toString() || 'Atuendos'}`;
    } else {
      document.title = metadata.title?.toString() || 'Atuendos';
    }
  }, [temperature]);

  return (
<main>
      {/* Updated Hero component with temperature props */}
      <Hero 
        temperature={temperature}
        nextDayMaxTemperature={nextDayMaxTemperature}
        nextDayMinTemperature={nextDayMinTemperature}
        loading={loading}
        error={error}
      />
      
      {/* Combined Temperature Input and Style Selection */}
      <div className={pageStyles.inputsRow}>
        {/* Temperature Input */}
        <Card className={pageStyles.temperatureInputCard}>
          <CardHeader className={pageStyles.temperatureInputHeader}>
            <CardTitle className={pageStyles.temperatureInputTitle}>Temperatura Preferida</CardTitle>
            <CardDescription className={pageStyles.temperatureInputDescription}>Ajusta la temperatura para ver sugerencias de atuendos.</CardDescription>
          </CardHeader>
          <CardContent className={pageStyles.temperatureSliderContainer}>
            <div className={pageStyles.sliderWrapper}>
              <Slider
                value={[temperature !== null ? temperature : 20]}
                min={0}
                max={35}
                step={1}
                onValueChange={(value) => setTemperature(value[0])}
                disabled={loading || error !== null}
                className={pageStyles.temperatureSlider}
              />
            </div>
            <div className={pageStyles.temperatureDisplayContainer}>
              <span 
                className={pageStyles.temperatureDisplay}
                data-temp-range={
                  temperature !== null ? 
                    (temperature <= 10 ? 'frio' : 
                     temperature <= 25 ? 'templado' : 'calor') 
                    : ''
                }
              >
                {temperature !== null ? temperature : '--'}°C
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Style Selection */}
        <Card className={pageStyles.styleSelectionCard}>
          <CardHeader className={pageStyles.styleSelectionHeader}>
            <CardTitle className={pageStyles.styleSelectionTitle}>Estilo</CardTitle>
            <CardDescription className={pageStyles.styleSelectionDescription}>Escoge tu estilo preferido.</CardDescription>
          </CardHeader>
          <CardContent className={pageStyles.styleButtonsContainer}>
            {stylesArr.map((style) => {
              const IconComponent = Icons[style.icon.toLowerCase().replace(' ', '')] || Icons.workflow;
              return (
                <Button
                  key={style.name}
                  className={cn(
                    "flex-col h-auto py-3",
                    pageStyles.styleButton,
                    selectedStyle === style.name && pageStyles.styleButtonActive
                  )}
                  variant={selectedStyle === style.name ? "default" : "outline"}
                  onClick={() => setSelectedStyle(style.name)}
                >
                  <IconComponent className="w-5 h-5 mb-1" />
                  <span className={pageStyles.styleButtonText}>{style.name}</span>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className={pageStyles.outfitsContainer}>
        {/* Outfit Suggestion Display */}
        <Card className={pageStyles.outfitSuggestionCard}>
          <CardHeader className={pageStyles.outfitCardHeader}>
            <CardTitle className={pageStyles.outfitCardTitle}>Sugerencia de Atuendo</CardTitle>
            <CardDescription className={pageStyles.outfitCardDescription}>Aquí hay una sugerencia de atuendo basada en tus preferencias.</CardDescription>
          </CardHeader>
          <CardContent className={pageStyles.outfitGrid}>
            {outfit && Array.isArray(outfit) && outfit.map((item: any, index: number) => (
              <div key={index} className={pageStyles.outfitItem}>
                <div className={pageStyles.outfitImageContainer}>
                  <img
                    src={item.imagen_url || 'https://picsum.photos/100/100'}
                    alt={item.nombre}
                    className={pageStyles.outfitImage}
                    loading="lazy"
                  />
                </div>
                <div className={pageStyles.outfitDetails}>
                  <div><strong>Categoría:</strong> {item.categoria}</div>
                  <div><strong>Color:</strong> {item.color}</div>
                  <div><strong>Material:</strong> {item.material}</div>
                  <div><strong>Descripción:</strong> {item.descripcion_adicional}</div>
                </div>
                <p className={pageStyles.outfitName}>{item.nombre}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Outfit Suggestion for Tomorrow Display */}
        <Card className={pageStyles.outfitSuggestionCard}>
          <CardHeader className={pageStyles.outfitCardHeader}>
            <CardTitle className={pageStyles.outfitCardTitle}>Sugerencia de Atuendo para Mañana</CardTitle>
            <CardDescription className={pageStyles.outfitCardDescription}>Aquí hay una sugerencia de atuendo basada en el pronóstico para mañana.</CardDescription>
          </CardHeader>
          <CardContent className={pageStyles.outfitGrid}>
            {tomorrowOutfit && Array.isArray(tomorrowOutfit) && tomorrowOutfit.map((item: any, index: number) => (
              <div key={index} className={pageStyles.outfitItem}>
                <div className={pageStyles.outfitImageContainer}>
                  <img
                    src={item.imagen_url || 'https://picsum.photos/100/100'}
                    alt={item.nombre}
                    className={pageStyles.outfitImage}
                    loading="lazy"
                  />
                </div>
                <div className={pageStyles.outfitDetails}>
                  <div><strong>Categoría:</strong> {item.categoria}</div>
                  <div><strong>Color:</strong> {item.color}</div>
                  <div><strong>Material:</strong> {item.material}</div>
                  <div><strong>Descripción:</strong> {item.descripcion_adicional}</div>
                </div>
                <p className={pageStyles.outfitName}>{item.nombre}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Explanations Container */}
            <div className={pageStyles.explanationsContainer}>
              {/* Outfit Explanation */}
              {explanation && (
                <Card className={pageStyles.explanationCard}>
                  <CardHeader className={pageStyles.explanationHeader}>
                    <CardTitle className={pageStyles.explanationTitle}>Explicación</CardTitle>
                    <CardDescription className={pageStyles.explanationDescription}>Por qué este atuendo es adecuado.</CardDescription>
                  </CardHeader>
                  <CardContent className={pageStyles.explanationContent}>
                    <p className={pageStyles.explanationText}>{explanation}</p>
                  </CardContent>
                </Card>
              )}

              {/* Tomorrow Outfit Explanation */}
              {tomorrowExplanation && (
                <Card className={pageStyles.explanationCard}>
                  <CardHeader className={pageStyles.explanationHeader}>
                    <CardTitle className={pageStyles.explanationTitle}>Explicación para Mañana</CardTitle>
                    <CardDescription className={pageStyles.explanationDescription}>Por qué este atuendo es adecuado para mañana.</CardDescription>
                  </CardHeader>
                  <CardContent className={pageStyles.explanationContent}>
                    <p className={pageStyles.explanationText}>{tomorrowExplanation}</p>
                  </CardContent>
                </Card>
              )}
            </div>
            </main>
  );
}