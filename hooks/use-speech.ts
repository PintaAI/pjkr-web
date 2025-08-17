import { useCallback } from "react";

export const useSpeech = () => {
  const speak = useCallback((text: string, lang = "ko-KR") => {
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.speak(u);
  }, []);

  return { speak };
};