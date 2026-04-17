"use client";

import { useState } from "react";
import { Upload, Loader2, TrendingUp, Waves, Layers, Music2 } from "lucide-react";
import ColorScale from "~/components/ColorScale";
import FeatureMap from "~/components/FeatureMap";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import Waveform from "~/components/Waveform";
import { GridBackground } from "~/components/GridBackground";

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
  dog: "🐕",
  rain: "🌧️",
  crying_baby: "👶",
  door_wood_knock: "🚪",
  helicopter: "🚁",
  rooster: "🐓",
  sea_waves: "🌊",
  sneezing: "🤧",
  mouse_click: "🖱️",
  chainsaw: "🪚",
  pig: "🐷",
  crackling_fire: "🔥",
  clapping: "👏",
  keyboard_typing: "⌨️",
  siren: "🚨",
  cow: "🐄",
  crickets: "🦗",
  breathing: "💨",
  door_wood_creaks: "🚪",
  car_horn: "📯",
  frog: "🐸",
  chirping_birds: "🐦",
  coughing: "😷",
  can_opening: "🥫",
  engine: "🚗",
  cat: "🐱",
  water_drops: "💧",
  footsteps: "👣",
  washing_machine: "🧺",
  train: "🚂",
  hen: "🐔",
  wind: "💨",
  laughing: "😂",
  vacuum_cleaner: "🧹",
  church_bells: "🔔",
  insects: "🦟",
  pouring_water: "🚰",
  brushing_teeth: "🪥",
  clock_alarm: "⏰",
  airplane: "✈️",
  sheep: "🐑",
  toilet_flush: "🚽",
  snoring: "😴",
  clock_tick: "⏱️",
  fireworks: "🎆",
  crow: "🐦‍⬛",
  thunderstorm: "⛈️",
  drinking_sipping: "🥤",
  glass_breaking: "🔨",
  hand_saw: "🪚",
};

const getEmojiForClass = (className: string): string => {
  return ESC50_EMOJI_MAP[className] || "🔈";
};

function splitLayers(visualization: VisualizationData) {
  const main: [string, LayerData][] = [];
  const internals: Record<string, [string, LayerData][]> = {};

  for (const [name, data] of Object.entries(visualization)) {
    if (!name.includes(".")) {
      main.push([name, data]);
    } else {
      const [parent] = name.split(".");
      if (parent === undefined) continue;

      if (!internals[parent]) internals[parent] = [];
      internals[parent].push([name, data]);
    }
  }

  return { main, internals };
}

