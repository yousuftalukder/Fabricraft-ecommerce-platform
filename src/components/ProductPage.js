import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";
import ImageSlider from "./ImageSlider";

import { useQuery } from 'react-query';
import Axios from 'axios';

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



function ProductPage() {    
  const navigate = useNavigate();     
  const { productId } = useParams(); 

  const { state } = useLocation();

  const {dataContextData}  = useContext(DataContext);
  const { setCartItemCount, setWishlistItemCount } = dataContextData;

  const [currentProduct, setCurrentProduct] = useState({});

  const [selectedSize, setSelectedSize] = useState("-");
  const [sizeNotSelected, setSizeNotSelected] = useState(false);
  const [selectedSizeInCart, setSelectedSizeInCart] = useState(false);

  useEffect(() => {
    if(currentProduct && currentProduct.product_id) {
      metaPixelEvents.productViewPixelEvent(currentProduct);
    }
  }, [currentProduct]);
  
  useEffect(() => {
    if(state) {
      setCurrentProduct(state);
    }
  }, [state]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [allProductList, setAllProductList] = useState((JSON.parse(localStorage.getItem('FABRICRAFT_ALL_PRODUCTS')) || []));

  const fetchProducts = async () => {
    const productCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productCollection);
    const products = productSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    localStorage.setItem('FABRICRAFT_ALL_PRODUCTS', JSON.stringify(products));
    setAllProductList(products);
  };

  const updateCurrentProduct = () => {
    const product = allProductList.find((p) => p.product_id == productId);
    console.log("found product: ", product);
    if(product) {
      setCurrentProduct(product);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    updateCurrentProduct();
  }, [allProductList]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 200);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // ====================================================
  // Wish List
  // ====================================================
  const [wishlistProducts, setWishlistProducts] = useState((JSON.parse(localStorage.getItem('FABRICRAFT_WISHLIST'))) || []);
  const [productIsInWishList, setProductIsInWishList] = useState(false);

  const addToWishList = async () => {
    console.log("wishlistButtonClicked");

    if(productIsInWishList) {
      const updatedWishlist = wishlistProducts.filter(item => (item.product.product_id !== currentProduct.product_id));
      localStorage.setItem('FABRICRAFT_WISHLIST', JSON.stringify(updatedWishlist));
      setWishlistProducts(updatedWishlist);
    }
    else {
      const updatedWishlist = [...wishlistProducts, {'product':currentProduct, }];

      localStorage.setItem('FABRICRAFT_WISHLIST', JSON.stringify(updatedWishlist));
      setWishlistProducts(updatedWishlist);

      try {
        metaPixelEvents.addToWishlistPixelEvent(currentProduct);
      } 
      catch (ex) {
        console.log("Meta pixel event triggering exception:", ex);
      }
    }
  }

  useEffect(() => {
    for (const wishListItem of wishlistProducts) {
      if (wishListItem.product.product_id === currentProduct.product_id) {
        setProductIsInWishList(true);
        return;
      }
    }
    setProductIsInWishList(false);
  }, [wishlistProducts, currentProduct]);

  useEffect(() => {
    if(wishlistProducts && wishlistProducts.length > 0) {
      setWishlistItemCount(wishlistProducts.length);
    }
  }, [wishlistProducts]);

  // ============================
  // Cart List
  // ============================
  const [cartProducts, setCartProducts] = useState([]);
  
  useEffect(() => {
    for(const item of cartProducts) {
      if(item.product.product_id === currentProduct.product_id && item.size === selectedSize) {
        setSelectedSizeInCart(true);
        return;
      }
    }
    setSelectedSizeInCart(false);
  }, [selectedSize, cartProducts, currentProduct]);

  useEffect(() => {
    const localCartlist = JSON.parse(localStorage.getItem('FABRICRAFT_CARTLIST'));
    console.log("localCartlist inited:", localCartlist);

    if(localCartlist && localCartlist.length > 0) {
      setCartProducts(localCartlist);
    }
  }, []);

  const addToCart = () => {
    if(selectedSize === "-") {
      window.scrollTo({
        top: 260,
        behavior: 'smooth'
      });
      if(!sizeNotSelected) {
        setSizeNotSelected(true);
      }
      return;
    }
    const newItem = {'product':currentProduct, 'size':selectedSize, 'count':"1"};    
    const updatedCartlist = [...cartProducts, newItem]
    
    localStorage.setItem('FABRICRAFT_CARTLIST', JSON.stringify(updatedCartlist));
    setCartProducts(updatedCartlist);

    try{
      metaPixelEvents.addToCartPixelEvent(currentProduct);
    }
    catch(ex) {
      console.log("Meta pixel event triggering exception:", ex)
    }
  }

  useEffect(() => {
    if(cartProducts && cartProducts.length > 0) {
      setCartItemCount(cartProducts.length);
    }
  }, [cartProducts]);

  const isStockOut = (stock_string) => {
    if(!stock_string) {
      return false;
    }
    const stock = JSON.parse(stock_string);
    return Object.values(stock).every(quantity => quantity === 0);
  }


  return (
    <div className="product-page-container">

      <Link to="/search" className="search-bar">
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </Link>

    <div className="product-image-slider">
      <ImageSlider productImages={currentProduct.product_photos}/>
      {isStockOut(currentProduct.product_stock) && (
        <div className="stockout-overlay" style={{height: "395px", transform: "translate(0%, +120px)"}}>
          <span className="stockout-overlay-text">Out Of Stock</span>
        </div>
      )}
    </div>

    <div className="product-body">
      <h1 className="product-page-title">
        {currentProduct && `${currentProduct.product_name}`}
      </h1>

      <div className="product-page-rating-container">
        <div className="product-page-rating">
            <i className="fa fa-star" aria-hidden="true"></i>
            <i className="fa fa-star" aria-hidden="true"></i>
            <i className="fa fa-star" aria-hidden="true"></i>
            <i className="fa fa-star" aria-hidden="true"></i>
            <i className="fa fa-star" aria-hidden="true"></i>
        </div>
      </div>

      <div className="product-page-price-container">
        <span className="product-page-discount-price">৳{currentProduct.product_discount_price}</span>
        <span className="product-page-selling-price">৳{currentProduct.product_price}</span>
        <span className="product-page-saving" style={{fontSize: "0.7em", marginTop: "3px"}}>Save ৳{(parseFloat(currentProduct.product_price) - parseFloat(currentProduct.product_discount_price)).toFixed(0)}</span>
        <span className="product-page-discount-percentage" style={{fontSize: "0.7em", marginTop: "3px"}}>({currentProduct.product_discount_percentage}% off)</span>
      </div>

      {
        isStockOut(currentProduct.product_stock) ?
        <h1 className="product-page-title size-not-selected" style={{marginTop: "18px", marginBottom: "18px", fontSize: "1em"}}>
          SORRY, OUT OF STOCK
        </h1> :
        <h1 className={`product-page-title ${sizeNotSelected ? "size-not-selected" : ""}`} style={{marginTop: "18px", marginBottom: "18px"}}>
          Select Size
        </h1>
      }
      

      <div className="product-size-container">
      {currentProduct.product_stock && Object.entries(JSON.parse(currentProduct.product_stock)).map(([size, quantity]) => (
        <div
          key={size}
          className={`size-name ${selectedSize === size ? 'selected' : ''} ${quantity === 0 ? 'stock-out' : ''}`}
          onClick={() => setSelectedSize(size)}>
          {size}
        </div>
      ))}
      </div>

      <div className="card-container">
        <div
          className="product-category-edit-container"
          style={{ maxWidth: "600px", marginTop: "0px" }}>
          
          <div className="product-description-container">
            <hr className="product-description-hzline" />
            <span className="product-description-title">Description</span>
            <hr className="product-description-hzline" />

            <div className="product-description-text">
              {currentProduct?.product_description?.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
            </div>

            <div className="product-description-specification-container">
              <span className="product-description-specification-title">
                Detailed Specification
              </span>
              <hr className="product-description-hzline" />
              <ul>
                {currentProduct?.product_specification?.split("|")
                  .map((line, index) =>
                    line ? <li key={index}>{line}</li> : ""
                  )}
              </ul>
            </div>
          </div>
          <div
            className="product-description-container"
            style={{ marginLeft: 0 }}
          >
            <span className="product-description-specification-title">
              Size chart - In inches
            </span>
            <span
              style={{ marginLeft: "10px", fontWeight: 500, fontSize: "0.8em" }}
            >
              {"(Expected Deviation < 3%)"}
            </span>
                
            {currentProduct.product_size_chart && (
              <table className="product-size-chart-table">
                <thead>
                  <tr>
                    <th className="product-size-chart-table-cell" key={0}>
                      Size
                    </th>
                    {Object.keys(JSON.parse(currentProduct.product_size_chart)[Object.keys(JSON.parse(currentProduct.product_size_chart))[0]])?.map(
                      (header) => (
                        <th className="product-size-chart-table-cell" key={header}>
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(JSON.parse(currentProduct.product_size_chart))?.map(
                    ([size, sizeData]) => (
                      <tr key={size}>
                        <td className="product-size-chart-table-cell" key={size}>
                            {size}
                        </td>
                        {Object.values(sizeData).map((value, idx) => (
                          <td className="product-size-chart-table-cell" key={idx}>
                            {value}
                          </td>
                        ))}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
            </div>
          </div>
        </div>
      </div>

      <div className={`product-fixed-bar-container ${selectedSizeInCart ? "product-checkout" : "" }`}>
        
        <span onClick={addToWishList} className={productIsInWishList ? "wishlisted-product" : ""}>
          <i className="fa fa-heart" aria-hidden="true"></i>
        </span>
        <span className="divider">|</span>
        {selectedSizeInCart ? (
          <Link to="/cart" style={{color: "white", textDecoration:"none"}}>Checkout</Link>
        ) : (
          <span onClick={addToCart}>Add to Cart</span>
        )}
      </div>
    </div>
  );
}

export default React.memo(ProductPage);
