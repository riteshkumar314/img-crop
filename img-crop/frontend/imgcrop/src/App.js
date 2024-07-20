import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faUser, faUserTag, faVenusMars } from '@fortawesome/free-solid-svg-icons';
import './App.css';
import Banner from './Banner.webp';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [cropper, setCropper] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [croppedImage, setCroppedImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const cropperRef = useRef(null);

  const handleImageChange = (file) => {
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setShowUploadModal(false);
    setShowCropModal(true);
  };

  const handleImageUpload = () => {
    cropImage().then(blob => {
      if (blob) {
        const formData = new FormData();
        formData.append('image', blob, 'cropped-image.jpg');

        axios.post('http://localhost:5000/upload', formData)
          .then(response => {
            toast.success('Image uploaded successfully!');
            fetchImages();
            setSelectedImage(null);
            setImagePreview('');
            setShowCropModal(false);
          })
          .catch(error => {
            toast.error('Error uploading image');
            console.error('Error uploading image:', error);
          });
      } else {
        toast.error('No cropped image to upload');
        console.error('No cropped image to upload');
      }
    });
  };

  const fetchImages = () => {
    axios.get('http://localhost:5000/images')
      .then(response => {
        setImages(response.data);
      })
      .catch(error => {
        toast.error('Error fetching images');
        console.error('Error fetching images:', error);
      });
  };

  const cropImage = () => {
    return new Promise((resolve) => {
      if (cropper) {
        cropper.getCroppedCanvas().toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg');
      } else {
        resolve(null);
      }
    });
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const lastImage = images.length > 0 ? images[images.length - 1] : null;

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      handleImageChange(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: 'image/*'
  });

  return (
    <div className="App">
      <ToastContainer />
      <img src={Banner} className='banner-img' alt="Banner" />
      <div className='d-flex justify-content-between'>
        <div className="uploaded-image">
          {lastImage && (
            <img
              src={`http://localhost:5000/${lastImage.imagePath}`}
              alt="Uploaded"
            />
          )}
        </div>
        <div className="file-upload">
          <Button onClick={() => setShowUploadModal(true)}>
            <FontAwesomeIcon icon={faUpload} /> Update Profile
          </Button>
          {selectedImage && <span>{selectedImage.name}</span>}
        </div>
      </div>
      <div className="profile">
        <div className="name">
          <h2>Ritesh Kumar</h2>
        </div>
        <div className="user-info">
          <p className="username"><FontAwesomeIcon icon={faUser} /> @RiteshKumar..</p>
          <p className="role"><FontAwesomeIcon icon={faUserTag} /> MERN Developer @ WEBFLOW</p>
          <p className="pronouns"><FontAwesomeIcon icon={faVenusMars} /> <i>He/Him</i></p>
        </div>
      </div>

      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Choose a file</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            {...getRootProps({
              className: `dropzone ${isDragActive ? 'dragover' : ''}`
            })}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag & drop some files here, or click to select files</p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={() => setShowUploadModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showCropModal} onHide={() => setShowCropModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crop Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {imagePreview && (
            <Cropper
              src={imagePreview}
              style={{ height: 400, width: '100%' }}
              initialAspectRatio={1}
              aspectRatio={1}
              guides={false}
              crop={cropImage}
              ref={cropperRef}
              onInitialized={(instance) => setCropper(instance)}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCropModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleImageUpload}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default App;
