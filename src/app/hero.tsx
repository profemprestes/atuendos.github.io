import React from 'react';
import styles from './page.module.css';

interface HeroProps {
  temperature: number | null;
  nextDayMaxTemperature: number | null;
  nextDayMinTemperature: number | null;
  loading: boolean;
  error: string | null;
}

export default function Hero({ temperature, nextDayMaxTemperature, nextDayMinTemperature, loading, error }: HeroProps) {
  return (
    <div className={styles.heroContainer}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine}>Atuendos Perfectos</span>
            <span className={styles.heroTitleLine}>para Cada Ocasión</span>
          </h1>
          <p className={styles.heroDescription}>
            Descubre las mejores combinaciones de ropa según el clima y tu estilo personal
          </p>
          
          <div className={styles.heroTemperature}>
            {loading ? 'Cargando...' : (error ? `Error: ${error}` : (
              <>
                <div className={styles.heroTemperatureCurrent}>
                  <span className={styles.heroTemperatureValue}>{temperature}°C</span>
                </div>
                <div className={styles.heroTemperatureForecast}>
                  <span>Max {nextDayMaxTemperature}°C</span>
                  <span>Min {nextDayMinTemperature}°C</span>
                </div>
              </>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}