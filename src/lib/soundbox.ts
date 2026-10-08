import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Conversión de números a texto en español para una pronunciación natural
function numberToSpanish(num: number): string {
  const integer = Math.floor(num);
  const decimals = Math.round((num - integer) * 100);

  let text = `${integer} pesos`;
  if (decimals > 0) {
    text += ` con ${decimals} centavos`;
  }
  return text;
}

/**
 * Sintetizador Web Audio para generar el sonido de caja registradora / campana de cobro exitoso
 */
export function playCashRegisterSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Frecuencias para sonido de campana brillante tipo "Ding-Ding!"
    const freqs = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  } catch (err) {
    console.warn('Audio sound error:', err);
  }
}

/**
 * Anuncia el cobro en voz alta usando el motor de Texto a Voz (TTS)
 */
export function announcePayment(amount: number, payerName?: string, rate = 1.0, pitch = 1.0): Promise<void> {
  return new Promise((resolve) => {
    // 1. Sonido de campana
    playCashRegisterSound();

    // 2. Anuncio por voz
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel(); // Detener cualquier audio previo

    const amountText = numberToSpanish(amount);
    let phrase = `¡Pago de ${amountText} recibido!`;
    if (payerName) {
      phrase = `¡Pago de ${amountText} de ${payerName} recibido!`;
    }

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.lang = 'es-MX';
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Buscar voz en español de México si está disponible
    const voices = window.speechSynthesis.getVoices();
    const mxVoice = voices.find((v) => v.lang === 'es-MX' || v.lang.startsWith('es-')) || voices.find((v) => v.lang.includes('es'));
    if (mxVoice) {
      utterance.voice = mxVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    // Pequeña pausa para dejar sonar la campana primero
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 250);
  });
}

/**
 * Retroalimentación háptica táctil (vibración física en celular)
 */
export async function triggerHaptic(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
  try {
    await Haptics.impact({ style });
  } catch {
    // Fallback web de vibración si está soportado
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  }
}
