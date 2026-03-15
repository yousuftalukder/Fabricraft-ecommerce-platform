import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, useLocation, Link } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";

import { AuthContext } from '../contexts/AuthContext';
import { copyToClipboard } from "../utils/CommonUtils";

import * as metaPixelEvents from "../utils/MetaPixelEvent";

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

import { IsCorrectPhoneNumber } from '../utils/SecurityUtils';


function OrderHistory() {            
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  const [workInProgress, setWorkInProgress] = useState(false);

  const [customerDetails, setCustomerDetails] = useState(JSON.parse(localStorage.getItem('FABRICRAFT_DELIVERY_DETAILS')) || {});
  const [localOrders, setLocalOrders] = useState(JSON.parse(localStorage.getItem('FABRICRAFT_LOCAL_ORDERS')) || []);


  const fetchOrdersByPhone = async (phoneNumber) => {
    try {
      setWorkInProgress(true);

      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("delivery_details.phone", "==", phoneNumber));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.log(`No orders found for phone number: ${phoneNumber}`);
        return [];
      }
  
      const orders = querySnapshot.docs.map((doc) => doc.data());
      const sortedOrders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      localStorage.setItem('FABRICRAFT_LOCAL_ORDERS', JSON.stringify(sortedOrders));
      setLocalOrders(sortedOrders);
    } 
    catch (error) {
      console.error("Error fetching orders by phone:", error);
    }
    finally{
      setWorkInProgress(false);
    }
  };

  useEffect(() => {
    if(customerDetails.phone && IsCorrectPhoneNumber(customerDetails.phone)) {
      fetchOrdersByPhone(customerDetails.phone);
    }
  }, []);

  useEffect(() => {
    metaPixelEvents.OrderHistoryPagePixelEvent();
  }, []);

  return (
    <div className="order-history-container">
      <div className="cart-page-title">
        <span className="heart-icon">
          <i className="fa fa-history" aria-hidden="true"></i>
        </span>
        <span>Order History</span>
      </div>

      {workInProgress && (<div class="lds-ripple" style={{background: "transparent"}}><div></div><div></div></div>)}

      {localOrders && localOrders.map((order, index) => (
        <div className="order-history-card" key={index} onClick={() => navigate(order.order_id, {state: order})}>
          <div className="order-history-header">
              <span className="order-history-title">ORDER ID</span>
              <span className="order-history-id">
                <i className="fa fa-copy" aria-hidden="true" style={{marginRight: "5px", cursor: "pointer"}} onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(order.order_id);
                  showToast("Order ID copied!");
                }}></i>
                <span style={{fontSize: '16px', fontWeight: '600'}}>#</span>
                {order.order_id}
              </span>
          </div>
          <div className="order-history-body">
              <div className="order-history-row">
                  <span>Order Date:</span>
                  <span>{(new Date(order.created_at)).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}</span>
              </div>
              <div className="order-history-row">
                  <span>Status:</span>
                  <span style={{
                    fontSize: '14', 
                    paddingLeft: '12px', 
                    paddingRight: '12px', 
                    paddingTop: '5px',
                    paddingBottom: '5px',
                    borderRadius: '15px', 
                    color: '#fff', 
                    fontSize: '14px',
                    backgroundColor: ['Delivery Failed', 'Cancelled', 'Paid Return', 'Return'].includes(order.order_status)
                    ? '#F23635'
                    : ['Partial Delivery', 'Delivered'].includes(order.order_status)
                    ? 'seagreen'
                    : '#a656fc'
                  }}>{order.order_status}</span>
              </div>
              <div className="order-history-row">
                  <span>Payment method:</span>
                  <span>{order.payment_method}</span>
              </div>
              <div className="order-history-row">
                  <span>Grand total:</span>
                  <span>৳{order.order_calculations.total_price}</span>
              </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default React.memo(OrderHistory);
