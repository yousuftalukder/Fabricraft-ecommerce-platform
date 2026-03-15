import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, useLocation, useParams } from "react-router-dom";
import React, { useContext, useState, useEffect } from "react";

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
  writeBatch
} from 'firebase/firestore';
import { arrayUnion } from "firebase/firestore";

import SHA256 from "crypto-js/sha256";

import { AuthContext } from '../contexts/AuthContext';
import { copyToClipboard } from "../utils/CommonUtils";

import * as metaPixelEvents from "../utils/MetaPixelEvent";


function AdminOrderDetails() {            
  const navigate = useNavigate();

  const { orderId } = useParams(); 
  const { state } = useLocation();

  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  const [workInProgress, setWorkInProgress] = useState(false);

  const [reviewProduct, setReviewProduct] = useState("");
  const [reviewProductRating, setReviewProductRating] = useState(5);
  const [reviewProductReview, setReviewProductReview] = useState("")

  const [order, setOrder] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchOrderById = async (order_id) => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("order_id", "==", order_id));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.log(`No order found with order_id: ${order_id}`);
        return null;
      }
  
      const freshOrder = querySnapshot.docs[0].data();
      console.log("order details:", freshOrder);
      setOrder({...freshOrder});
    } 
    catch (error) {
      console.error("Error fetching order by ID:", error);
    }
  };

  useEffect(() => {
    if(state) {
      setOrder({...state});
    }
  }, []);

  useEffect(() => {
    if(orderId) {
      fetchOrderById(orderId);
    }
  }, []);

  const reviewButtonClicked = async (orderedProduct) => {
    if(reviewProduct === `${orderedProduct.product.product_id}-${orderedProduct.size}`) {
      if(orderedProduct.review_status === 'Approved') {
        showToast("Review edits are no longer allowed.");
        return;
      }
      const review = {
        product: orderedProduct.product,
        order: order,
        size: orderedProduct.product_size,
        rating: reviewProductRating,
        description: reviewProductReview
      }
      try{
        setWorkInProgress(true);
        const token = null;
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const res = null;

        setWorkInProgress(false);
        if(res.data.status == 'OK') {
          showToast('Thank you for your review!');
          // updateOrder();
        }
        else {
          showToast("Review edits are no longer allowed.");
        }
      }
      catch(e) {
        setWorkInProgress(false);
      }
    }
    else {
      setReviewProductRating(orderedProduct.rating);
      setReviewProductReview(orderedProduct.review);
      setReviewProduct(`${orderedProduct.product.product_id}-${orderedProduct.product_size}`);
    }
  }

  // Admin functionality
  const [orderStatusOptions, setOrderStatusOptions] = useState([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState("");
  const [orderPaymentStatus, setOrderPaymentStatus] = useState(false);

  const [orderTrackingURL, setOrderTrackingURL] = useState("");
  const [specialDiscount, setSpecialDiscount] = useState(0);
  const [courierDeliveryCharge, setCourierDeliveryCharge] = useState(0);
  const [adminNote, setAdminNote] = useState("");
  const [adminNoteList, setAdminNoteList] = useState([]);

  const handleStatusChange = (selectedValue) => {
    setSelectedOrderStatus(selectedValue);
    const allOptions = ["Pending", "Packaging", "Out For Delivery", "Delivered", "Returned", "Canceled"];
    let availableOptions = [];
  
    switch (selectedValue) {
      case "Pending":
        availableOptions = [...allOptions];
        break;
      case "Packaging":
        availableOptions = allOptions.filter((opt) => opt !== "Pending");
        break;
      case "Out For Delivery":
        availableOptions = allOptions.filter((opt) => opt !== "Pending" && opt !== "Packaging");
        break;
      case "Delivered":
        availableOptions = ["Delivered"];
        break;
      case "Returned":
        availableOptions = ["Returned"];
        break;
      case "Canceled":
        availableOptions = ["Canceled"];
        break;
      default:
        availableOptions = allOptions;
    }
    setOrderStatusOptions(availableOptions);
  };

  useEffect(() => {
    handleStatusChange(order.order_status);
    setOrderTrackingURL((order.tracking_url || ""));
    setSpecialDiscount((order.special_discount || 0));
    setAdminNoteList((order.admin_notes || []));
    setCourierDeliveryCharge((order.courier_delivery_charge || 0))
    setOrderPaymentStatus((order.is_paid || false));
  }, [order]);

  const isYes = () => {
    const res = prompt("Are You Sure!! You want to update this order??");
    return res.toLowerCase() == "yes";
  }

  const isSuperAdmin = () => {
    const adminSecret = prompt("Enter admin secret:");
    const adminSecretHash = SHA256(adminSecret).toString();
    if(adminSecretHash != process.env.REACT_APP_ADMIN_SUPER_SECRET) {
      showToast("You are not allowed to do this.");
    }
    return adminSecretHash == process.env.REACT_APP_ADMIN_SUPER_SECRET;
  }

  function detectBrowser() {
    const userAgent = navigator.userAgent;
  
    if (userAgent.indexOf("Firefox") > -1) {
      return "Firefox";
    } else if (userAgent.indexOf("Chrome") > -1) {
      return "Chrome";
    } else if (userAgent.indexOf("Safari") > -1) {
      return "Safari";
    } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
      return "Internet Explorer";
    } else if (userAgent.indexOf("Edge") > -1) {
      return "Edge";
    } else {
      return "Unknown";
    }
  }

  const getLocationName = async () => {
    try {
      const response = await fetch("http://ip-api.com/json/");
      const data = await response.json();
      if (data.status === "success") {
        return `${data.city}, ${data.regionName}, ${data.country}`;
      } else {
        throw new Error("Unable to fetch location");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      return "Unknown location";
    }
  }

  const getAdminDetails = async () => {
    let ret = "";
    try{
      ret = detectBrowser() + " Brower";
      ret = ret + " | " + await getLocationName();
    }
    catch(ex) {
      console.log("Admin detecting exception:", ex);
    }
    finally{
      if(ret.trim() == "") return "UNKNOWN";
      return ret;
    }
  }

  const formatDate = (date) => {
    const options = {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const addAdminNote = async (note) => {
    const newNote = {
      message: note,
      created_at: formatDate(new Date()),
      admin_details: await getAdminDetails()
    }
    const orderRef = collection(db, "orders");
    const q = query(orderRef, where("order_id", "==", order.order_id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`No order found with order_id: ${order.order_id}`);
      return;
    }
    
    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, { admin_notes: arrayUnion(newNote), });
      setAdminNoteList((prv) => [...prv, newNote]);
    }
  }
  
  const updateOrderTrackingURL = async () => {
    if(!isYes()) return;

    const orderRef = collection(db, "orders");
    const q = query(orderRef, where("order_id", "==", order.order_id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`No order found with order_id: ${order.order_id}`);
      return;
    }
    
    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, { tracking_url: orderTrackingURL });
      addAdminNote(`Order tracking url updated: ${orderTrackingURL}`)
      alert("Order tracking URL updated.");
    }
  }

  const addSpecialDiscount = async () => {
    if(!isYes()) return;
    if(!isSuperAdmin()) return;

    const orderRef = collection(db, "orders");
    const q = query(orderRef, where("order_id", "==", order.order_id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`No order found with order_id: ${order.order_id}`);
      return;
    }
    
    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, { special_discount: specialDiscount });
      addAdminNote(`Special Discount Added: ${specialDiscount} taka`)
      alert("Special Discount added.");
    }
  }

  const restoreProductStock = async (cartlistProducts) => {
    const productCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productCollection);
    const products = productSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    const productMap = {}
    products.forEach(product => {
      productMap[product.product_id] = product;
    });

    // Batch update product stocks in Firebase
    const batch = writeBatch(db); // Firestore batch operation
  
    for (const cartItem of cartlistProducts) {
      const stock = JSON.parse(productMap[cartItem.product.product_id].product_stock);
      stock[cartItem.size] = parseInt(stock[cartItem.size]) + parseInt(cartItem.count);

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
  }

  const updatePaymentStatus = async () => {
    if(orderPaymentStatus == order.is_paid) {
      alert('Already updated!');
      return;
    }

    if(!isYes()) return;
    if(!isSuperAdmin()) return;
    
    const orderRef = collection(db, "orders");
    const q = query(orderRef, where("order_id", "==", order.order_id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`No order found with order_id: ${order.order_id}`);
      return;
    }
    
    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, { is_paid: orderPaymentStatus });
      addAdminNote(`Order payment status updated: ${orderPaymentStatus}`);
      alert("Order payment status updated.");
    }
  }

  const updateOrderStatus = async () => {
    if(selectedOrderStatus == order.order_status) {
      alert('Already updated!');
      return;
    }

    if(!isYes()) return;
    if(["Out For Delivery", "Delivered", "Returned", "Canceled"].includes(order.order_status)) {
      if(!isSuperAdmin()) return;
    }

    try{
      if(["Returned", "Canceled"].includes(selectedOrderStatus)) {
        await restoreProductStock(order.ordered_products);
      }

      const orderRef = collection(db, "orders");
      const q = query(orderRef, where("order_id", "==", order.order_id));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        alert(`No order found with order_id: ${order.order_id}`);
        return;
      }
      
      for (const doc of querySnapshot.docs) {
        await updateDoc(doc.ref, { order_status: selectedOrderStatus });
        addAdminNote(`Order status updated: ${selectedOrderStatus}`);
        alert("Order status updated.");
      }
    }
    catch(ex) {
      alert("Something went wrong please try again.");
    }
  }

  const addCourierDeliveryCharge = async () => {
    if(!isYes()) return;
    if(!isSuperAdmin()) return;

    const orderRef = collection(db, "orders");
    const q = query(orderRef, where("order_id", "==", order.order_id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`No order found with order_id: ${order.order_id}`);
      return;
    }
    
    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, { courier_delivery_charge: courierDeliveryCharge });
      addAdminNote(`Courier Delivery Charge Added: ${courierDeliveryCharge} taka`)
      alert("Courier Delivery Charge Added.");
    }
  }

  const handleDeliveryIssue = async () => {
    if(!isYes()) return;
    if(!isSuperAdmin()) return;

    const orderRef = collection(db, "orders");
    const q = query(orderRef, where("order_id", "==", order.order_id));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert(`No order found with order_id: ${order.order_id}`);
      return;
    }
    for (const doc of querySnapshot.docs) {
      await updateDoc(doc.ref, { delivery_issue: (order.delivery_issue ? false : true) });
      addAdminNote((order.delivery_issue ? "Delivery Issue Resolved" : "Delivery Issue Occoured"));
      alert("Delivery Issue Updated");
    }
  }

  

  return (
    <div className="order-details-page">
      {workInProgress && (<div className="lds-ripple" style={{background: "transparent", marginBottom: "20px"}}><div></div><div></div></div>)}

      <div className="order-details-header">
        <h2>Order ID: <span style={{marginLeft: '5px', color: '#f7dbff'}}>#{order.order_id}</span> <i className="fa fa-copy" aria-hidden="true" style={{marginLeft: "5px", cursor: "pointer", fontSize: '0.9em'}} 
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(order.order_id);
              showToast("Order ID copied!");
            }}></i><i className="fa-solid fa-paperclip" aria-hidden="true" style={{marginLeft: "15px", cursor: "pointer", fontSize: '0.9em'}}
            onClick={(e) => {
              e.stopPropagation();
              copyToClipboard(`https://fabricraft.co/order-history/${order.order_id}`);
              showToast("Order Public Link copied!");
            }}></i>
        </h2>
        <p>{(new Date(order.created_at)).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })}</p>
      </div>

      <div className="order-details-status">
        <div className="order-details-info-block">
          <i className="fa fa-shopping-cart" style={{color: 'rgb(119, 0, 255)'}}></i>
          <div className="order-details-info-container">
            <span className="order-details-info-title">Payment Method</span>
            <span className="order-details-info-value">{order.payment_method}</span>
          </div>
        </div>
        <div className="order-details-info-block">
          <i className="fa fa-heart" style={{color: 'rgb(223, 1, 112)', marginRight: '13px'}}></i>
          <div className="order-details-info-container">
            <span className="order-details-info-title">Status</span>
            <span className="order-details-info-value" style={{
              color: ['Cancelled', 'Returned'].includes(order.order_status)
              ? '#F23635'
              : ['Delivered'].includes(order.order_status)
              ? 'seagreen'
              : 'blue'
            }}>{order.order_status}</span>
          </div>
        </div>
      </div>

      {
        order.tracking_url && 
        <div className="order-details-info-block"
          style={{ cursor: 'pointer' }}
          onClick={() => window.open(order.tracking_url, '_blank')}>
          <i className="fa-solid fa-paper-plane" style={{ color: '#0D7574' }}></i>
          <div className="order-details-info-container">
            <span className="order-details-info-title">Order Tracking URL</span>
            <span
              className="order-details-info-value"
              style={{ color: '#007BFF', textDecoration: 'underline' }}
              title={order.tracking_url}
            >
              {order.tracking_url.length > 30
                ? `${order.tracking_url.substring(0, 30)}...`
                : order.tracking_url}
            </span>
          </div>
        </div>
      }

      {order.delivery_details && 
      <div className="order-details-section">
        <h3>Order Details</h3>
        <div className="order-details-address">
          <div>
            <i className="fa-solid fa-address-card"></i>
            <p>{order.delivery_details.name}</p>
          </div>
          <div>
            <i className="fa fa-map-marker" style={{marginRight: "15px"}}></i>
            <p>{order.delivery_details.address ? order.delivery_details.address + "," : ""} {order.delivery_details.district}</p>
          </div>
          <div>
            <i className="fa fa-phone"></i>
            <p>{order.delivery_details.phone}</p>
          </div>
          {order.delivery_details.email && <div>
            <i className="fa-solid fa-envelope"></i>
            <p>{order.delivery_details.email}</p>
          </div>}
          {order.delivery_details.note && <div>
            <i className="fa-solid fa-pen"></i>
            <p>{order.delivery_details.note}</p>
          </div>}
        </div>
      </div>}


      <div className="order-details-summary-section">
        <h3>Order Summary</h3>
        <div className="checkout-order-summary">
          <div className="cart-calculation">
            <div className="cart-calculation-row" style={{opacity: "0.6"}}>
              <span className="cart-calculation-name">Products Price</span>
              <span className="cart-calculation-price">৳{order.order_calculations ? parseFloat(order.order_calculations.price).toFixed(2) : ""}</span>
            </div>

            <div className="cart-calculation-row" style={{opacity: "0.6"}}>
              <span className="cart-calculation-name">Products Discount</span>
              <span className="cart-calculation-price">
                ৳{order.order_calculations ? parseFloat(order.order_calculations.discount).toFixed(2) : order.order_calculations}
              </span>
            </div>
            
            <hr className="cart-calculation-line" />
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Products Discount Price</span>
              <span className="cart-calculation-price">
                ৳{order.order_calculations ? parseFloat(order.order_calculations.discount_price).toFixed(2) : ""}
              </span>
            </div>

            {order.flat_discount && (parseInt(order.flat_discount) > 0) && (
              <>
                <div className="cart-calculation-row">
                  <span className="cart-calculation-name">Flat Discount</span>
                  <span className="cart-calculation-price">৳{parseFloat(order.flat_discount).toFixed(2)}</span>
                </div>
            
                <hr className="cart-calculation-line" />
                <div className="cart-calculation-row">
                  <span className="cart-calculation-name">Sub-total</span>
                  <span className="cart-calculation-price">
                    ৳{((parseFloat(order.products_regular_value) - parseFloat(order.products_discount)) - parseFloat(order.flat_discount)).toFixed(2)}
                  </span>
                </div>
              </>
            )}

            {order.order_calculations &&
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Additional Discount</span>
              <span className="cart-calculation-price">
                ৳{(parseFloat((order.order_calculations.additional_discount || 0)) + parseFloat((order.special_discount || 0))).toFixed(2)}
              </span>
            </div>}
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Delivery Charge</span>
              <span className="cart-calculation-price">
                ৳{order.order_calculations ? order.order_calculations.delivery_charge : ""}
              </span>
            </div>

            <hr className="cart-calculation-line" />
            
            <div className="cart-calculation-row">
              <span className="cart-calculation-name">Total</span>
              <span className="cart-calculation-price">
              ৳{order.order_calculations ? (parseFloat(order.order_calculations.total_price)-parseFloat((order.special_discount || 0))).toFixed(2) : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="order-details-items-section">
        <h3>Ordered Items</h3>
        {order.ordered_products && order.ordered_products.length > 0  && order.ordered_products.map((orderedProduct, index) => 
          <div className={`ordered-product-container ${reviewProduct === `${orderedProduct.product.product_id}-${orderedProduct.size}` ? 'expanded' : ''}`} key={index}>
            <div className="ordered-product" onClick={() => {navigate(`/product/${orderedProduct.product.product_id}`, {'state':orderedProduct.product})}}>
              <div  className="wishlist-product-image" > 
                <CustomImage 
                  imageUrl={orderedProduct.product.product_photos[0].url}
                  altText={""}
                  blurHash={orderedProduct.product.product_photos[0].blurhash}
                  width={"100%"}
                  height={"120px"}
                  blurHashWidth={"100%"}
                  blurHashHeight={"120px"}
                  borderRadius={"8px"}
                />
              </div>
              <div className="cart-product-details">
                <div className="cart-product-row" style={{marginBottom: "-15px"}}>
                  <div className="cart-product-name" style={{fontSize: '0.9em', marginTop: '0px'}}>{orderedProduct.product.product_name}</div>
                  <div className="cart-delete-button" style={{border: '2px solid black', borderRadius: '7px', padding: '2px 6px', fontWeight: '600', fontSize: '0.8em'}}>
                    x {orderedProduct.count}
                  </div>
                </div>
                <div className="cart-product-row" style={{marginTop: "10px", display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontSize: '0.8em'}}>
                  <div className="product-prices" style={{marginBottom: '0px',}}>
                    <span>Size: </span>
                    <span style={{fontWeight: '600'}}>{orderedProduct.size}</span>
                  </div>
                  <div className="product-prices" style={{marginBottom: '0px', marginTop: '2px'}}>
                    <span>Price: </span>
                    <span style={{fontSize: '0.9em'}} className="discount-price">৳{orderedProduct.product.product_discount_price}</span>
                    <span style={{fontSize: '0.9em'}} className="real-price">৳{orderedProduct.product.product_price}</span>
                    <span style={{fontSize: '0.9em'}} className="saving-price">৳{(parseFloat(orderedProduct.product.product_price) - parseFloat(orderedProduct.product.product_discount_price)).toFixed(0)} saved</span>
                  </div>
                  <div className="product-prices" style={{marginTop: '2px'}}>
                    <div className="cart-product-row" style={{marginTop: '0px'}}>
                      <div>
                        <span>Subtotal: </span>
                        <span style={{fontWeight: '600', color: 'rgb(223, 1, 112)'}}>৳{parseInt(orderedProduct.product.product_discount_price) * parseInt(orderedProduct.count)}</span>
                      </div>
                      {order.order_status === 'off-Delivered' && (
                        <div 
                          className="order-details-review-button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            reviewButtonClicked(orderedProduct);
                          }}
                          style={{
                            backgroundColor: (reviewProduct === `${orderedProduct.product.product_id}-${orderedProduct.product_size}`) 
                              ? 'rgb(223, 1, 112)' 
                              : 'rgb(119, 0, 255)'
                          }}
                        >
                          {reviewProduct === `${orderedProduct.product.product_id}-${orderedProduct.product_size}` ? 'Submit' : 'Review'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {reviewProduct === `${orderedProduct.product.product_id}-${orderedProduct.product_size}` && (
              <div className="order-review-section">
                {workInProgress && (<div className="lds-ripple" style={{background: "transparent", height: '10px', margin: '0 auto'}}><div></div><div></div></div>)}
                <div className="order-review-star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i
                      key={star}
                      className={`fa fa-star ${star <= reviewProductRating ? 'filled' : ''}`}
                      onClick={() => setReviewProductRating(star)}
                    ></i>
                  ))}
                </div>
                
                <textarea placeholder="Write your review here..." onChange={(e) => {
                  setReviewProductReview(e.target.value);
                }} value={reviewProductReview}></textarea>
              </div>
            )}
          </div>
        )}
      </div>
    
      {workInProgress && (<div className="lds-ripple loading-fixed-bar" style={{background: "transparent"}}><div></div><div></div></div>)}

      <div id="order-details-items-section">
        <div className="admin-order-details-tracking-url-section">
            <input
            type="text"
            placeholder="Tracking URL"
            className="admin-order-details-tracking-url-input"
            value={orderTrackingURL}
            onChange={(e) => setOrderTrackingURL(e.target.value)}/>
            <button className="admin-order-details-add-btn" onClick={updateOrderTrackingURL}>Update Order Tracking URL</button>
        </div>

        <div className="admin-order-details-tracking-url-section">
            <input
            type="number"
            placeholder="Special Discount"
            className="admin-order-details-tracking-url-input"
            value={specialDiscount}
            onChange={(e) => setSpecialDiscount(e.target.value)}/>
            <button className="admin-order-details-add-btn" onClick={addSpecialDiscount}>Add Special Discount</button>
        </div>

        <div className="admin-order-details-status-update-section">
            <select className="admin-order-details-status-dropdown"
                onChange={(e) => handleStatusChange(e.target.value)}
                value={selectedOrderStatus}>
                {orderStatusOptions.map((option, idx) =>
                    <option key={idx} value={option}>{option}</option>
                )}
            </select>
            <button className="admin-order-details-add-btn" onClick={updateOrderStatus}>Update Order Status</button>
        </div>

        <div className="admin-order-details-status-update-section">
            <select className="admin-order-details-status-dropdown"
                onChange={(e) => {
                  setOrderPaymentStatus(e.target.value === "Paid")
                }}
                value={orderPaymentStatus?"Paid":"Unpaid"}>
                {["Paid", "Unpaid"].map((option, idx) =>
                    <option key={idx} value={option}>{option}</option>
                )}
            </select>
            <button className="admin-order-details-add-btn" onClick={updatePaymentStatus}>Update Payment Status</button>
        </div>

        <div className="admin-order-details-tracking-url-section">
            <input
            type="number"
            placeholder="Courier Delivery Charge"
            className="admin-order-details-tracking-url-input"
            value={courierDeliveryCharge}
            onChange={(e) => setCourierDeliveryCharge(e.target.value)}/>
            <button className="admin-order-details-add-btn" onClick={addCourierDeliveryCharge}>Update Courier Delivery Charge</button>
        </div>

        <div className="admin-order-details-tracking-url-section">
            <button className="admin-order-details-add-btn" onClick={handleDeliveryIssue}>{order.delivery_issue ? "Mark as Delivery Issue Resolved" : "Mark as Delivery issue Occurred"}</button>
        </div>

        <div className="admin-order-details-admin-notes-section">
            <div className="admin-order-details-notes-display">
              {
                adminNoteList.map((note, idx) => 
                  <div className="admin-order-details-note" key={idx}>
                    <p className="admin-order-details-note-message">{note.message}</p>
                    <div className="admin-order-details-note-meta">
                      <span className="admin-order-details-note-time" style={{fontSize: "0.8em"}}>{note.created_at}</span>
                      <span className="admin-order-details-note-author" style={{fontSize: "0.8em"}}> - {note.admin_details}</span>
                    </div>
                  </div>
                )
              }
            </div>
            <div className="admin-order-details-add-note-section">
            <textarea
                placeholder="Write a note..."
                className="admin-order-details-note-textbox"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
            ></textarea>
            <button className="admin-order-details-add-btn" onClick={() => {
                if(isYes()) {
                  addAdminNote(adminNote);
                  alert("Order status updated.");
                  setAdminNote("");
                }
              }}>Add Note</button>
            </div>
        </div>
      </div>

    </div>
  );
}

export default React.memo(AdminOrderDetails);
