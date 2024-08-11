import React from 'react';
import { Carousel } from 'react-bootstrap';

// WALMART end-point api - https://serpapi.com/search.json?engine=walmart&query=red+pants&api_key=be8c5fbaed043f1406288f002f5fff6d0c5eabd72cb9bf0b66be2d1ec004a3e5

const Cards = () => {
  const cloth = {
    name: 'Stylish Jacket',
    price: '$99.99',
    color: 'Red',
    images: [
      'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg', // replace with actual image paths
      'https://images.ctfassets.net/hrltx12pl8hq/01rJn4TormMsGQs1ZRIpzX/16a1cae2440420d0fd0a7a9a006f2dcb/Artboard_Copy_231.jpg?fit=fill&w=600&h=600',
      'https://imgv3.fotor.com/images/side/ai-generate-watercolor-fairy-from-text-with-Fotor-ai-image-generator.jpg',
    ],
  };

  return (
    <div className="card bg-dark" style={{ width: '18rem', margin: '20px' }}>
      <Carousel>
        {cloth.images.map((image, index) => (
          <Carousel.Item key={index}>
            <img
              className="d-block w-100"
              src={image}
              alt={`Slide ${index + 1}`}
              style={{ height: '250px', objectFit: 'cover' }}
            />
          </Carousel.Item>
        ))}
      </Carousel>

      <div className="card-body">
        <h5 className="card-title">{cloth.name}</h5>
        <p className="card-text">Price: {cloth.price}</p>
        <p className="card-text">Color: {cloth.color}</p>
        <button className='btn btn-sm btn-outline-light'>How Do I Look?</button>
        <button className='btn btn-sm btn-outline-primary' style={{marginLeft: '10px'}}>Buy</button>
      </div>
    </div>
  );
};

export default Cards;
