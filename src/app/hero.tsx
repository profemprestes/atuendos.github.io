import React from 'react';
import styles from './page.module.css';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>Atuendos Perfectos para Cada Ocasión</h1>
        <p className={styles.heroDescription}>
          Descubre las mejores combinaciones de ropa según el clima y tu estilo personal
        </p>
      </div>
    </section>
  );
}