import React, { useRef, useState, useContext } from "react";
import { UserContext } from "./UserContext";
import axios from "axios";

const CameraComponent = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [frozen, setFrozen] = useState(false);

  const { setUploadedFileURL } = useContext(UserContext);

  const startCamera = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      } catch (err) {
        console.error("Error accessing the camera", err);
      }
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    videoRef.current.srcObject = null;
  };

  const toggleCamera = () => {
    if (cameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
    setCameraOn(!cameraOn);
  };

  const takePhoto = () => {
    const width = videoRef.current.videoWidth;
    const height = videoRef.current.videoHeight;

    canvasRef.current.width = width;
    canvasRef.current.height = height;

    const ctx = canvasRef.current.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, width, height);

    const imageData = canvasRef.current.toDataURL("image/png");
    setPhoto(imageData);

    setFrozen(true);
    stopCamera();

    uploadImage(imageData);
  };

  const retakePhoto = () => {
    setPhoto(null);
    setFrozen(false);
    startCamera();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhoto(e.target.result);
      setFrozen(true);

      uploadImage(e.target.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (imageData) => {
    if(cameraOn){
      stopCamera();
    }
    try {
      const formData = new FormData();
      const file = dataURLtoBlob(imageData);
      formData.append("image", file, "photo_"+Date.now()+".png");

      const response = await axios.post(
        "http://127.0.0.1:5000/upload_image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const { url } = response.data;
      setUploadedFileURL(url);
    } catch (error) {
      console.error("Error uploading the image", error);
    }
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  return (
    <>
      <div
        className="camera-container"
        style={{
          position: "relative",
          width: "500px",
          height: "400px",
          backgroundColor: "black",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {cameraOn ? (
          <div className="camera-preview">
            <video
              ref={videoRef}
              style={{ width: "100%", height: "80%", objectFit: "cover" }}
              autoPlay
            ></video>
          </div>
        ) : (
          <div
            className="camera-off d-flex justify-content-center align-items-center"
            style={{ width: "100%", height: "100%" }}
          >
            {!photo && (
              <button className="btn btn-light" onClick={toggleCamera}>
                📷 Turn On Camera
              </button>
            )}
          </div>
        )}

        {photo && (
          <div
            className="photo-preview"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <img
              src={photo}
              alt="Captured"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
            <button
              onClick={retakePhoto}
              className="btn btn-warning position-absolute"
              style={{
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              Retake
            </button>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      </div>

      <div
        className="d-flex justify-content-between mt-3"
        style={{ width: "500px" }}
      >
        {cameraOn && (
          <>
            <button
              onClick={toggleCamera}
              className="btn btn-primary btn-sm"
              disabled={photo}
            >
              {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
            </button>
            <button
              onClick={takePhoto}
              className="btn btn-success btn-sm"
              disabled={!cameraOn || frozen}
            >
              Take Photo
            </button>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="d-none"
        />
        <div className="d-flex justify-content-center" style={{width: '100%'}}>
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              } else {
                console.error("fileInputRef is not assigned.");
              }
            }}
            className="btn btn-info btn-sm"
            >
            Upload Photo
          </button>
          </div>
      </div>
    </>
  );
};

export default CameraComponent;
