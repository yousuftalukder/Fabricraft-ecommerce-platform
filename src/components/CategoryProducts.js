import React, { useState, useEffect } from "react";

import Axios from 'axios';
import { useQuery } from 'react-query';

import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';

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


function CategoryProducts() {  
  const navigate = useNavigate();
  const { categorySlug } = useParams(); 
  
  const [categoryProducts, setCategoryProducts] = useState(
    {
      "sweatshirt" : {
        "product-list" : [],
        "name": "Mans Sweatshirt",
        "two_in_a_row": true,
        "banner": {
          "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/category-banner-2.png?alt=media&token=fd9f2303-c6b7-47de-b629-12c956aec9cd",
          "blurhash": "CmK-g]}*IUIW5rslspo0"
        }
      },
      "hoodie" : {
        "product-list" : [],
        "name": "Hoodies",
        "two_in_a_row": false,
        "banner": {
          "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/hoodie%20banner.png?alt=media&token=ad6f390c-e92d-4611-94ea-18a8118775e9",
          "blurhash": "CKKLK*00~qRi55RQ8{t7"
        }
      },
      "casual-shirt" : {
        "product-list" : [],
        "name": "Premium Casual Shirt",
        "two_in_a_row": true,
        "banner": {
          "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/category%20banner%20-%20shirt.png?alt=media&token=3c6eaf3e-14e6-433c-8b19-109bbfd224a5",
          "blurhash": "CFHowNnT?]WFyVajDhog"
        }
      },
    }
  );

  const [allProducts, setAllProducts] = useState((JSON.parse(localStorage.getItem('FABRICRAFT_ALL_PRODUCTS')) || []));

  const fetchProducts = async () => {
    const productCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productCollection);
    const productList = productSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    localStorage.setItem('FABRICRAFT_ALL_PRODUCTS', JSON.stringify(productList));
    setAllProducts(productList);
  };

  const updateCategoryProductList = (category, newProductList) => {
    setCategoryProducts((prevCategoryProducts) => ({
      ...prevCategoryProducts,
      [category]: {
        ...prevCategoryProducts[category],
        "product-list": newProductList,
      },
    }));
    console.log("categoryProducts:",categoryProducts);
  };
  
  const groupProductsByCategory = () => {
    const groupedProducts = allProducts.reduce((acc, product) => {
      const category = product.product_category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
  
    Object.entries(groupedProducts).forEach(([category, productList]) => {
      updateCategoryProductList(category, productList);
    });
  };

  
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    groupProductsByCategory();
  }, [allProducts]);

  
  useEffect(() => {
    metaPixelEvents.categoryProductsPagePixelEvent(categorySlug);
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

      <h2 className="category-title">
        {categoryProducts[categorySlug]["name"]}
      </h2>

      <div className="search-product-card-container"> 
        {categoryProducts[categorySlug]["product-list"].map((product, index) => {
                return (
                    <div className="search-product-card" key={product.product_id} onClick={() => {navigate(`/product/${product.product_id}`, {'state':product})}}>
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

export default CategoryProducts;