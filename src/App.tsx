import React, { useState, useCallback } from 'react';
import { UploadCloud, FileImage, ShieldAlert, CheckCircle2, AlertTriangle, Stethoscope, Droplets, ArrowRight, Loader2, Sprout, Leaf, Zap, Pill } from 'lucide-react';

// ====== CONFIGURABLE API URL ======
// Set VITE_API_URL in .env for local override, otherwise uses Render backend
const API_BASE_URL = 'https://leaf-disease-backend-us.onrender.com';

interface NutrientLevel {
  level: number;
  status: string;
  description: string;
}

interface NPKLevels {
  nitrogen: NutrientLevel;
  phosphorus: NutrientLevel;
  potassium: NutrientLevel;
}

interface AnalysisResult {
  disease_detected: boolean;
  disease_name: string;
  disease_type: string;
  severity: string;
  confidence: number;
  symptoms: string[];
  possible_causes: string[];
  treatment: string[];
  npk_levels?: NPKLevels;
  analysis_timestamp: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      handleFileSelected(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
  };

  const compressImage = (file: File, maxWidth = 1200, quality = 0.7): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Image load failed'));
      };
      img.src = objectUrl;
    });
  };

  const analyzeImage = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    
    try {
      // Compress image before uploading (reduces ~5-15MB phone photos to ~100-300KB)
      const compressed = await compressImage(file);
      
      const formData = new FormData();
      formData.append('file', compressed, 'leaf.jpg');

      // Use XMLHttpRequest for better Capacitor native HTTP interception on Android
      const data = await new Promise<AnalysisResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/disease-detection-file`);
        xhr.timeout = 120000; // 2 minute timeout for cold starts
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(`Server responded with ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error — check your internet connection'));
        xhr.ontimeout = () => reject(new Error('Request timed out — server may be starting up, please try again'));
        xhr.send(formData);
      });

      setResult(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Analysis failed: ${message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-on_surface overflow-x-hidden selection:bg-primary/30" style={{ paddingTop: 'var(--safe-area-top)' }}>
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-25%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-primary/[0.04] blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-tertiary_container/[0.03] blur-[120px]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full px-4 sm:px-6 py-3 glass-panel mx-auto max-w-7xl mt-2 sm:mt-4 flex items-center justify-between" style={{ marginTop: 'calc(var(--safe-area-top, 0px) + 8px)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center animate-glow-pulse">
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display font-bold text-lg tracking-wide">
            AI <span className="glow-text">MADHU</span>
          </h1>
        </div>
        <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface_container_highest/80 border border-outline_variant/20 text-on_surface_variant">
          ⚡ Powered by AI
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 sm:py-10 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          
          {/* Left Column - Upload Zone */}
          <div className="space-y-5">
            {/* Hero Text */}
            <div className="animate-fade-in">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-extrabold mb-3 leading-tight tracking-tight">
                Diagnose plant health with <span className="glow-text">precision</span>.
              </h2>
              <p className="text-on_surface_variant text-sm sm:text-base leading-relaxed">
                Upload a leaf image and our AI vision engine will analyze diseases, severity, and NPK nutrient levels.
              </p>
            </div>

            {/* Upload Zone */}
            <div 
              className={`relative group w-full aspect-[4/3] rounded-2xl glass-panel border-2 border-dashed ${file ? 'border-primary/40' : 'border-outline_variant/30 hover:border-primary/50'} transition-all duration-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer overflow-hidden animate-slide-up`}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
              
              {previewUrl ? (
                <>
                  <div className="absolute inset-0 bg-black/50 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white font-medium flex items-center gap-2 bg-surface_container/80 px-4 py-2 rounded-full backdrop-blur-sm">
                       <FileImage className="w-4 h-4" /> Change Image
                    </p>
                  </div>
                  <img src={previewUrl} alt="Leaf Preview" className="absolute inset-0 w-full h-full object-cover z-0 rounded-xl" />
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 z-10 transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="w-16 h-16 rounded-2xl bg-surface_container_highest/80 border border-outline_variant/20 flex items-center justify-center group-hover:shadow-[0_0_30px_rgba(107,254,156,0.15)] transition-all">
                    <UploadCloud className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-on_surface text-sm">Drag & drop leaf image here</p>
                    <p className="text-xs text-on_surface_variant mt-1">Supports JPG, PNG, WEBP — max 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeImage}
              disabled={!file || loading}
              className={`w-full py-3.5 text-center text-sm sm:text-base rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 font-semibold ${!file ? 'bg-surface_container_highest text-on_surface_variant cursor-not-allowed opacity-60' : 'glow-btn'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Leaf...
                </>
              ) : (
                <>
                  Begin Plant Analysis <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Reset Button */}
            {result && (
              <button
                onClick={resetAnalysis}
                className="w-full py-2.5 text-center text-sm rounded-xl bg-surface_container border border-outline_variant/20 text-on_surface_variant hover:text-on_surface hover:border-outline_variant/40 transition-all duration-200"
              >
                🔄 New Analysis
              </button>
            )}
            
            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-error/10 border border-error/25 text-error text-sm flex items-start gap-2.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Feature Cards - Only visible when no result */}
            {!result && !loading && (
              <div className="grid grid-cols-3 gap-2.5 mt-2 animate-slide-up">
                <FeatureCard icon={<ShieldAlert className="w-4 h-4" />} title="Disease Detection" />
                <FeatureCard icon={<Sprout className="w-4 h-4" />} title="NPK Analysis" />
                <FeatureCard icon={<Pill className="w-4 h-4" />} title="Treatment" />
              </div>
            )}

            {/* NPK Nutrient Analysis - Left Side */}
            {result && result.npk_levels && result.disease_type !== 'invalid_image' && (
              <div className="mt-2 glass-panel p-5 animate-fade-in">
                <h4 className="font-display font-bold text-base mb-4 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-tertiary_dim/15 flex items-center justify-center">
                    <Sprout className="w-4 h-4 text-tertiary_dim" />
                  </div>
                  Soil Nutrient Analysis (NPK)
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <NutrientGauge name="Nitrogen" symbol="N" color="emerald" data={result.npk_levels.nitrogen} />
                  <NutrientGauge name="Phosphorus" symbol="P" color="amber" data={result.npk_levels.phosphorus} />
                  <NutrientGauge name="Potassium" symbol="K" color="violet" data={result.npk_levels.potassium} />
                </div>
                <p className="text-[10px] text-on_surface_variant/40 mt-3 italic text-center">
                  NPK levels are AI-predicted based on visual leaf symptoms and may vary from actual soil test results.
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Results Dashboard */}
          <div>
            {!result && !loading ? (
              <div className="h-full w-full glass-panel flex flex-col items-center justify-center text-center p-8 sm:p-12 min-h-[350px]">
                <div className="w-20 h-20 rounded-2xl bg-surface_container_highest/60 border border-outline_variant/15 flex items-center justify-center mb-5 opacity-40">
                   <Stethoscope className="w-8 h-8 text-on_surface_variant" />
                </div>
                <h3 className="text-lg font-display font-semibold text-on_surface">Awaiting Analysis</h3>
                <p className="text-on_surface_variant text-sm max-w-xs mt-2 leading-relaxed">Upload a leaf image and start the scan to populate the AI diagnostics dashboard.</p>
              </div>
            ) : loading ? (
              <div className="h-full w-full glass-panel flex flex-col items-center justify-center text-center p-8 sm:p-12 min-h-[350px] border-primary/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/[0.03] animate-pulse" />
                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative w-28 h-28 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-surface_container_highest" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" style={{ animationDuration: '2s' }} />
                    <div className="absolute inset-2 rounded-full border-4 border-tertiary_dim border-b-transparent animate-spin border-dashed" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Leaf className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-display font-bold text-on_surface mb-1.5">Analyzing Leaf</h3>
                  <div className="flex items-center gap-1.5 text-primary text-xs font-medium tracking-widest font-mono">
                    <span>PROCESSING</span>
                    <span className="flex gap-0.5">
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.15s' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>.</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : result && (
              <div className="h-full w-full glass-panel p-5 sm:p-8 flex flex-col animate-fade-in">
                {/* Header - Disease Name & Confidence */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                       <span className="text-xs font-mono text-tertiary_dim font-bold tracking-widest uppercase">{result.disease_type || 'Classification'}</span>
                       <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                         result.severity?.toLowerCase() === 'severe' || result.severity?.toLowerCase() === 'high' ? 'bg-error/15 text-error border border-error/25' : 
                         result.severity?.toLowerCase() === 'moderate' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25' :
                         'bg-primary/15 text-primary border border-primary/25'
                       }`}>
                         {result.severity || 'Unknown'} Severity
                       </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-display font-extrabold glow-text leading-tight">{result.disease_name}</h2>
                  </div>
                  <ConfidenceGauge value={result.confidence} />
                </div>

                {/* Symptoms & Causes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
                  <ResultCard
                    icon={<AlertTriangle className="w-4 h-4 text-tertiary_dim" />}
                    title="Observed Symptoms"
                    items={result.symptoms?.slice(0, 3)}
                  />
                  <ResultCard
                    icon={<Droplets className="w-4 h-4 text-tertiary_dim" />}
                    title="Possible Causes"
                    items={result.possible_causes?.slice(0, 3)}
                  />
                </div>

                {/* Treatment Protocol */}
                <div className="mt-4 bg-primary/[0.06] border border-primary/15 p-5 rounded-2xl">
                  <h4 className="font-display font-bold text-sm sm:text-base mb-3 text-primary flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Treatment Protocol
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.treatment?.length > 0 ? result.treatment.slice(0, 4).map((treatment, idx) => (
                      <div key={idx} className="bg-surface_container/80 border border-outline_variant/20 p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed flex items-start gap-2.5">
                         <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-primary font-bold text-[10px]">{idx + 1}</div>
                         <span className="text-on_surface_variant">{treatment}</span>
                      </div>
                    )) : (
                      <div className="text-xs text-on_surface_variant italic">Consult a local agricultural professional.</div>
                    )}
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className="mt-4 text-[10px] text-on_surface_variant/50 flex justify-between items-center border-t border-outline_variant/15 pt-3">
                   <span>AI MADHU · Plant Disease Detection</span>
                   <span>{result.analysis_timestamp ? new Date(result.analysis_timestamp).toLocaleString() : new Date().toLocaleString()}</span>
                </div>

                {/* NPK is now in the left column */}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-[10px] text-on_surface_variant/30 font-mono" style={{ paddingBottom: 'calc(var(--safe-area-bottom, 0px) + 24px)' }}>
        AI MADHU © {new Date().getFullYear()} · Leaf Disease Detection
      </footer>
    </div>
  );
}