export default function HomePage() {
  const [vizData, setVizData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setError(null);
    setVizData(null);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const base64String = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );

        const url = process.env.NEXT_PUBLIC_INFERENCE_URL || "https://onlydownloads-7657--audio-cnn-inference-audioclassifier--abcbbc.modal.run";
        console.log("Making request to:", url);
        
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio_data: base64String }),
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`API error ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const data: ApiResponse = await response.json();
        console.log("Received data:", data);
        setVizData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occured",
        );
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed ot read the file.");
      setIsLoading(false);
    };
  };

  const { main, internals } = vizData
    ? splitLayers(vizData?.visualization)
    : { main: [], internals: {} };

  return (
    <main className="relative min-h-screen bg-black p-6">
      <GridBackground />
      
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <Music2 className="h-6 w-6 text-green-500" />
            </div>
            <h1 className="text-3xl font-semibold text-white">
              Audio Visualizer
            </h1>
          </div>
          <p className="text-gray-400">
            Neural network audio classification with real-time feature visualization
          </p>
        </div>

        {/* Upload Section */}
        <div className="mx-auto mb-10 max-w-2xl">
          <label
            htmlFor="file-upload"
            className={`group relative block cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-gray-800 bg-gray-950/50 p-10 backdrop-blur-sm transition-all hover:border-green-500 hover:bg-gray-900/50 ${
              isLoading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="rounded-full bg-green-500/10 p-4 transition-all group-hover:scale-110 group-hover:bg-green-500/20">
                {isLoading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-green-500" />
                ) : (
                  <Upload className="h-10 w-10 text-green-500" />
                )}
              </div>
              
              <div className="text-center">
                {isLoading ? (
                  <>
                    <p className="text-xl font-medium text-white">Analyzing Audio...</p>
                    <p className="mt-1 text-sm text-gray-400">Processing layers</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-medium text-white">
                      {fileName || "Drop your audio file here"}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      or click to browse • WAV format
                    </p>
                  </>
                )}
              </div>
            </div>

            <input
              id="file-upload"
              type="file"
              className="sr-only"
              accept=".wav"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </label>
          
          {fileName && !isLoading && (
            <div className="mt-4 flex items-center justify-center">
              <Badge className="border-green-500/30 bg-green-500/10 px-4 py-1.5 text-green-500">
                {fileName}
              </Badge>
            </div>
          )}
        </div>

        {error && (
          <Card className="mb-8 border border-red-500/20 bg-red-950/20">
            <CardContent className="p-4">
              <p className="text-center text-red-400">
                <strong>Error:</strong> {error}
              </p>
            </CardContent>
          </Card>
        )}

        {vizData && (
          <div className="space-y-6">
            {/* Top Predictions */}
            <Card className="border border-gray-800 bg-gray-950/50 backdrop-blur-sm transition-all hover:border-green-500/50">
              <CardHeader className="border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-white">
                    Top Predictions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {vizData.predictions.slice(0, 3).map((pred, i) => (
                    <div 
                      key={pred.class} 
                      className="group space-y-2 rounded-lg border border-gray-800 bg-gray-900/30 p-4 transition-all hover:border-green-500/30 hover:bg-gray-900/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl transition-transform group-hover:scale-110">{getEmojiForClass(pred.class)}</span>
                          <span className="font-medium capitalize text-white">
                            {pred.class.replaceAll("_", " ")}
                          </span>
                        </div>
                        <Badge 
                          className={i === 0 
                            ? "border-green-500/30 bg-green-500/10 text-green-500" 
                            : "border-gray-700 bg-gray-800 text-gray-400"
                          }
                        >
                          {(pred.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                        <div 
                          className="h-full bg-white transition-all"
                          style={{ width: `${pred.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spectrogram & Waveform */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border border-gray-800 bg-gray-950/50 backdrop-blur-sm transition-all hover:border-green-500/50">
                <CardHeader className="border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/10 p-2">
                      <Layers className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-white">
                        Input Spectrogram
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {vizData.input_spectrogram.shape.join(" × ")} bins
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <FeatureMap
                    data={vizData.input_spectrogram.values}
                    title={`${vizData.input_spectrogram.shape.join(" x ")}`}
                    spectrogram
                  />
                  <div className="mt-4 flex justify-end">
                    <ColorScale width={200} height={16} min={-1} max={1} />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-800 bg-gray-950/50 backdrop-blur-sm transition-all hover:border-green-500/50">
                <CardHeader className="border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/10 p-2">
                      <Waves className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-white">
                        Audio Waveform
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        {vizData.waveform.duration.toFixed(2)}s @ {vizData.waveform.sample_rate}Hz
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Waveform
                    data={vizData.waveform.values}
                    title={`${vizData.waveform.duration.toFixed(2)}s * ${vizData.waveform.sample_rate}Hz`}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Feature Maps */}
            <Card className="border border-gray-800 bg-gray-950/50 backdrop-blur-sm transition-all hover:border-green-500/50">
              <CardHeader className="border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <Layers className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-white">
                      Convolutional Layer Outputs
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Feature extraction layers
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
                  {main.map(([mainName, mainData]) => (
                    <div key={mainName} className="space-y-3">
                      <div className="rounded-lg border border-gray-800 bg-gray-900/30 p-3 transition-all hover:border-green-500/30 hover:bg-gray-900/50">
                        <h4 className="mb-2 text-sm font-semibold text-white">
                          {mainName}
                        </h4>
                        <FeatureMap
                          data={mainData.values}
                          title={`${mainData.shape.join(" x ")}`}
                        />
                      </div>

                      {internals[mainName] && (
                        <div className="h-80 space-y-2 overflow-y-auto rounded-lg border border-gray-800 bg-black/50 p-2">
                          {internals[mainName]
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([layerName, layerData]) => (
                              <div key={layerName} className="transition-all hover:scale-105">
                                <FeatureMap
                                  data={layerData.values}
                                  title={layerName.replace(`${mainName}.`, "")}
                                  internal={true}
                                />
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <ColorScale width={200} height={16} min={-1} max={1} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
