import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Hand, Camera, CameraOff, AlertCircle, Loader2, XCircle } from 'lucide-react';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';

interface GestureControllerProps {
  isSnowEnabled: boolean;
  setSnowEnabled: (enabled: boolean) => void;
}

const GestureController: React.FC<GestureControllerProps> = ({ isSnowEnabled, setSnowEnabled }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentGesture, setCurrentGesture] = useState<string>('None');
    
    // MediaPipe Refs
    const gestureRecognizerRef = useRef<GestureRecognizer | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const requestRef = useRef<number>();
    const lastVideoTimeRef = useRef<number>(-1);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsActive(false);
        setCurrentGesture('None');
        setIsLoading(false);
    }, []);

    const initializeMediaPipe = async () => {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm"
            );
            const recognizer = await GestureRecognizer.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 1
            });
            gestureRecognizerRef.current = recognizer;
            return true;
        } catch (e) {
            console.error("Failed to load MediaPipe:", e);
            setError("Failed to load AI model.");
            return false;
        }
    };

    const startCamera = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // 1. Initialize AI if needed
            if (!gestureRecognizerRef.current) {
                const success = await initializeMediaPipe();
                if (!success) {
                    setIsLoading(false);
                    return;
                }
            }

            // 2. Start Camera (Get Stream FIRST)
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: 320, 
                    height: 240, 
                    frameRate: 30,
                    facingMode: 'user'
                } 
            });
            
            streamRef.current = stream;
            
            // 3. Update State to render the Video Element
            setIsActive(true);
            // isLoading will be set to false in the useEffect once video is ready
            
        } catch (e) {
            console.error("Camera error:", e);
            setError("Camera access denied.");
            setIsLoading(false);
        }
    };

    // Effect to bind stream to video element once it exists
    useEffect(() => {
        if (isActive && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.onloadedmetadata = () => {
                setIsLoading(false);
                videoRef.current?.play();
                requestRef.current = requestAnimationFrame(predictWebcam);
            };
        }
    }, [isActive]);

    const drawSkeleton = (landmarks: any[], ctx: CanvasRenderingContext2D, width: number, height: number, color: string) => {
        ctx.clearRect(0, 0, width, height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;

        // Connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8],       // Index
            [0, 9], [9, 10], [10, 11], [11, 12],  // Middle
            [0, 13], [13, 14], [14, 15], [15, 16],// Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17]             // Palm
        ];

        // Draw Lines
        for (const [start, end] of connections) {
            const p1 = landmarks[start];
            const p2 = landmarks[end];
            ctx.beginPath();
            ctx.moveTo(p1.x * width, p1.y * height);
            ctx.lineTo(p2.x * width, p2.y * height);
            ctx.stroke();
        }

        // Draw Joints
        for (const point of landmarks) {
            ctx.beginPath();
            ctx.arc(point.x * width, point.y * height, 3, 0, 2 * Math.PI);
            ctx.fill();
        }
    };

    const predictWebcam = () => {
        if (!videoRef.current || !gestureRecognizerRef.current || !streamRef.current) return;
        
        const video = videoRef.current;
        if (video.videoWidth === 0 || video.videoHeight === 0) {
             requestRef.current = requestAnimationFrame(predictWebcam);
             return;
        }

        const nowInMs = Date.now();

        if (video.currentTime !== lastVideoTimeRef.current) {
            lastVideoTimeRef.current = video.currentTime;
            
            const results = gestureRecognizerRef.current.recognizeForVideo(video, nowInMs);
            
            // Draw Skeleton
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    const width = canvasRef.current.width;
                    const height = canvasRef.current.height;
                    
                    if (results.landmarks && results.landmarks.length > 0) {
                        const landmarks = results.landmarks[0];
                        const gesture = results.gestures.length > 0 ? results.gestures[0][0].categoryName : 'None';
                        
                        let color = 'rgba(255, 255, 255, 0.8)';
                        if (gesture === 'Open_Palm') color = '#4ade80'; // Green
                        if (gesture === 'Closed_Fist') color = '#f87171'; // Red

                        drawSkeleton(landmarks, ctx, width, height, color);
                    } else {
                        ctx.clearRect(0, 0, width, height);
                    }
                }
            }

            if (results.gestures.length > 0) {
                const category = results.gestures[0][0].categoryName;
                const score = results.gestures[0][0].score;
                
                if (score > 0.5) {
                    setCurrentGesture(category);
                    
                    if (category === 'Open_Palm') {
                        setSnowEnabled(true);
                    } else if (category === 'Closed_Fist') {
                        setSnowEnabled(false);
                    }
                }
            } else {
                setCurrentGesture('None');
            }
        }

        requestRef.current = requestAnimationFrame(predictWebcam);
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    // UI Rendering
    
    if (!isActive) {
        return (
            <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
                <button 
                    onClick={startCamera}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full transition-all shadow-lg active:scale-95 group"
                >
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Camera size={18} className="group-hover:scale-110 transition-transform"/>
                    )}
                    <span className="text-sm font-medium">
                        {isLoading ? 'Loading AI...' : 'Enable Gesture Control'}
                    </span>
                </button>
                {error && (
                    <div className="mt-2 bg-red-500/80 backdrop-blur-md text-white text-xs px-3 py-1 rounded-lg flex items-center gap-1">
                        <AlertCircle size={12} />
                        {error}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
             {/* Widget */}
             <div className="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 flex items-center gap-4 shadow-2xl transition-all">
                
                {/* Video Feed & Skeleton Overlay */}
                <div className="relative w-32 h-24 overflow-hidden rounded-lg bg-black border border-white/10">
                    <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted 
                        className="absolute inset-0 w-full h-full object-cover opacity-60" 
                        style={{ transform: 'scaleX(-1)' }} 
                    />
                    <canvas 
                        ref={canvasRef}
                        width={128}
                        height={96}
                        className="absolute inset-0 w-full h-full"
                        style={{ transform: 'scaleX(-1)' }}
                    />
                    
                    {/* Status Bar Indicator */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div 
                            className={`h-full transition-all duration-300 ${
                                currentGesture === 'Open_Palm' ? 'bg-green-500 w-full' :
                                currentGesture === 'Closed_Fist' ? 'bg-red-500 w-full' : 'w-0'
                            }`}
                        />
                    </div>
                </div>
                
                {/* Info & Instructions */}
                <div className="flex flex-col min-w-[100px]">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold">Detected</span>
                        <button 
                            onClick={stopCamera} 
                            className="text-white/40 hover:text-white transition-colors"
                            title="Turn off camera"
                        >
                            <CameraOff size={12} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2 h-6">
                        {currentGesture === 'Open_Palm' ? (
                             <div className="flex items-center gap-1.5 text-green-400 font-bold text-sm animate-pulse">
                                <Hand size={16} /> <span>Palm (ON)</span>
                             </div>
                        ) : currentGesture === 'Closed_Fist' ? (
                             <div className="flex items-center gap-1.5 text-red-400 font-bold text-sm animate-pulse">
                                <XCircle size={16} /> <span>Fist (OFF)</span>
                             </div>
                        ) : (
                             <span className="text-white/60 text-xs italic">...waiting...</span>
                        )}
                    </div>

                    {/* Instruction Mini-badges */}
                    <div className="flex gap-2 text-[10px] text-white/50">
                        <div className={`px-1.5 py-0.5 rounded border ${isSnowEnabled ? 'bg-green-500/20 border-green-500/50 text-green-200' : 'border-white/10'}`}>
                           🖐 Open
                        </div>
                        <div className={`px-1.5 py-0.5 rounded border ${!isSnowEnabled ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'border-white/10'}`}>
                           ✊ Fist
                        </div>
                    </div>
                </div>
             </div>
        </div>
    );
}

export default GestureController;