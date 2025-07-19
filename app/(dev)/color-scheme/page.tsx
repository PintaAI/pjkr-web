"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Download, Palette, Copy } from "lucide-react"
import { ColorExtractor } from "react-color-extractor"
import {  exportPalette, type ColorPalette } from "@/lib/color-extractor"
import Image from "next/image"

export default function ColorSchemePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [colorPalette, setColorPalette] = useState<ColorPalette | null>(null)


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setColorPalette(null) // Reset palette when new image is uploaded
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleColorExtraction = (colors: string[]) => {
    // Map extracted colors to our color scheme
    const extractedPalette: ColorPalette = {
      primary: colors[0] || "#3B82F6",
      secondary: colors[1] || "#8B5CF6",
      accent: colors[2] || "#F59E0B",
      background: colors[3] || "#F8FAFC",
      foreground: colors[4] || "#1E293B"
    }
    
    setColorPalette(extractedPalette)
    
  }


  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color)
  }

  const handleExportPalette = () => {
    if (!colorPalette) return
    exportPalette.toJson(colorPalette)
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Palette className="text-primary" />
          Generate Color Scheme
        </h1>
        <p className="text-muted-foreground">
          Upload an image to extract a beautiful color palette for your designs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Choose an image to generate a color scheme from
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label 
              htmlFor="image-upload" 
              className="block border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-lg shadow-md"
                  />
                  <p className="text-sm text-muted-foreground">
                    {selectedImage?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click to change image
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              )}
            </label>
            
            {/* Hidden ColorExtractor component for processing */}
            {imagePreview && (
              <div className="hidden">
                <ColorExtractor
                  src={imagePreview}
                  getColors={handleColorExtraction}
                  maxColors={5}
                  format="hex"
                />
              </div>
            )}
            
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
          </CardContent>
        </Card>

        {/* Color Palette Display */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Palette</CardTitle>
            <CardDescription>
              Your extracted color scheme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {colorPalette ? (
              <div className="space-y-4">
                {Object.entries(colorPalette).map(([name, color]) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full border shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <p className="font-medium capitalize">{name}</p>
                        <p className="text-sm text-muted-foreground">{color}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyColor(color)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button onClick={handleExportPalette} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Palette
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Upload an image to generate colors
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {colorPalette && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Color Preview</CardTitle>
            <CardDescription>
              See how your colors work together
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="p-6 rounded-lg border"
              style={{ 
                backgroundColor: colorPalette.background,
              }}
            >
              <h3 className="text-xl font-bold mb-4 text-foreground">Sample Design</h3>
              <div className="space-y-3">
                <Button 
                  className="mr-3"
                  style={{ 
                    backgroundColor: colorPalette.primary,
                    color: "#ffffff"
                  }}
                >
                  Primary Button
                </Button>
                <Button 
                  variant="outline"
                  className="text-foreground"
                  style={{ 
                    borderColor: colorPalette.secondary,
                    color: colorPalette.secondary 
                  }}
                >
                  Secondary Button
                </Button>
                <div 
                  className="p-3 rounded border-l-4 mt-4"
                  style={{ 
                    borderLeftColor: colorPalette.accent,
                    backgroundColor: `${colorPalette.accent}20`
                  }}
                >
                  <p className="text-foreground">This is an accent highlight with your generated colors!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
