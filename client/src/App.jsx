import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Camera from './components/Camera';
import { UserContext } from './components/UserContext';
import Cards from './components/Cards';
import colors from './colors'; // Update the path accordingly

const App = () => {
  const { uploadedFileURL } = useContext(UserContext);

  const [size, setSize] = useState('-');
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [age, setAge] = useState(0);

  const [colorTone, setColorTone] = useState('-');
  const [gender, setGender] = useState('-');
  const [products, setProducts] = useState([]);

  const handlePredict = async () => {
    try {
      // Predict size
      const sizeResponse = await axios.post('http://127.0.0.1:5000/predict_size', {
        height, weight, age
      });
      setSize(sizeResponse.data.predicted_size);

      // Predict skin tone
      const skinToneResponse = await axios.post('http://127.0.0.1:5000/predict_skin_tone', {
        image_path: uploadedFileURL
      });
      setColorTone(skinToneResponse.data.predicted_skin_tone);

      // Predict gender
      const genderResponse = await axios.post('http://127.0.0.1:5000/predict_gender_age', {
        image_path: uploadedFileURL
      });
      setGender(genderResponse.data[0].gender);

    } catch (error) {
      console.error('Error during predictions:', error.message);
    }
  };

  const fetchProducts = async (skinTone) => {
    const apiKey = 'be8c5fbaed043f1406288f002f5fff6d0c5eabd72cb9bf0b66be2d1ec004a3e5';
    const colorsForTone = colors[skinTone] || [];
    
    // Limit to first 4 colors
    const limitedColors = colorsForTone.slice(0, 4);
  
    // Select a random color from the limited colors
    const randomColor = limitedColors[Math.floor(Math.random() * limitedColors.length)];
  
    // Replace spaces with '+' in the color name for the query
    const formattedColor = randomColor.replace(/ /g, '+');
    const colorQuery = `${formattedColor}+pant`;

    try {
      // Make the API request with the color query directly
      const response = await axios.post(`http://127.0.0.1:5000/fetch_products`, {
        skin_tone : skinTone,
        color: formattedColor,
        gender: gender
      });
      console.log('Response data:', response.data.products.organic_results); // Log the response for debugging
      setProducts(response.data.products.organic_results);
    } catch (error) {
      console.error('Error fetching products:', error); // Log the error message
    }
  };

  // Use useEffect to fetch products when colorTone changes
  useEffect(() => {
    if (colorTone !== '-') {
      fetchProducts(colorTone);
    }
  }, [colorTone]);

  return (
    <div className='bg-dark' style={{ height: '100vh', width: '100vw', color: 'white' }}>
      <h2 className='d-flex justify-content-center pt-4'>Walmart Clothes Recommendation</h2>
      <div className="row d-flex justify-content-center align-items-center px-4" style={{ height: '90vh' }}>
        <div className="col-md-6" style={{ borderRight: '1px solid white' }}>
          <Camera />
          <div className='mt-3' style={{ width: '500px' }}>
            <h6>Calculate Size</h6>
            <div className="d-flex" style={{ width: '500px' }}>
              <input type="text" className='mx-1 form-control bg-dark' style={{ fontWeight: 600, color: 'white' }} placeholder='Age (yr)' onChange={(e) => setAge(e.target.value)} />
              <input type="text" className='mx-1 form-control bg-dark' style={{ fontWeight: 600, color: 'white' }} placeholder='Weight (kg)' onChange={(e) => setWeight(e.target.value)} />
              <input type="text" className='mx-1 form-control bg-dark' style={{ fontWeight: 600, color: 'white' }} placeholder='Height (cm)' onChange={(e) => setHeight(e.target.value)} />
            </div>
            <button className="btn btn-outline-primary btn-sm mt-3" style={{ width: '100%' }} onClick={handlePredict}>Predict</button>
          </div>
        </div>
        <div className="col-md-4" style={{ paddingLeft: '120px' }}>
          <h4>Recommendations : <span style={{ marginLeft: '78px' }}><button className="btn-outline-light btn-sm btn">How do I look?</button></span></h4>
          <hr style={{ height: '2px', backgroundColor: 'white' }} />
          <div className="" style={{ fontWeight: 600, color: 'white' }}>
            <div className="d-flex justify-content-between">
              Color Tone: <span>{colorTone}</span>
            </div>
            <hr style={{ height: '1px', backgroundColor: 'white' }} />
            <div className="d-flex justify-content-between">
              Gender: <span>{gender}</span>
            </div>
            <hr style={{ height: '1px', backgroundColor: 'white' }} />
            <div className="d-flex justify-content-between">
              Size: <span>{size}</span>
            </div>
            <hr style={{ height: '1px', backgroundColor: 'white' }} />
            <div className="d-flex justify-content-between">
              Recommended colors: <span>{colors[colorTone]?.slice(0, 4).join(', ') || 'N/A'}</span>
            </div>
            <hr style={{ height: '1px', backgroundColor: 'white' }} />
            <div className="d-flex flex-column">
              <div className="">Recommended Products:</div>
              <div className='border d-flex flex-column align-items-center' style={{ borderRadius: '10px', padding: '10px', marginTop: '10px', height: '400px', overflow: 'scroll' }}>
                <Cards products={products} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