export default App;

/* ---------- Feature Card Component ---------- */
function FeatureCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-surface_container/70 border border-outline_variant/10 p-3 rounded-xl text-center flex flex-col items-center gap-2 hover:border-primary/20 transition-all">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <p className="text-[10px] font-medium text-on_surface_variant leading-tight">{title}</p>
    </div>
  );
}

/* ---------- Confidence Gauge Component ---------- */
function ConfidenceGauge({ value }: { value: number }) {
  const rounded = Math.round(value || 0);
  const circumference = 2 * Math.PI * 24;
  const offset = circumference - (circumference * rounded) / 100;

  return (
    <div className="flex flex-col items-center ml-3">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="28" cy="28" r="24" className="fill-none stroke-surface_container_highest" strokeWidth="3.5" />
          <circle cx="28" cy="28" r="24" className="fill-none stroke-primary" strokeWidth="3.5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <span className="font-bold text-sm">{rounded}%</span>
      </div>
      <span className="text-[10px] text-on_surface_variant mt-0.5">Confidence</span>
    </div>
  );
}

/* ---------- Result Card Component ---------- */
function ResultCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="bg-surface_container_low/80 p-4 sm:p-5 rounded-2xl border border-outline_variant/10">
      <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
        {icon} {title}
      </h4>
      <ul className="space-y-2">
        {items?.length > 0 ? items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-on_surface_variant leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 text-primary_dim mt-0.5 flex-shrink-0" />
            <span>{item}</span>
          </li>
        )) : (
          <li className="text-xs text-on_surface_variant italic">No data available.</li>
        )}
      </ul>
    </div>
  );
}

