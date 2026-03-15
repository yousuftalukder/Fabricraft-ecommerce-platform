import React, { useState, useEffect } from "react";

import Axios from 'axios';
import { useQuery } from 'react-query';

import { useNavigate, Link, useParams } from 'react-router-dom';

import { CustomImage } from "./CustomImage";


import { db, storage } from '../firebaseConfig'; 
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query, where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import * as metaPixelEvents from "../utils/MetaPixelEvent";


const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

function ShopProducts() {  
  const navigate = useNavigate();
  const { query } = useParams(); 
  
  const [productList, setProductList] = useState((JSON.parse(localStorage.getItem('FABRICRAFT_ALL_PRODUCTS')) || []));
  const [searchOnGoing, setSearchOnGoing] = useState(false);

  const fetchProducts = async () => {
    const productCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productCollection);
    const products = productSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    const shuffledProducts = products.sort(() => Math.random() - 0.5);

    localStorage.setItem('FABRICRAFT_ALL_PRODUCTS', JSON.stringify(shuffledProducts));
    setProductList(shuffledProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  useEffect(() => {
    metaPixelEvents.ShopPagePixelEvent();
  }, []);

  const isStockOut = (stock_string) => {
    const stock = JSON.parse(stock_string);
    return Object.values(stock).every(quantity => quantity === 0);
  }

  return (
    <div className="homepage-container">

      <Link to="/search" className="search-bar">
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </Link>

      {searchOnGoing && (<div class="lds-ripple"><div></div><div></div></div>)}

      <h2 className="category-title">Shop</h2>

      <div className="search-product-card-container"> 
        {
            productList.map((product) => {
                return (
                    <div className="search-product-card" onClick={() => {navigate(`/product/${product.product_id}`, {'state':product})}}>
                        <div className="search-product-image">
                          <CustomImage 
                            imageUrl={product.product_photos[0].url}
                            altText={""}
                            blurHash={product.product_photos[0].blurHash}
                            width={"100%"}
                            height={"150px"}
                            blurHashWidth={"100%"}
                            blurHashHeight={"150px"}
                            borderRadius={"5px"}
                          />
                          {isStockOut(product.product_stock) && (
                            <div className="stockout-overlay">
                              <span className="stockout-overlay-text">Out Of Stock</span>
                            </div>
                          )}
                        </div>
                        <h3 className="product-name">{product.product_name}</h3>
                        <div className="product-prices">
                        <span className="discount-price">৳{product.product_discount_price}</span>
                        <span className="real-price">৳{product.product_price}</span>
                        <div className="discount-percentage discount-font-two">{product.product_discount_percentage}% off</div>
                        </div>
                    </div>
                );
            })
          }
        </div>
        
        <br /><br /><br />
    </div>
  );
}

export default React.memo(ShopProducts);