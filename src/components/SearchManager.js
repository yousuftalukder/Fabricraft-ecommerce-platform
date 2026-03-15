import React, { useContext, useState, useEffect, useRef } from "react";
import { debounce } from 'lodash';

import Axios from 'axios';
import { useQuery } from 'react-query';

import { useNavigate } from 'react-router-dom';

import { CustomImage } from "./CustomImage";

import { AuthContext } from '../contexts/AuthContext';


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



function SearchManager() {  
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  const [allProducts, setAllProducts] = useState((JSON.parse(localStorage.getItem('FABRICRAFT_ALL_PRODUCTS')) || []));

  const [productList, setProductList] = useState([]);
  const [searchBoxText, setSearchBoxText] = useState("");

  const delayedSearchRef = useRef(null);
 
  const searchProducts = async (searchText) => {
    const searchKeyLower = searchText.toLowerCase();
  
    const products = allProducts.filter(product => 
      product.product_name.toLowerCase().includes(searchKeyLower)
    );
    setProductList(products);

    if (searchText.trim() !== '') {
      metaPixelEvents.searchPixelEvent(searchText);
    }
  }

  const fetchProducts = async () => {
    const productCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productCollection);
    const products = productSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    localStorage.setItem('FABRICRAFT_ALL_PRODUCTS', JSON.stringify(products));
    setAllProducts(products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!delayedSearchRef.current) {
      delayedSearchRef.current = debounce((searchText) => {
        searchProducts(searchText);
      }, 600);
    }
    return () => {
      delayedSearchRef.current.cancel();
    };
  }, []); 

  const handleInputChange = (e) => {
    const searchText = e.target.value;
    setSearchBoxText(searchText);
    delayedSearchRef.current(searchText); 
  };

  useEffect(() => {
    metaPixelEvents.searchPixelEvent();
  }, []);

  const isStockOut = (stock_string) => {
    const stock = JSON.parse(stock_string);
    return Object.values(stock).every(quantity => quantity === 0);
  }

  return (
    <div className="homepage-container">

        <div className="search-input-bar">
            <i className="fa fa-search search-input-icon" aria-hidden="true"></i>
            <input
                type="text"
                className="search-input"
                placeholder="Search For Products"
                value={searchBoxText}
                onChange={handleInputChange}
            />
        </div>

        <div className="search-product-card-container"> 
        {(productList && productList.length > 0) ? 
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
            }) :
            (<div className="no-product-found">Searched Products</div>)
        }
        </div>
        
        <br /><br /><br />
    </div>
  );
}

export default SearchManager;