import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Download, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { FreeLeadMagnetBar } from '../components/FreeLeadMagnetBar';

interface PhotoResizerPageProps {
  onNavigate?: (path: string) => void;
}

interface PhotoPreset {
  id: string;
  name: string;
  widthMm: number;
  heightMm: number;
  widthPx300Dpi: number;
  heightPx300Dpi: number;
  usage: string;
}

const PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: '35x45',
    name: '35x45 mm (Standard Schengen & UK)',
    widthMm: 35,
    heightMm: 45,
    widthPx300Dpi: 413,
    heightPx300Dpi: 531,
    usage: 'France, Germany, Italy, Spain, Switzerland, UK, Australia, Singapore'
  },
  {
    id: '2x2_inch',
    name: '2x2 inch / 51x51 mm (USA DS-160 & India)',
    widthMm: 50.8,
    heightMm: 50.8,
    widthPx300Dpi: 600,
    heightPx300Dpi: 600,
    usage: 'USA B1/B2, F1, H-1B (DS-160 upload), Indian Passport, OCI Card'
  },
  {
    id: '51x51',
    name: 'Passport Size 51x51 mm (Official Consular)',
    widthMm: 51,
    heightMm: 51,
    widthPx300Dpi: 602,
    heightPx300Dpi: 602,
    usage: 'Israel, Malaysia, Turkey, Vietnam Consular applications'
  },
  {
    id: '35x35',
    name: '35x35 mm (Square Format)',
    widthMm: 35,
    heightMm: 35,
    widthPx300Dpi: 413,
    heightPx300Dpi: 413,
    usage: 'UAE / Dubai e-Visa, Japan, China Visa'
  }
];

