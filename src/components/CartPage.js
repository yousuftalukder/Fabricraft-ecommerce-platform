import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, Link } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";

import { useQuery } from 'react-query';

import { CustomImage } from "./CustomImage";

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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import * as metaPixelEvents from "../utils/MetaPixelEvent";


function CartPage() {            
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  const {dataContextData}  = useContext(DataContext);
  const { setCartItemCount } = dataContextData;
  
  const [cartOperationOngoing, setCartOperationOngoing] = useState(false);
  const [cartInitiated, setCartInitiated] = useState(false);
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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCartItemCount(cartlistProducts.length);
  }, [cartlistProducts]);



  const removeFromCartList = async (cartItem) => { 
    const updatedCartlist = cartlistProducts.filter(item => 
        (cartItem.product.product_id !== item.product.product_id || cartItem.size !== item.size)
    );
    localStorage.setItem('FABRICRAFT_CARTLIST', JSON.stringify(updatedCartlist));
    setCartlistProducts(updatedCartlist);
  }

  const updateCartItemQuantity = async (cartItem, change) => {
    const updatedCartProducts = [...cartlistProducts];
    
    for(let idx = 0; idx < updatedCartProducts.length; idx += 1) {
      if((updatedCartProducts[idx].product.product_id + updatedCartProducts[idx].size) === (cartItem.product.product_id + cartItem.size)) {
        
        const currentQuantityInCart = parseInt(updatedCartProducts[idx].count);
        let availableProducts = Math.min(parseInt(JSON.parse(updatedCartProducts[idx].product.product_stock)[cartItem.size]), 10);
        console.log("=>> cart: availableProducts: ", availableProducts);

        let updatedCount = Math.max(currentQuantityInCart + change, 1);
        updatedCount = Math.min(updatedCount, availableProducts);
        console.log("=>> cart : updated quantity: ", updatedCount);
        updatedCartProducts[idx].count = updatedCount;

        if(currentQuantityInCart !== updatedCartProducts[idx].count) {
          localStorage.setItem('FABRICRAFT_CARTLIST', JSON.stringify(updatedCartProducts));
          setCartlistProducts(updatedCartProducts);
        }
        break;
      }
    }
  }

  const revalidateCart = async () => {
    const updatedCartProducts = [...cartlistProducts];
    
    const productStockMap = {};
    const productMap = {}
    allProductList.forEach(product => {
      productStockMap[product.product_id] = JSON.parse(product.product_stock);
      productMap[product.product_id] = product;
    });
  
    let stockOut = [];
    let stockLow = [];
  
    updatedCartProducts.forEach(cartItem => {
      const productStock = productStockMap[cartItem.product.product_id] || {};
      const availableStock = Math.min(parseInt(productStock[cartItem.size] || 0), 10);
      
      cartItem.count = Math.min(parseInt(cartItem.count), availableStock);
      cartItem.product = productMap[cartItem.product.product_id];
  
      if (availableStock === 0) {
        stockOut.push(cartItem.product.product_id);
      } 
      else if (availableStock < parseInt(cartItem.count)) {
        stockLow.push(cartItem.product.product_id);
      }
    });
  
    const newCartlist = updatedCartProducts.filter(item => item.count > 0);
    localStorage.setItem('FABRICRAFT_CARTLIST', JSON.stringify(newCartlist));
    setCartlistProducts(newCartlist);
  
    if (stockOut.length > 0 || stockLow.length > 0) {
      const message =
        stockOut.length > 0
          ? "Some of your cart items are out of stock!"
          : "Some of your cart items have low stock!";
      showToast(message);
    }
  };
  

  useEffect(() => {
    revalidateCart();
  }, [allProductList]);

  useEffect(() => {
    setCartInitiated(true);
  },[cartlistProducts]);

  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // Cart Calculation
  // -----------------------------------------------------------------

  const [couponDiscount, setCouponDiscount] = useState(null);
  const [flatDiscount, setFlatDiscount] = useState(null);
  const [appliedCoinAmount, setAppliedCoinAmount] = useState(0);

  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [isCoinOpen, setIsCoinOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coinAmount, setCoinAmount] = useState(0);
  

  const applyCoupon = async (coupon) => {
    if (coupon == process.env.REACT_APP_ADMIN_PANEL_PATH) {
      navigate(`/${process.env.REACT_APP_ADMIN_PANEL_PATH}/`);
    }
    showToast("Please enter a valid coupon.");
    return;
  }

  const applyCoin = (coin) => {
    setAppliedCoinAmount(0);
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

  const calculateTotalPrice = () => {
    console.log("cart: calculateTotalPrice");
    return parseInt(calculateSubTotal() - calculateAdditionalDiscount());
  }

  const handleCouponClick = () => {;
    setIsCoinOpen(false);
    setIsCouponOpen(true)
  };

  const handleCoinClick = () => {
    setIsCouponOpen(false);
    setIsCoinOpen(true);
  };

  const handleCouponChange = (event) => {
    setCouponCode(event.target.value);    
  };

  const handleCoinChange = (event) => {
    setCoinAmount(event.target.value);
  };

  const handleCouponApply = () => {
    applyCoupon(couponCode);
  };

  const handleCoinApply = () => {
    applyCoin(coinAmount);
  };

  const nextButtonClicked = async () => {
    const isUpdated = await revalidateCart();

    if(!isUpdated) {
      navigate('/delivery-details', {'state': true});
    }
  }

  useEffect(() => {
    metaPixelEvents.cartPagePixelEvent();
  }, []);

  return (
    <div>
      {cartInitiated && cartlistProducts && cartlistProducts.length === 0 && (
        <div className="cart-page-container">
          <Link to="/search" className="search-bar">
            <button className="search-button">
              <i className="fa fa-search" aria-hidden="true"></i>
              Search For Products
            </button>
          </Link>

          <span className="empty-cart-icon">
            <i className="fa fa-shopping-cart" aria-hidden="true"></i>
          </span>
          
          <div style={{opacity:"0.7", fontSize:"1.5em"}}>— Your Cart Is Empty —</div>
          <Link to="/" className="start-shopping">Start Shopping 
            <span style={{marginLeft: "20px"}}>
              <i class="fa fa-chevron-right" aria-hidden="true"></i>
              <i class="fa fa-chevron-right" aria-hidden="true"></i>
            </span>
          </Link>
        </div>
      )}

      {cartlistProducts && cartlistProducts.length > 0 &&
      <div className="cart-page-container">

        <Link to="/search" className="search-bar">
          <button className="search-button">
            <i className="fa fa-search" aria-hidden="true"></i>
            Search For Products
          </button>
        </Link>

        <div className="cart-page-title">
          <span className="heart-icon">
            <i className="fa fa-shopping-bag" aria-hidden="true"></i>
          </span>
          <span>My Cart</span>
        </div>
        
        {cartlistProducts.map((cartItem) => 
          <div key={cartItem.product.product_id+cartItem.size} className="cart-product-container" onClick={() => {navigate(`/product/${cartItem.product.product_id}`, {'state':cartItem.product})}}>
            <div  className="cart-product-image" > 
              <CustomImage 
                imageUrl={cartItem.product.product_photos[0].url}
                altText={""}
                blurHash={cartItem.product.product_photos[0].blurhash}
                width={"100%"}
                height={"140px"}
                blurHashWidth={"100%"}
                blurHashHeight={"140px"}
                borderRadius={"8px"}
              />
            </div>
            <div className="cart-product-details">
              <div className="cart-product-name">{cartItem.product.product_name}</div>
              <div className="cart-product-row">
                <div className="product-prices">
                  <span className="discount-price">৳{cartItem.product.product_discount_price}</span>
                  <span className="real-price">৳{cartItem.product.product_price}</span>
                  <span className="saving-price">saved ৳{parseInt(cartItem.product.product_price)-parseInt(cartItem.product.product_discount_price)}</span>
                </div>
                <div className="cart-delete-button" onClick={(event) => {
                    event.stopPropagation();
                    removeFromCartList(cartItem);
                  }}>
                  <i className="fa fa-trash" aria-hidden="true"></i>
                </div>
              </div>
              <div className="cart-product-row">
                <div className="cart-product-info">
                  <span>Size: {cartItem.size}</span>
                </div>
                <div className="cart-count-container">
                  <button className="cart-count-button" onClick={(event) => {
                    event.stopPropagation();
                    updateCartItemQuantity(cartItem, -1);
                  }}>-</button>
                  <span className="cart-count">{cartItem.count}</span>
                  <button className="cart-count-button" onClick={(event) => {
                    event.stopPropagation();
                    updateCartItemQuantity(cartItem, 1);
                  }}>+</button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="coupon-coin-container">
          
          {!isCouponOpen && 
          <button
            className="coupon-coin-button"
            onClick={handleCouponClick}
          >
            Have a coupon?
          </button>}

          {isCouponOpen && (
            <div className="coupon-input-container">
              <button className="coupon-coin-button" onClick={handleCouponApply}>
                {(couponDiscount && couponDiscount.is_valid) ? "Remove Coupon" : "Apply Coupon"}
              </button>
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={handleCouponChange}
              />
            </div>
          )}

          {/* {!isCoinOpen && 
          <button
            className={`coupon-coin-button`}
            onClick={handleCoinClick}
          >
            Use Alpona Coin
          </button>}

          {isCoinOpen && (
            <div className="coin-input-container">
              <button className="coupon-coin-button" onClick={handleCoinApply}>
                Apply Coin
              </button>
              <input
                type="number"
                placeholder="Enter coin amount"
                value={coinAmount}
                onChange={handleCoinChange}
              />
            </div>
          )} */}
        </div>

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
            <span className="cart-calculation-price" style={{opacity:"0.4"}}>
              {(isFreeDelivery() ? "৳0" : "applicable")}
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

        {cartOperationOngoing && (<div class="lds-ripple loading-fixed-bar" style={{background:"transparent"}}><div></div><div></div></div>)}

        <div className="gamify-purchase-fixed-bar">
          <span>{gamifyPurchase()}</span>
        </div>

        <div onClick={() => nextButtonClicked()} className="cart-fixed-bar-container" style={{fontSize: "1em"}}>
          <span>
            Total Price - ৳{calculateTotalPrice()}
          </span>
          <span className="divider" style={{marginLeft: "20px", marginRight: "10px", }}>|</span>
          <span style={{marginRight: "20px", }}>Next</span>
          <i class="fa fa-chevron-right" aria-hidden="true"></i>
        </div>
      </div>}
    </div>
  );
}

export default React.memo(CartPage);
