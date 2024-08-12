import React from 'react';
import { Carousel } from 'react-bootstrap';

// WALMART end-point api - https://serpapi.com/search.json?engine=walmart&query=red+pants&api_key=be8c5fbaed043f1406288f002f5fff6d0c5eabd72cb9bf0b66be2d1ec004a3e5



// Assuming `product` contains `name`, `price`, `image`, etc.


const Cards = ({ products }) => {
  return (
    <Carousel>
      {products.map((product, index) => (
        <Carousel.Item key={index}>
          <div className="card bg-dark text-white" style={{ width: '18rem', margin: '20px', borderRadius: '10px' }}>
            <img
              className="card-img-top"
              src={product.thumbnail}
              alt={product.title}
              style={{ height: '180px', objectFit: 'cover' }}
            />
            <div className="card-body">
              <h5 className="card-title" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{product.title}</h5>
              <p className="card-text" style={{ fontSize: '1.1rem' }}>Price: ${product.primary_offer.offer_price.toFixed(2)}</p>
              <a href={product.product_page_url} className="btn btn-outline-light btn-sm">View Product</a>
            </div>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default Cards;
