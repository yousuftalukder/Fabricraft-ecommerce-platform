import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, useLocation, Link } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";

import { AuthContext } from '../contexts/AuthContext';
import { copyToClipboard } from "../utils/CommonUtils";



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
  writeBatch
} from 'firebase/firestore';

import * as metaPixelEvents from "../utils/MetaPixelEvent";



function OrderSuccess() {            
  const navigate = useNavigate();

  const { state } = useLocation();
  
  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if(!state) {
    navigate('/cart');
  }

  useEffect(() => {
    metaPixelEvents.OrderSuccessPagePixelEvent();
  }, []);

  return (
    <div className="cart-page-container">

      <div className="success-order-confirmation-container">
        <div className="success-order-status">
            <span className="success-order-icon">
                <i className="fa fa-check" aria-hidden="true"></i>  
            </span>
            <h2 className="success-order-h2">Thank you</h2>
            <p className="success-order-p">Thank you so much for your purchase. You will soon be notified when we process your order.</p>
        </div>

        <div className="success-order-details">
          <h3>Order details</h3>
          <ul>
            <li className="success-order-item">
              <strong>Order ID:</strong>
              <span className="success-order-value">
                <i className="fa fa-copy" aria-hidden="true" style={{marginRight: "5px", cursor: "pointer"}} onClick={() => {
                  copyToClipboard(state ? state.order_id : "");
                  showToast("Order ID copied!");
                }}></i>
                {state ? state.order_id : ""}
              </span>
            </li>
            <li className="success-order-item">
              <strong>Order Phone:</strong>
              <span className="success-order-value">{state ? state.delivery_details.phone : ""}</span>
            </li>
            <li className="success-order-item">
              <strong>Order Total:</strong>
              <span className="success-order-value">৳{state ? state.order_calculations.total_price : ""}</span>
            </li>
            <li className="success-order-item">
              <strong>Order Address:</strong>
            </li>
            <li>
              <span className="success-order-address-value">
                {state ? state.delivery_details.address : ""}
                </span>
            </li>
            <li className="success-order-item">
              <strong>Estimated Time:</strong>
              <span className="success-order-value">2-3 days</span>
            </li>
          </ul>
        </div>


        <div className="success-order-actions">
            <button className="success-track-order-btn" onClick={() => navigate(`/order-history/${state ? state.order_id : ""}`, {state: state})}>Track order</button>
            <button className="success-shop-again-btn" onClick={() => navigate('/')}>Shop again</button>
        </div>
      </div>  
    </div>
  );
}

export default React.memo(OrderSuccess);
