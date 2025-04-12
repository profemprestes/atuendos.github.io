"use client";

import { useEffect } from 'react';
import { gsap } from 'gsap';

export function Scripts() {
  useEffect(() => {
    // Initialize GSAP if needed
    gsap.registerPlugin();
  }, []);

  return null;
}