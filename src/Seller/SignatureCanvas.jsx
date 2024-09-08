import React, { useRef, useState } from 'react';

const SignatureCanvas = ({ onSignatureReceive }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

    // Helper function to get the touch position relative to the canvas
    const getTouchPos = (canvas, touchEvent) => {
        const rect = canvas.getBoundingClientRect();
        return {
            x: touchEvent.touches[0].clientX - rect.left,
            y: touchEvent.touches[0].clientY - rect.top
        };
    };

    // Start drawing (called on both mouse down and touch start)
    const startDrawing = (e) => {
        e.preventDefault(); // Prevent scrolling or other default touch behaviors
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();

        let position;
        if (e.type === 'mousedown') {
            position = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        } else {
            position = getTouchPos(canvas, e);
        }

        ctx.moveTo(position.x, position.y);
        setLastPosition(position);
        setIsDrawing(true);
    };

    // Continue drawing as the user moves the mouse or finger
    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault(); // Prevent default touch behaviors

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        let newPosition;
        if (e.type === 'mousemove') {
            newPosition = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
        } else {
            newPosition = getTouchPos(canvas, e);
        }

        ctx.lineTo(newPosition.x, newPosition.y);
        ctx.stroke();
        setLastPosition(newPosition);
    };

    // Stop drawing (on mouse up or touch end)
    const stopDrawing = (e) => {
        e.preventDefault();
        setIsDrawing(false);
    };

    // Clear the canvas
    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Save the signature as a data URL and send it to the parent component
    const saveSignature = () => {
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        onSignatureReceive(dataURL);
    };

    return (
        <div className="relative flex flex-col items-center bg-white p-4 shadow-md rounded-lg max-w-xs mx-auto">
            <canvas
                ref={canvasRef}
                width="300"
                height="150"
                className="border border-gray-300 mb-4"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ touchAction: 'none' }} // Disable the default touch action (to prevent zooming, scrolling)
            ></canvas>
            <div className="flex space-x-2">
                <button onClick={clearSignature} className="bg-red-500 text-white px-4 py-2 rounded">
                    Clear
                </button>
                <button onClick={saveSignature} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Save Signature
                </button>
            </div>
        </div>
    );
};

export default SignatureCanvas;
