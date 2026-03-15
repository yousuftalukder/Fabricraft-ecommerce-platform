import '../assets/styles/ProductManager.css';

import React, { useState, useEffect, useContext, useCallback } from "react";
import { Blurhash } from "react-blurhash";

import PoloShirtIcon from '../assets/images/polo.png';
import ShirtIcon from '../assets/images/shirt.png';
import TrouserIcon from '../assets/images/trouser.png';
import ShortsIcon from '../assets/images/shorts.png';
import GraphicTshirtIcon from '../assets/images/graphic-tees.png';
import TshirtIcon from '../assets/images/tees.png';
import AccessoriesIcon from '../assets/images/accessories.png';
import OfferIcon from '../assets/images/offer.png';

import Axios from 'axios';
import { useQuery } from 'react-query';

import { CustomImage } from "./CustomImage";
import BannerSlider from "./BannerSlider";

import { useNavigate } from 'react-router-dom';

import { DataContext } from '../contexts/DataContext';



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


function Home() {
  const navigate = useNavigate();

  const {dataContextData}  = useContext(DataContext);
  const { setWishlistItemCount, setCartItemCount } = dataContextData;

  const [categoryProducts, setCategoryProducts] = useState(
    {
      "casual-shirt" : {
        "product-list" : [],
        "name": "Premium Casual Shirt",
        "two_in_a_row": true,
        "banner": {
          "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/category%20banner%20-%20shirt.png?alt=media&token=3c6eaf3e-14e6-433c-8b19-109bbfd224a5",
          "blurhash": "CFHowNnT?]WFyVajDhog"
        }
      },
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
        "two_in_a_row": true,
        "banner": {
          "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/hoodie%20banner.png?alt=media&token=ad6f390c-e92d-4611-94ea-18a8118775e9",
          "blurhash": "CKKLK*00~qRi55RQ8{t7"
        }
      },
    }
  );

  const [banners, setBanners] = useState([
    {
      "blurhash": "CXD,D#RjxVt7~qWBxuof",
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/STYLEMUSE.png?alt=media&token=48e042e5-5feb-4d0c-a2b2-8536fa244906"
    },
    {
      "blurhash": "CBDu;^^j025T~VxuI=jY",
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/shirt-banner-redblack.png?alt=media&token=31afdf42-42c1-4440-ab42-eaf65fa0dc82"
    },
    {
      "blurhash": "CKKLHw00~qRi4.RQ8{t7",
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/hoodie%20banner.png?alt=media&token=ad6f390c-e92d-4611-94ea-18a8118775e9"
    },
    {
      "blurhash": "CKKLHw00~qRi4.RQ8{t7",
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/shirt-banner-ash.png?alt=media&token=d914a0d9-0fb4-4528-9cdf-81f7fbbbd5f0"
    },
  ]);

  const [homeCards, setHomeCards] = useState({
    "casual-shirt": {
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/casual-shirt-icon.png?alt=media&token=a8aca551-6a69-4238-9319-b62230f9bdf2",
      "blurhash": "UAAudyj[0cay#Xf7KJfQ1Da|}IfQEefQ$+j["
    },
    "sweatshirt": {
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/sweat-shirt-icon.png?alt=media&token=1625e2b5-4338-4906-8da2-0be28f44b016",
      "blurhash": "UE69kLj]HXj@OtayZ}ayUbjtu6j[Q,fPpJfR"
    },
    "hoodie": {
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/hoodie-icon.png?alt=media&token=cf99f27d-3169-4058-8013-02412cdeaed7",
      "blurhash": "UC3J.Rj[Q8j?Ipa|s*ayvJfPX=j[XAfQjrfQ"
    }
  });

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
    metaPixelEvents.homePagePixelEvent();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isStockOut = (stock_string) => {
    const stock = JSON.parse(stock_string);
    return Object.values(stock).every(quantity => quantity === 0);
  }
  
  return (
    <div className="homepage-container">

      <div className="search-bar" onClick={() => navigate("search")}>
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </div>

      <div className="banner">
        <BannerSlider slides={banners}/>
      </div>

      <div className="categories-container1">
        <div className="category-card" onClick={() => navigate("category/casual-shirt")}>
          <CustomImage 
            imageUrl={homeCards["casual-shirt"].url}
            altText={""}
            blurHash={homeCards["casual-shirt"].blurhash}
            width={"80px"}
            height={"80px"}
            blurHashWidth={"80px"}
            blurHashHeight={"80px"}
            borderRadius={"10px"}/>
        </div>
        <div className="category-card" onClick={() => navigate("category/sweatshirt")}>
          <CustomImage 
            imageUrl={homeCards["sweatshirt"].url}
            altText={""}
            blurHash={homeCards["sweatshirt"].blurhash}
            width={"80px"}
            height={"80px"}
            blurHashWidth={"80px"}
            blurHashHeight={"80px"}
            borderRadius={"10px"}/>
        </div>
        <div className="category-card" onClick={() => navigate("category/hoodie")}>
          <CustomImage 
            imageUrl={homeCards["hoodie"].url}
            altText={""}
            blurHash={homeCards["hoodie"].blurhash}
            width={"80px"}
            height={"80px"}
            blurHashWidth={"80px"}
            blurHashHeight={"80px"}
            borderRadius={"10px"}/>
        </div>
        <div className="category-card category-card-offer" onClick={() => navigate("offers")}>
          <img src={OfferIcon} alt="Offer"/>
          <p>Offer</p>
        </div>
      </div>

      {
        Object.entries(categoryProducts).map(([category, details]) => (
          <div className="category-product-list" key={category}>
            <div className="category-description"> 
              <h2 className="category-title">{details.name}</h2>
              <div className="category-cover" onClick={() => navigate(`/category/${category}`)}>
                <CustomImage 
                  imageUrl={details.banner.url}
                  altText={""}
                  blurHash={details.banner.blurhash}
                  width={"100%"}
                  height={"190px"}
                  blurHashWidth={"100%"}
                  blurHashHeight={"190px"}
                  borderRadius={"10px"}
                />
              </div>
            </div>
            
            <div className="product-card-container">        
              {
                details.two_in_a_row 
                ? (details["product-list"].map((product, index) => (
                    <div 
                      key={index} 
                      className="product-two-card" 
                      onClick={() => {navigate(`/product/${product.product_id}`, { state: product })}}
                    >
                      <div className="product-two-image">
                        <CustomImage 
                          imageUrl={product.product_photos[0].url}
                          altText={product.product_name}
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
                  )))
                : (details["product-list"].map((product, index) => (
                    <div 
                      key={index} 
                      className="product-three-card" 
                      onClick={() => {navigate(`/product/${product.product_id}`, { state: product })}}
                    >
                      <div className="product-three-image">
                        <CustomImage 
                          imageUrl={product.product_photos[0].url}
                          altText={product.product_name}
                          blurHash={product.product_photos[0].blurHash}
                          width={"100%"}
                          height={"100px"}
                          blurHashWidth={"100%"}
                          blurHashHeight={"100px"}
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
                        <div className="discount-percentage discount-font-three">{product.product_discount_percentage}% off</div>
                      </div>
                    </div>
                  )))
              }
            </div>
          </div>
        ))
      }

      <br /><br /><br />
    </div>
  );
}

export default Home;