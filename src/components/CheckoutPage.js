import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, useLocation } from "react-router-dom";
import React, { useContext, useState, useEffect } from "react";

import { useQuery, useQueryClient } from 'react-query';

import { AuthContext } from '../contexts/AuthContext';
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
  writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { parse } from "date-fns";

import * as metaPixelEvents from "../utils/MetaPixelEvent";

import emailjs from '@emailjs/browser';


function CheckoutPage() {            
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { state } = useLocation();
  
  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  const {dataContextData}  = useContext(DataContext);
  const { setCartItemCount } = dataContextData;

  const [ deliveryDetails, setDeliveryDetails ] = useState(JSON.parse(localStorage.getItem('FABRICRAFT_DELIVERY_DETAILS')) || {})
  const [ cartlistProducts, setCartlistProducts ] = useState((JSON.parse(localStorage.getItem('FABRICRAFT_CARTLIST'))) || []);

  const [ allProductList, setAllProductList ] = useState((JSON.parse(localStorage.getItem('FABRICRAFT_ALL_PRODUCTS')) || []));

  const fetchProducts = async () => {
    const productCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productCollection);
    const products = productSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    localStorage.setItem('FABRICRAFT_ALL_PRODUCTS', JSON.stringify(products));
    setAllProductList(products);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const revalidateCart = () => {
    const updatedCartProducts = [...cartlistProducts];
    
    const productStockMap = {};
    const productMap = {}
    allProductList.forEach(product => {
      productStockMap[product.product_id] = JSON.parse(product.product_stock);
      productMap[product.product_id] = product;
    });
  
    updatedCartProducts.forEach(cartItem => {
      const productStock = productStockMap[cartItem.product.product_id] || {};
      const availableStock = Math.min(parseInt(productStock[cartItem.size] || 0), 10);
      
      cartItem.count = Math.min(parseInt(cartItem.count), availableStock);
      cartItem.product = productMap[cartItem.product.product_id];
    });
  
    const newCartlist = updatedCartProducts.filter(item => item.count > 0);
    setCartlistProducts(newCartlist);
  };
  
  useEffect(() => {
    revalidateCart();
  }, [allProductList]);

  useEffect(() => {
    setCartItemCount(cartlistProducts.length);
  }, [cartlistProducts]);

  useEffect(() => {
    if (state) { try{
      const orderCalculations = {
        price: calculateProductsOriginalPrice(),
        discount: calculateProductsDiscount(),
        discount_price: calculateProductsDiscountPrice(),
        additional_discount: calculateAdditionalDiscount(),
        delivery_charge: calculateDeliveryCharge(),
        total_price: calculateTotalPrice(),
      };
      const order = {
        order_id: generateOrderId(deliveryDetails.phone),
        ordered_products: cartlistProducts,
        delivery_details: deliveryDetails,
        order_calculations: orderCalculations,
        payment_method: selectedPayment,
        order_status: "Pending",
        created_at: new Date().toISOString(),
      };
      metaPixelEvents.initiatePurchasePixelEvent(order);
    }
    catch(ex) {
      console.error("initiate purchase:", ex);
    }}
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // Cart Calculation
  // -----------------------------------------------------------------

  const [couponDiscount, setCouponDiscount] = useState(null);
  const [flatDiscount, setFlatDiscount] = useState(null);
  
  const [checkoutOngoing, setCheckoutOngoing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  
  const handlePaymentChange = (paymentMethod) => {
    setSelectedPayment(paymentMethod);
  };

  const applyCoupon = async (coupon) => {
    showToast("Please enter a valid coupon.");
    return;
  }

  const calculateProductsOriginalPrice = () => {
    const originalPrice = cartlistProducts.reduce(
      (acc, cartItem) => acc + (parseInt(cartItem.product.product_price) * parseInt(cartItem.count)),
      0
    );
    return originalPrice.toFixed(2);
  };
  
  const calculateProductsDiscountPrice = () => {
    const discountPrice = cartlistProducts.reduce(
      (acc, cartItem) => acc + (parseInt(cartItem.product.product_discount_price) * parseInt(cartItem.count)),
      0
    );
    return discountPrice.toFixed(2);
  };
  
  const calculateProductsDiscount = () => {
    const originalPrice = parseFloat(calculateProductsOriginalPrice());
    const discountPrice = parseFloat(calculateProductsDiscountPrice());
    return (originalPrice - discountPrice).toFixed(2);
  };
  

  const calculateFlatDiscount = () => {
    return (0).toFixed(2);

    if(!flatDiscount.is_available) return (0).toFixed(2);
    if (flatDiscount.discount_type === 'FIXED') {
      return parseInt(flatDiscount.discount_value).toFixed(2);
    }
    const price = calculateProductsDiscountPrice();
    return ((price * flatDiscount.discount_value) / 100).toFixed(2);
  }

  const calculateCouponDiscount = () => {
    return (0).toFixed(2);

    if(!couponDiscount.is_valid) return (0).toFixed(2);
    if (couponDiscount.discount_type === 'FIXED') {
      return parseInt(couponDiscount.discount_value).toFixed(2);
    }
    const price = calculateProductsDiscountPrice();
    return ((price * couponDiscount.discount_value) / 100).toFixed(2);
  }

  const calculateSubTotal = () => {
    if (couponDiscount && couponDiscount.is_valid) {
      return (calculateProductsDiscountPrice() - calculateCouponDiscount()).toFixed(2);
    }
    else if (flatDiscount && flatDiscount.is_available) {
      return (calculateProductsDiscountPrice() - calculateFlatDiscount()).toFixed(2);
    }
    return calculateProductsDiscountPrice();
  }

  

  const isFreeDelivery = () => {
    const productsPrice = calculateSubTotal();
    return ((productsPrice >= 999) ? true : false);
  }

  const gamifyPurchase = () => {
    const productsPrice = calculateSubTotal();
    const targetPurchase = (parseInt((productsPrice/1000)) * 1000) + 999;
    const discount = ((targetPurchase - 999) / 1000) * 100;
    return (<span>
      Purchase <span style={{color: "rgb(223, 1, 112)"}}>৳{targetPurchase}</span> or more for {targetPurchase < 1000 ? "free delivery" : <span> <span style={{color: "rgb(223, 1, 112)"}}>৳{discount}</span> discount</span>}
    </span>);
  }

  const roundingDownDiscount = () => {
    const subtotal = calculateSubTotal();
    return (subtotal - (parseInt(subtotal / 10) * 10));
  }

  const isAdditionalDiscountAvailable = () => {
    const subTotal = calculateSubTotal();
    const discount = (parseInt((subTotal-1000+1)/1000) * 100) + roundingDownDiscount();
    return (discount > 0 ? true : false);
  }

  const calculateAdditionalDiscount = () => {
    console.log("cart: calculateAdditionalDiscount");
    const subTotal = calculateSubTotal();
    const discount = (parseInt((subTotal-1000+1)/1000) * 100) + roundingDownDiscount();
    return discount.toFixed(2);
  }

  const calculateDeliveryCharge = () => {
    console.log("cart: calculateDeliveryCharge");
    const productsPrice = parseFloat(calculateSubTotal());
    if (productsPrice >= 999) return parseFloat(0).toFixed(2);
    if (deliveryDetails && deliveryDetails.district == 'Dhaka') return parseFloat(50).toFixed(2);
    return parseFloat(100).toFixed(2);
  }
  
  const calculateTotalPrice = () => {
    console.log("cart: calculateTotalPrice");
    const subTotal = parseFloat(calculateSubTotal());
    const deliveryCharge = parseFloat(calculateDeliveryCharge());
    const additionalDiscount = parseFloat(calculateAdditionalDiscount());
    
    const total = subTotal + deliveryCharge - additionalDiscount;
    
    return parseInt(total).toFixed(2);
  }


  if(!state) {
    navigate('/cart');
  }

  const generateOrderId = (customerPhone) => {
    // Validate the customer phone number
    if (!customerPhone || customerPhone.length < 4) {
      throw new Error("Invalid customer phone number. It must have at least 4 digits.");
    }
  
    // Extract the last 4 digits of the phone number
    const lastFourDigits = customerPhone.slice(-4);
  
    // Get the current date components
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().slice(-2); // Last 2 digits of the year
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Month (2 digits)
    const date = String(currentDate.getDate()).padStart(2, '0'); // Date (2 digits)
  
    // Generate 4 random uppercase characters
    const randomChars = Array.from({ length: 4 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
  
    // Construct the order_id
    const orderId = `F${year}${month}${date}-${randomChars}-${lastFourDigits}`;
    return orderId;
  };

  const OrderSuccessEmail = (order) => {
    try {
        const templateParams = {
            customer_name: order.delivery_details.name,
            order_id: order.order_id,
            order_details_url: `https://fabricraft.co/order-history/${order.order_id}`,
            customer_email: order.delivery_details.email,
            order_total: order.order_calculations.total_price
        };

        if (templateParams.customer_email.trim() === "") {
            templateParams.customer_email = "fabricraftofficial@gmail.com";
        }
    
        emailjs.send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
            templateParams,
            process.env.REACT_APP_EMAILJS_PUBLIC_KEY 
        )
        .then((response) => {
            console.log('Email sent successfully!', response.status, response.text);
        })
        .catch((error) => {
            console.error('Failed to send email:', error);
        });
    } 
    catch (ex) {
        console.error("Order success email sending exception:", ex);
    } 
  }

  
  const ConfirmOrder = async () => {
    setCheckoutOngoing(true);
  
    try {
      revalidateCart();

      // Clear the cart and reset cart count
      localStorage.removeItem('FABRICRAFT_CARTLIST');
      setCartItemCount(0);
  
      // Batch update product stocks in Firebase
      const batch = writeBatch(db); // Firestore batch operation
  
      for (const cartItem of cartlistProducts) {
        const stock = JSON.parse(cartItem.product.product_stock);
        stock[cartItem.size] = parseInt(stock[cartItem.size]) - parseInt(cartItem.count);
  
        const productRef = collection(db, "products");
        const q = query(productRef, where("product_id", "==", cartItem.product.product_id));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          console.error(`No product found with product_id: ${cartItem.product.product_id}`);
          continue;
        }
  
        querySnapshot.forEach((doc) => {
          batch.update(doc.ref, { product_stock: JSON.stringify(stock)});
        });
      }
  
      // Commit batch updates
      await batch.commit();
      console.log("Stock updates completed successfully.");
  
      // Prepare order details
      const orderCalculations = {
        price: calculateProductsOriginalPrice(),
        discount: calculateProductsDiscount(),
        discount_price: calculateProductsDiscountPrice(),
        additional_discount: calculateAdditionalDiscount(),
        delivery_charge: calculateDeliveryCharge(),
        total_price: calculateTotalPrice(),
      };
  
      const order = {
        order_id: generateOrderId(deliveryDetails.phone),
        ordered_products: cartlistProducts,
        delivery_details: deliveryDetails,
        order_calculations: orderCalculations,
        payment_method: selectedPayment,
        order_status: "Pending",
        created_at: new Date().toISOString(),
      };
  
      // Add order to Firebase
      const ordersRef = collection(db, "orders");
      const addedDoc = await addDoc(ordersRef, order);
      console.log(`Order added successfully with ID: ${addedDoc.id}`);

      try {
        metaPixelEvents.purchasePixelEvent(order);
        console.log('Standard event "InitiateCheckout" tracked successfully.');
      } 
      catch (error) {
        console.error('Error tracking "InitiateCheckout" event:', error);
      }

      OrderSuccessEmail(order);
      
      // Navigate to success page
      window.history.replaceState(null, '', '/order-success');
      setCheckoutOngoing(false);
      navigate('/order-success', { state: order });
    } 
    catch (error) {
      console.error("Checkout error:", error);
      showToast('Something went wrong, please try again.');
      
      setCheckoutOngoing(false);
      navigate('/cart');
    } 
  };
  
  


  return (
    <div className="cart-page-container">
      <div className="checkout-container">

        <h3 className="checkout-title">Select Payment method</h3>
        <div className="checkout-payment-options">
          
          <div className={`checkout-payment-option ${selectedPayment === 'cod' ? 'selected' : ''}`}
            onClick={() => handlePaymentChange('cod')}>
            <div className="checkout-icon">💵</div>
            <span>Cash on delivery</span>
            <input
              type="radio"
              name="payment"
              value="cod"
              checked={selectedPayment === 'cod'}
              readOnly
            />
          </div>
          <div className={`checkout-payment-option ${selectedPayment === 'card' ? 'selected' : ''} disabled`}
            onClick={() => handlePaymentChange('card')}>
            <div className="checkout-icon">💳</div>
            <span>Card / Mobile Payment</span>
            <input
              type="radio"
              name="payment"
              value="card"
              checked={selectedPayment === 'card'}
              readOnly
            />
          </div>
          
          <div className={`checkout-payment-option ${selectedPayment === 'bkash' ? 'selected' : ''} disabled`}
            onClick={() => handlePaymentChange('bkash')}>
            <div className="checkout-icon">💸</div>
            <span>bKash Payment</span>
            <input
              type="radio"
              name="payment"
              value="bkash"
              checked={selectedPayment === 'bkash'}
              readOnly
            />
          </div>
          <span style={{fontSize: "0.7em", color: "rgb(119, 0, 255)", paddingLeft: "5px"}}>Card / Mobile payment will be available soon.</span>
        </div>

        <h3 style={{marginTop: "35px"}}>Order Summary</h3>
        <div className="checkout-order-summary">
          <div className="cart-calculation">
            <div className="cart-calculation-row" style={{opacity: "0.6"}}>
              <span className="cart-calculation-name">Products Price</span>
              <span className="cart-calculation-price">৳{calculateProductsOriginalPrice()}</span>
            </div>

            <div className="cart-calculation-row" style={{opacity: "0.6"}}>
              <span className="cart-calculation-name">Products Discount</span>
              <span className="cart-calculation-price">
                ৳{calculateProductsDiscount()}
              </span>
            </div>
            
            <hr className="cart-calculation-line" />
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Products Discount Price</span>
              <span className="cart-calculation-price">
                ৳{calculateProductsDiscountPrice()}
              </span>
            </div>

            {((flatDiscount && flatDiscount.is_available) || (couponDiscount && couponDiscount.is_valid)) && (
              <>
                { (couponDiscount && couponDiscount.is_valid) ? 
                  <div className="cart-calculation-row">
                    <span className="cart-calculation-name">Coupon Discount</span>
                    <span className="cart-calculation-price">৳{calculateCouponDiscount()}</span>
                  </div> : 
                  <div className="cart-calculation-row">
                    <span className="cart-calculation-name">Flat Discount</span>
                    <span className="cart-calculation-price">৳{calculateFlatDiscount()}</span>
                  </div>
                }
                <hr className="cart-calculation-line" />
                <div className="cart-calculation-row">
                  <span className="cart-calculation-name">Sub-total</span>
                  <span className="cart-calculation-price">
                    ৳{calculateSubTotal()}
                  </span>
                </div>
              </>
            )}

            {isAdditionalDiscountAvailable() ?
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Additional Discount</span>
              <span className="cart-calculation-price">
                ৳{calculateAdditionalDiscount()}
              </span>
            </div> : ""}
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Delivery Charge</span>
              <span className="cart-calculation-price">
                ৳{calculateDeliveryCharge()}
              </span>
            </div>

            <hr className="cart-calculation-line" />
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Total</span>
              <span className="cart-calculation-price">
                ৳{calculateTotalPrice()}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {checkoutOngoing && (<div class="lds-ripple loading-fixed-bar" style={{background: "transparent"}}><div></div><div></div></div>)}

      <div className="cart-fixed-bar-container" style={{fontSize: "0.9em", cursor: "text"}}>
        <div style={{paddingLeft: "10px", paddingRight: "10px", cursor: "pointer"}} onClick={() => {
          navigate(-1);
        }}>
          <i class="fa fa-chevron-left" aria-hidden="true"></i>
          <span style={{marginLeft: "20px",}}>Back</span>
        </div>
          <span className="divider" style={{marginLeft: "20px", marginRight: "20px", }}>|</span>
        <div style={{paddingLeft: "10px", paddingRight: "10px", cursor: "pointer"}} onClick={() => {
          ConfirmOrder();
        }}>
          <span>Confirm Order</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(CheckoutPage);
