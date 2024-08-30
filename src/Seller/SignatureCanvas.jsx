import React, { useRef, useState } from 'react';

const SignatureCanvas = ({ onSignatureReceive }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const { offsetX, offsetY } = e.nativeEvent;
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        const dataURL = canvas.toDataURL('image/png');
        onSignatureReceive(dataURL); // Send the dataURL to parent component
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
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
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
