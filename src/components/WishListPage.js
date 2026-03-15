import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, Link } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";

import { useQuery } from 'react-query';
import Axios from 'axios';

import { CustomImage } from "./CustomImage";
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



function WishListPage() {           
  const navigate = useNavigate();

  const { dataContextData }  = useContext(DataContext);
  const { setWishlistItemCount } = dataContextData;

  const [ wishlistProducts, setWishlistProducts ] = useState((JSON.parse(localStorage.getItem('FABRICRAFT_WISHLIST'))) || []);

  const removeFromWishList = async (product_id) => {
    const updatedWishlist = wishlistProducts.filter(item => (item.product.product_id !== product_id));
    localStorage.setItem('FABRICRAFT_WISHLIST', JSON.stringify(updatedWishlist));
    setWishlistProducts(updatedWishlist);
  }

  useEffect(() => {
    setWishlistItemCount(wishlistProducts.length);
  }, [wishlistProducts]);

  useEffect(() => {
    metaPixelEvents.WishListPagePixelEvent();
  }, []);

  return (
    <div className="cart-page-container">

      <Link to="/search" className="search-bar">
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </Link> 

      <div className="cart-page-title">
        <span className="heart-icon">
          <i className="fa fa-heart" aria-hidden="true"></i>
        </span>
        <span>My WishList</span>
      </div>

      {wishlistProducts && wishlistProducts.map((wishlistItem) => 
        <div className="wishlist-product-container" onClick={() => {navigate(`/product/${wishlistItem.product.product_id}`, {'state':wishlistItem.product})}}>
          <div  className="wishlist-product-image" > 
            <CustomImage 
              imageUrl={wishlistItem.product.product_photos[0].url}
              altText={""}
              blurHash={wishlistItem.product.product_photos[0].blurHash}
              width={"100%"}
              height={"120px"}
              blurHashWidth={"100%"}
              blurHashHeight={"120px"}
              borderRadius={"8px"}
            />
          </div>
          <div className="cart-product-details">
            <div className="cart-product-row">
              <div className="cart-product-name">{wishlistItem.product.product_name}</div>
              <div className="cart-delete-button" onClick={(event) => {
                event.stopPropagation();
                removeFromWishList(wishlistItem.product.product_id);
              }}>
                <i className="fa fa-trash" aria-hidden="true"></i>
              </div>
            </div>
            <div className="cart-product-row">
              <div className="product-prices">
                <span className="discount-price">৳{wishlistItem.product.product_discount_price}</span>
                <span className="real-price">৳{wishlistItem.product.product_price}</span>
                <span className="saving-price">{wishlistItem.product.product_discount_percentage}% off</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(WishListPage);
