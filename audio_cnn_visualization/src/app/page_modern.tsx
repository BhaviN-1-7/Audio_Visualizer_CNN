"use client";

import { useState } from "react";
import { Upload, Loader2, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ColorScale from "~/components/ColorScale";
import FeatureMap from "~/components/FeatureMap";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import Waveform from "~/components/Waveform";

interface Prediction {
  class: string;
  confidence: number;
}

interface LayerData {
  shape: number[];
  values: number[][];
}

interface VisualizationData {
  [layerName: string]: LayerData;
}

interface WaveformData {
  values: number[];
  sample_rate: number;
  duration: number;
}

interface ApiResponse {
  predictions: Prediction[];
  visualization: VisualizationData;
  input_spectrogram: LayerData;
  waveform: WaveformData;
}

const ESC50_EMOJI_MAP: Record<string, string> = {
  dog: "🐕", rain: "🌧️", crying_baby: "👶", door_wood_knock: "🚪", helicopter: "🚁",
  rooster: "🐓", sea_waves: "🌊", sneezing: "🤧", mouse_click: "🖱️", chainsaw: "🪚",
  pig: "🐷", crackling_fire: "🔥", clapping: "👏", keyboard_typing: "⌨️", siren: "🚨",
  cow: "🐄", crickets: "🦗", breathing: "💨", door_wood_creaks: "🚪", car_horn: "📯",
  frog: "🐸", chirping_birds: "🐦", coughing: "😷", can_opening: "🥫", engine: "🚗",
  cat: "🐱", water_drops: "💧", footsteps: "👣", washing_machine: "🧺", train: "🚂",
  hen: "🐔", wind: "💨", laughing: "😂", vacuum_cleaner: "🧹", church_bells: "🔔",
  insects: "🦟", pouring_water: "🚰", brushing_teeth: "🪥", clock_alarm: "⏰", airplane: "✈️",
  sheep: "🐑", toilet_flush: "🚽", snoring: "😴", clock_tick: "⏱️", fireworks: "🎆",
  crow: "🐦‍⬛", thunderstorm: "⛈️", drinking_sipping: "🥤", glass_breaking: "🔨", hand_saw: "🪚",
};

const getEmojiForClass = (className: string): string => {
  return ESC50_EMOJI_MAP[className] || "🔈";
};

function splitLayers(visualization: VisualizationData) {
  const main: [string, LayerData][] = [];
  const internals: Record<string, [string, LayerData][]> = {};

  for (const [key, value] of Object.entries(visualization)) {
    if (key.includes(".")) {
      const [parentLayer] = key.split(".");
      if (!internals[parentLayer!]) {
        internals[parentLayer!] = [];
      }
      internals[parentLayer!]!.push([key, value]);
    } else {
      main.push([key, value]);
    }
  }

  return { main, internals };
}

export default function HomePage() {
  const [vizData, setVizData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Audio = event.target?.result?.toString().split(",")[1];
        if (!base64Audio) {
          throw new Error("Failed to read file");
        }

        const response = await fetch(
          "https://pachapaul--audio-cnn-inference-audioclassifier-inference.modal.run",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio_data: base64Audio }),
          }
        );

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const data = (await response.json()) as ApiResponse;
        setVizData(data);
      };

      reader.onerror = () => {
        throw new Error("Failed to read file");
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setVizData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const { main, internals } = vizData
    ? splitLayers(vizData.visualization)
    : { main: [], internals: {} };

  return (
    <main className="relative min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-4 py-2 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Powered by Deep Learning</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 sm:text-6xl"
          >
            Audio Classification
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
          >
            Upload any audio file and watch as our CNN model analyzes it in real-time,
            revealing the inner workings of neural network feature extraction
          </motion.p>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto max-w-2xl"
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <label
                  htmlFor="file-upload"
                  className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-background/50 p-12 transition-all hover:border-primary/50 hover:bg-accent/50 ${isLoading ? "pointer-events-none opacity-50" : ""}`}
                >
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <div className="space-y-2 text-center">
                          <p className="text-lg font-medium">Analyzing audio...</p>
                          <p className="text-sm text-muted-foreground">
                            Extracting features and making predictions
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2 text-center">
                          <p className="text-lg font-medium">
                            {fileName || "Drop your audio file here"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse • WAV, MP3, OGG supported
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".wav,.mp3,.ogg,audio/*"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </label>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/50"
                  >
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>Error:</strong> {error}
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {vizData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Predictions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      <CardTitle>Top Predictions</CardTitle>
                    </div>
                    <CardDescription>
                      Model confidence scores for detected sounds
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {vizData.predictions.slice(0, 3).map((pred, i) => (
                        <motion.div
                          key={pred.class}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          className="space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">
                                {getEmojiForClass(pred.class)}
                              </span>
                              <span className="text-lg font-medium capitalize">
                                {pred.class.replaceAll("_", " ")}
                              </span>
                            </div>
                            <Badge
                              variant={i === 0 ? "default" : "secondary"}
                              className="text-base"
                            >
                              {(pred.confidence * 100).toFixed(1)}%
                            </Badge>
                          </div>
                          <Progress
                            value={pred.confidence * 100}
                            className="h-3"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Spectrogram & Waveform */}
              <div className="grid gap-6 lg:grid-cols-2">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Input Spectrogram</CardTitle>
                      <CardDescription>
                        Mel-frequency representation • {vizData.input_spectrogram.shape.join(" × ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-hidden rounded-lg border border-border/50 bg-background/50 p-2">
                        <FeatureMap
                          data={vizData.input_spectrogram.values}
                          title=""
                          spectrogram
                        />
                      </div>
                      <div className="mt-4 flex justify-end">
                        <ColorScale width={200} height={16} min={-1} max={1} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="h-full border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Audio Waveform</CardTitle>
                      <CardDescription>
                        {vizData.waveform.duration.toFixed(2)}s @ {vizData.waveform.sample_rate}Hz
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <Waveform
                          data={vizData.waveform.values}
                          title=""
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Feature Maps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>CNN Feature Maps</CardTitle>
                    <CardDescription>
                      Layer-by-layer feature extraction visualization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {main.map(([mainName, mainData], idx) => (
                        <motion.div
                          key={mainName}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                          className="space-y-4"
                        >
                          <Card className="overflow-hidden border-border/50">
                            <CardHeader className="bg-accent/50 pb-3">
                              <CardTitle className="text-sm font-medium">
                                {mainName}
                                <span className="ml-2 font-mono text-xs text-muted-foreground">
                                  {mainData.shape.join(" × ")}
                                </span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                              <div className="overflow-hidden rounded-md border border-border/50 bg-background/50 p-1">
                                <FeatureMap
                                  data={mainData.values}
                                  title=""
                                />
                              </div>
                            </CardContent>
                          </Card>

                          {internals[mainName] && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Internal Blocks
                              </p>
                              <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-border/50 bg-background/30 p-2">
                                {internals[mainName]
                                  .sort(([a], [b]) => a.localeCompare(b))
                                  .map(([layerName, layerData]) => (
                                    <Card
                                      key={layerName}
                                      className="overflow-hidden border-border/50"
                                    >
                                      <CardHeader className="bg-accent/30 p-2">
                                        <CardTitle className="text-xs">
                                          {layerName.replace(`${mainName}.`, "")}
                                        </CardTitle>
                                      </CardHeader>
                                      <CardContent className="p-2">
                                        <div className="h-24 overflow-hidden rounded border border-border/50 bg-background/50">
                                          <FeatureMap
                                            data={layerData.values}
                                            title=""
                                            internal
                                          />
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <ColorScale width={200} height={16} min={-1} max={1} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
