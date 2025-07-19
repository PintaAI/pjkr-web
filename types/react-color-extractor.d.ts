declare module 'react-color-extractor' {
  interface ColorExtractorProps {
    src: string;
    getColors: (colors: string[]) => void;
    maxColors?: number;
    format?: 'hex' | 'rgb' | 'hsl';
  }

  export const ColorExtractor: React.FC<ColorExtractorProps>;
}