/* ---------- Nutrient Gauge Component ---------- */
function NutrientGauge({ name, symbol, color, data }: {
  name: string;
  symbol: string;
  color: 'emerald' | 'amber' | 'violet';
  data: NutrientLevel;
}) {
  const level = Math.min(100, Math.max(0, data?.level ?? 0));
  const status = data?.status ?? 'Unknown';
  const description = data?.description ?? 'Not analyzed';

  const getStatusColor = (s: string) => {
    const lower = s.toLowerCase();
    if (lower === 'low' || lower === 'deficient') return 'text-red-400 bg-red-400/15 border-red-400/25';
    if (lower === 'moderate') return 'text-yellow-400 bg-yellow-400/15 border-yellow-400/25';
    if (lower === 'optimal' || lower === 'adequate') return 'text-emerald-400 bg-emerald-400/15 border-emerald-400/25';
    if (lower === 'high' || lower === 'excess') return 'text-blue-400 bg-blue-400/15 border-blue-400/25';
    return 'text-on_surface_variant bg-surface_container_highest border-outline_variant/20';
  };

  const getBarColor = () => {
    if (color === 'emerald') return 'from-emerald-500 to-emerald-300';
    if (color === 'amber') return 'from-amber-500 to-amber-300';
    return 'from-violet-500 to-violet-300';
  };

  const getSymbolBg = () => {
    if (color === 'emerald') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
    if (color === 'amber') return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
    return 'bg-violet-500/15 text-violet-400 border-violet-500/25';
  };

  return (
    <div className="bg-surface_container_low/80 p-4 rounded-2xl border border-outline_variant/10 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${getSymbolBg()} border flex items-center justify-center font-display font-bold text-sm`}>
            {symbol}
          </div>
          <div>
            <p className="font-display font-bold text-xs text-on_surface">{name}</p>
            <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusColor(status)}`}>
              {status}
            </span>
          </div>
        </div>
        <span className="font-mono font-bold text-xl text-on_surface">{level}<span className="text-[10px] text-on_surface_variant">%</span></span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-surface_container_highest/80 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor()} transition-all duration-1000 ease-out`}
          style={{ width: `${level}%` }}
        />
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between text-[9px] text-on_surface_variant/40 font-mono">
        <span>0</span>
        <span>30</span>
        <span>60</span>
        <span>80</span>
        <span>100</span>
      </div>

      {/* Description */}
      <p className="text-[10px] text-on_surface_variant/60 leading-relaxed line-clamp-2">{description}</p>
    </div>
  );
}