export const PhotoResizerPage: React.FC<PhotoResizerPageProps> = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('35x45');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('visa-photo.jpg');
  
  // Interactive adjustment controls
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [showFaceGuide, setShowFaceGuide] = useState<boolean>(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const currentPreset = PHOTO_PRESETS.find(p => p.id === selectedPresetId) || PHOTO_PRESETS[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG or PNG).');
      return;
    }

    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageSrc(dataUrl);
      // Reset transformations
      setZoom(1);
      setRotation(0);
      setPanX(0);
      setPanY(0);
    };
    reader.readAsDataURL(file);
  };

  // Re-draw canvas whenever image, preset, zoom, rotation, or pan updates
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
  }, [imageSrc, selectedPresetId, zoom, rotation, panX, panY]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set precise target canvas dimensions at 300 DPI
    canvas.width = currentPreset.widthPx300Dpi;
    canvas.height = currentPreset.heightPx300Dpi;

    // Clean background with pristine pure white (consular requirement)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    // Move to canvas center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    ctx.translate(centerX + panX, centerY + panY);

    // Apply rotation
    ctx.rotate((rotation * Math.PI) / 180);

    // Calculate base cover scaling
    const scaleX = canvas.width / img.width;
    const scaleY = canvas.height / img.height;
    const baseScale = Math.max(scaleX, scaleY);
    const finalScale = baseScale * zoom;

    const drawW = img.width * finalScale;
    const drawH = img.height * finalScale;

    // Draw centered image
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    ctx.restore();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) {
      alert('Please upload an image first.');
      return;
    }

    // Direct client-side download as high-quality JPEG
    const quality = 0.95;
    const dataUrl = canvas.toDataURL('image/jpeg', quality);

    const link = document.createElement('a');
    link.download = `${fileName}_${currentPreset.id}_300dpi.jpg`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setPanX(0);
    setPanY(0);
  };

  const faqs = [
    {
      q: "Does this tool upload my photograph to any server?",
      a: "No! 100% Client-Side Privacy. Your photo is processed directly inside your browser memory using HTML5 Canvas technology. No photograph, biometric data, or file is ever transmitted to or stored on our servers."
    },
    {
      q: "What does 300 DPI mean and why do embassies require it?",
      a: "300 DPI (Dots Per Inch) is the global standard resolution for high-clarity physical and biometric consular printing. Embassies and automated facial recognition gates require at least 300 DPI to avoid pixelation during barcode and facial feature scanning."
    },
    {
      q: "What is the 70–80% face coverage rule?",
      a: "Schengen, US DS-160, and UK visa specifications mandate that your face—from the bottom of your chin to the crown of your head—must occupy between 70% and 80% of the total vertical height of the photo. Our interactive dotted oval guide helps you align your face perfectly."
    },
    {
      q: "Can I wear eyeglasses or head coverings in the photo?",
      a: "Eyeglasses are strictly prohibited by the US Department of State and Schengen Consulates (even prescription glasses must be removed to prevent flash reflection). Religious head coverings are permitted only if they do not cast shadows over any part of your face or forehead."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2A5B] via-[#0B3D91] to-[#082247] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-blue-900">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>100% Private Client-Side Canvas • 300 DPI Export</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Visa Photo Resizer — Free Online
          </h1>
          <p className="text-base sm:text-lg text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Instantly crop, center, and resize your photo to exact consular specifications for Schengen (35x45mm), USA DS-160 (2x2 inch), and Passport sizes at 300 DPI. No server upload.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Main Resizer Tool Container */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Column: Preset Selector & Interactive Canvas Preview */}
            <div className="w-full md:w-1/2 flex flex-col items-center">
              {/* Preset Dropdown */}
              <div className="w-full mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Select Target Visa Photo Dimension *
                </label>
                <select
                  value={selectedPresetId}
                  onChange={(e) => setSelectedPresetId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-[#0B3D91] focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                >
                  {PHOTO_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Standard usage: {currentPreset.usage} ({currentPreset.widthPx300Dpi} × {currentPreset.heightPx300Dpi} px @ 300 DPI)
                </p>
              </div>

              {/* Photo Canvas & Oval Guide Frame */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-3 bg-slate-100 flex flex-col items-center justify-center min-h-[340px] w-full max-w-[340px] overflow-hidden shadow-inner">
                {imageSrc ? (
                  <div className="relative flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      className="border border-slate-300 shadow-md bg-white rounded-lg max-h-[300px] object-contain"
                    />

                    {/* 70-80% Face Biometric Guide Overlay */}
                    {showFaceGuide && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-[65%] h-[75%] border-2 border-dashed border-amber-400 rounded-[50%] opacity-85 shadow-sm flex items-center justify-center">
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-300/80 px-1.5 py-0.5 rounded-md">
                            Fit Face 70–80%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0B3D91] flex items-center justify-center mb-3">
                      <Upload className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-sm text-slate-900">Click to Upload Photo</span>
                    <span className="text-xs text-slate-500 mt-1">JPG or PNG (Up to 15 MB)</span>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full mt-2">
                      🔒 100% Private (Runs in Browser)
                    </span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Action Buttons Under Preview */}
              <div className="flex items-center gap-2 mt-4 w-full max-w-[340px]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{imageSrc ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                {imageSrc && (
                  <button
                    type="button"
                    onClick={() => setShowFaceGuide(!showFaceGuide)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer border ${
                      showFaceGuide 
                        ? 'bg-amber-100 border-amber-300 text-amber-900' 
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                    title="Toggle biometric face guide overlay"
                  >
                    {showFaceGuide ? 'Guide: ON' : 'Guide: OFF'}
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: Interactive Adjustment Sliders & Download */}
            <div className="w-full md:w-1/2 space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#0B3D91]" />
                  <span>Fine-Tune Alignment</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Adjust zoom, pan, and rotation to align eyes and chin inside the biometric oval frame.
                </p>
              </div>

              {/* Zoom Slider */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-[#0B3D91]" /> Zoom Scale
                  </span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.05"
                  value={zoom}
                  disabled={!imageSrc}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-[#0B3D91] cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Rotation Slider */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 text-[#0B3D91]" /> Straighten &amp; Rotate
                  </span>
                  <span>{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="1"
                  value={rotation}
                  disabled={!imageSrc}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full accent-[#0B3D91] cursor-pointer disabled:opacity-40"
                />
              </div>

              {/* Pan X and Y Sliders */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                    <span>Move Left / Right</span>
                    <span>{panX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    value={panX}
                    disabled={!imageSrc}
                    onChange={(e) => setPanX(parseInt(e.target.value))}
                    className="w-full accent-[#0B3D91] cursor-pointer disabled:opacity-40"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                    <span>Move Up / Down</span>
                    <span>{panY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-200"
                    max="200"
                    value={panY}
                    disabled={!imageSrc}
                    onChange={(e) => setPanY(parseInt(e.target.value))}
                    className="w-full accent-[#0B3D91] cursor-pointer disabled:opacity-40"
                  />
                </div>
              </div>

              {/* Reset Controls Button */}
              {imageSrc && (
                <button
                  type="button"
                  onClick={handleResetAdjustments}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset adjustments to default</span>
                </button>
              )}

              {/* Primary Download CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!imageSrc}
                  className="w-full py-4 bg-[#0B3D91] hover:bg-[#082e6d] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black text-base rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5 text-amber-300" />
                  <span>Resize &amp; Download (300 DPI JPG)</span>
                </button>
                <p className="text-center text-[11px] text-slate-500 mt-2">
                  Instant client-side export • Exact {currentPreset.widthMm} × {currentPreset.heightMm} mm @ 300 DPI
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Consular Visa Photo Rules Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Camera className="w-6 h-6 text-[#0B3D91]" />
            <h2 className="text-xl font-black text-slate-900">
              Mandatory Official Visa Photo Rules
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0B3D91] flex items-center justify-center font-black text-xs mb-2">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-1">Pristine White Background</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The backdrop must be pure plain white or light off-white without patterns, shadows, or objects behind your head.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center font-black text-xs mb-2">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-1">Strictly No Glasses</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eyeglasses, tinted spectacles, and sunglasses are prohibited to prevent flash reflections on eyes and iris glare.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs mb-2">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-1">70% to 80% Face Coverage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your head from chin to crown must cover between 70% and 80% of the photograph height, facing dead-center into lens.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs mb-2">
                4
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-1">Recent (Last 6 Months)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Photograph must reflect your current physical appearance, taken within the last 6 months with neutral facial expression.
              </p>
            </div>
          </div>
        </div>

        {/* Lead Magnet Bar: Join Free WhatsApp Channel + Email Newsletter + AdSense Banner */}
        <FreeLeadMagnetBar pageContext="Visa Photo Resizer Free Tool" adSlot="photo_resizer_banner" />

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-[#0B3D91]" />
            <h2 className="text-xl font-black text-slate-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-sm sm:text-base text-slate-900 bg-slate-50/50 hover:bg-slate-100/70 flex justify-between items-center gap-3 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
