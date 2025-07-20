// App.jsx
import React, { useEffect, useRef } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    };

    const loadModelAndDetect = async () => {
      const detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);

      const detect = async () => {
        if (
          videoRef.current &&
          videoRef.current.readyState === 4
        ) {
          const poses = await detector.estimatePoses(videoRef.current);
          drawPose(poses);
        }
        requestAnimationFrame(detect);
      };

      detect();
    };

    const drawPose = (poses) => {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (poses.length > 0) {
        for (let kp of poses[0].keypoints) {
          if (kp.score > 0.5) {
            ctx.beginPath();
            ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'lime';
            ctx.fill();
          }
        }
      }
    };

    setupCamera().then(loadModelAndDetect);

    return () => {
      // Cleanup
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ textAlign: 'center', position: 'relative' }}>
      <h1>Posey: Pose Detection App</h1>
      <video
        ref={videoRef}
        width="640"
        height="480"
        style={{ borderRadius: 10 }}
        muted
        autoPlay
        playsInline
      />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        style={{
          position: 'absolute',
          top: 120,
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
}

export default App;
