'use client';

import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Slider} from '@/components/ui/slider';
import {Button} from '@/components/ui/button';

const styles = [
  {name: 'Casual', icon: '👕'},
  {name: 'Formal', icon: '👔'},
  {name: 'Sporty', icon: '👟'},
  {name: 'Bohemian', icon: '🥻'},
  {name: 'Vintage', icon: '🎩'},
];

const prendas = [
  {
    "name": "T-shirt",
    "category": "Top",
    "imageUrl": "https://picsum.photos/100/100",
    "styles": ["Casual", "Sporty"],
    "temperature": [15, 30]
  },
  {
    "name": "Button-down Shirt",
    "category": "Top",
    "imageUrl": "https://picsum.photos/100/100",
    "styles": ["Formal", "Casual"],
    "temperature": [18, 30]
  },
  {
    "name": "Sweater",
    "category": "Top",
    "imageUrl": "https://picsum.photos/100/100",
    "styles": ["Casual", "Vintage"],
    "temperature": [5, 18]
  },
  {
    "name": "Jeans",
    "category": "Bottom",
    "imageUrl": "https://picsum.photos/100/100",
    "styles": ["Casual", "Vintage"],
    "temperature": [5, 30]
  },
  {
    "name": "Dress Pants",
    "category": "Bottom",
    "imageUrl": "https://picsum.photos/100/100",
    "styles": ["Formal"],
    "temperature": [18, 30]
  },
  {
    "name": "Shorts",
    "category": "Bottom",
    "imageUrl": "https://picsum.photos/100/100",
    "styles": ["Casual", "Sporty"],
    "temperature": [20, 35]
  },
  {
    "name": "Sneakers",
    "category": "Shoes",
    "imageUrl": "https://picsum.photos/100/100",
    "styles": ["Casual", "Sporty"],
    "temperature": [5, 35]
  },
  {
    "name": "Dress Shoes",
    "category": "Shoes",
    "imageUrl": "https://picsum.photos/100/100",
    "styles": ["Formal"],
    "temperature": [18, 30]
  },
  {
    "name": "Sandals",
    "category": "Shoes",
    "imageUrl": "https://picsum.photos/100/100",
    "styles": ["Casual"],
    "temperature": [25, 35]
  }
];

const API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-34.9033&longitude=-56.1882&current=temperature_2m&timezone=auto';

export default function Home() {
  const [temperature, setTemperature] = useState<number | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('Casual');
  const [outfit, setOutfit] = useState<any[]>([]);
  const [explanation, setExplanation] = useState('');
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
        setError(`Failed to fetch temperature: ${e.message}`);
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

    // Filter prendas based on temperature and style
    const filteredPrendas = prendas.filter(
      (prenda) =>
        prenda.styles.includes(selectedStyle) &&
        prenda.temperature[0] <= temperature &&
        prenda.temperature[1] >= temperature
    );

    // Group prendas by category
    const groupedPrendas = filteredPrendas.reduce((acc: any, prenda: any) => {
      if (!acc[prenda.category]) {
        acc[prenda.category] = [];
      }
      acc[prenda.category].push(prenda);
      return acc;
    }, {});

    // Select one prenda from each category
    const newOutfit = Object.values(groupedPrendas).map((category: any) => {
      const randomIndex = Math.floor(Math.random() * category.length);
      return category[randomIndex];
    });

    setOutfit(newOutfit);
    //TODO
    // setExplanation(await explainOutfitChoice());
  };

  return (
    <div className="container mx-auto p-4 grid gap-4 grid-cols-1 md:grid-cols-2">
      {/* Temperature Display */}
      <Card>
        <CardHeader>
          <CardTitle>Current Temperature</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : (error ? `Error: ${error}` : `The current temperature is ${temperature}°C`)}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Temperature Input */}
      <Card>
        <CardHeader>
          <CardTitle>Preferred Temperature</CardTitle>
          <CardDescription>Adjust the temperature to see outfit suggestions.</CardDescription>
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
          <CardTitle>Style</CardTitle>
          <CardDescription>Choose your preferred style.</CardDescription>
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
          <CardTitle>Outfit Suggestion</CardTitle>
          <CardDescription>Here's an outfit suggestion based on your preferences.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {outfit.map((item, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={item.imageUrl || 'https://picsum.photos/100/100'} // Placeholder image
                alt={item.name}
                className="rounded-md shadow-md w-32 h-32 object-cover"
              />
              <p className="text-sm mt-2">{item.name}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Outfit Explanation */}
      {explanation && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Explanation</CardTitle>
            <CardDescription>Why this outfit is suitable.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{explanation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

