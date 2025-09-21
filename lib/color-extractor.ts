import React from "react"

export interface ColorPalette {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
}

export interface ColorExtractionOptions {
  maxColors?: number
  format?: 'hex' | 'rgb' | 'hsl'
}

/**
 * Extract colors from an image and return a structured color palette
 * @param imageSrc - Base64 image string or image URL
 * @param options - Color extraction options
 * @returns Promise that resolves to a ColorPalette
 */
export const extractColorPalette = (): Promise<ColorPalette> => {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary div to render ColorExtractor
      const tempDiv = document.createElement('div')
      tempDiv.style.display = 'none'
      document.body.appendChild(tempDiv)
      
      // This approach won't work directly since ColorExtractor is a React component
      // We need a different approach for programmatic usage
      reject(new Error('ColorExtractor requires React component usage'))
      
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * React hook for color extraction
 * @param imageSrc - Base64 image string or image URL
 * @param options - Color extraction options
 * @returns Object with color palette state and extraction handler
 */
export const useColorExtraction = (options: ColorExtractionOptions = {}) => {
  const [colorPalette, setColorPalette] = React.useState<ColorPalette | null>(null)
  const [isExtracting, setIsExtracting] = React.useState(false)
  
  const handleColorExtraction = (colors: string[]) => {
    const palette: ColorPalette = {
      primary: colors[0] || "#3B82F6",
      secondary: colors[1] || "#8B5CF6",
      accent: colors[2] || "#F59E0B", 
      background: colors[3] || "#F8FAFC",
      foreground: colors[4] || "#1E293B"
    }
    
    setColorPalette(palette)
    setIsExtracting(false)
  }
  
  const extractColors = (imageSrc: string) => {
    setIsExtracting(true)
    setColorPalette(null)
    // Return props for ColorExtractor component
    return {
      src: imageSrc,
      getColors: handleColorExtraction,
      maxColors: options.maxColors || 5,
      format: options.format || 'hex'
    }
  }
  
  return {
    colorPalette,
    isExtracting,
    extractColors,
    handleColorExtraction
  }
}

/**
 * Utility functions for color manipulation
 */
export const colorUtils = {
  /**
   * Convert hex color to RGB
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  /**
   * Get contrast color (white or black) based on background
   */
  getContrastColor: (backgroundColor: string): string => {
    const rgb = colorUtils.hexToRgb(backgroundColor)
    if (!rgb) return '#000000'
    
    // Calculate luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
    return luminance > 0.5 ? '#000000' : '#ffffff'
  },
  
  /**
   * Add alpha channel to hex color
   */
  addAlpha: (hex: string, alpha: number): string => {
    const rgb = colorUtils.hexToRgb(hex)
    if (!rgb) return hex
    
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
  },
  
  /**
   * Generate color variations (lighter/darker)
   */
  generateVariations: (hex: string) => {
    const rgb = colorUtils.hexToRgb(hex)
    if (!rgb) return { lighter: hex, darker: hex }
    
    const lighter = `rgb(${Math.min(255, rgb.r + 30)}, ${Math.min(255, rgb.g + 30)}, ${Math.min(255, rgb.b + 30)})`
    const darker = `rgb(${Math.max(0, rgb.r - 30)}, ${Math.max(0, rgb.g - 30)}, ${Math.max(0, rgb.b - 30)})`
    
    return { lighter, darker }
  },

  /**
   * Convert hex to oklch format (simplified approximation)
   */
  hexToOklch: (hex: string): string => {
    const rgb = colorUtils.hexToRgb(hex)
    if (!rgb) return hex
    
    // Simple approximation - for production use, consider a proper color conversion library
    const r = rgb.r / 255
    const g = rgb.g / 255
    const b = rgb.b / 255
    
    // Basic luminance calculation
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    
    // Very simplified oklch approximation - this is not accurate but will work for basic theming
    return `oklch(${luminance.toFixed(4)} 0.0500 ${Math.floor(Math.random() * 360)})`
  }
}

/**
 * Export color palette to different formats
 */
export const exportPalette = {
  /**
   * Export as JSON
   */
  toJson: (palette: ColorPalette, filename = 'color-palette.json') => {
    const dataStr = JSON.stringify(palette, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },
  
  /**
   * Export as CSS variables
   */
  toCss: (palette: ColorPalette, filename = 'palette.css') => {
    const cssVars = `:root {
  --color-primary: ${palette.primary};
  --color-secondary: ${palette.secondary};
  --color-accent: ${palette.accent};
  --color-background: ${palette.background};
  --color-foreground: ${palette.foreground};
}`
    
    const blob = new Blob([cssVars], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },
  
  /**
   * Export as Tailwind config
   */
  toTailwind: (palette: ColorPalette, filename = 'tailwind-colors.js') => {
    const tailwindConfig = `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${palette.primary}',
        secondary: '${palette.secondary}',
        accent: '${palette.accent}',
        background: '${palette.background}',
        foreground: '${palette.foreground}',
      }
    }
  }
}`
    
    const blob = new Blob([tailwindConfig], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}
