import '../assets/styles/AdminDashboard.css';

import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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


function OrderDashboard() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

    const districtsOfBangladesh = ['District', 'Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Chuadanga', 'Cumilla', "Cox's Bazar", 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Maulvibazar', 'Meherpur', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narayanganj', 'Narail', 'Narsingdi', 'Natore', 'Nawabganj', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajgonj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'];
    const orderStatusNames = [
        'Placed', 'Processing', 'Confirmed', 'Packing', 'Ready to Ship', 'Shipped', 
        'Cancelled', 'Pickup Requested', 'Assigned for Pickup', 'Picked', 
        'Pickup Failed', 'Pickup Cancelled', 'At the Sorting HUB', 'In Transit', 
        'Received at Last Mile HUB', 'Assigned for Delivery', 'Delivered', 
        'Partial Delivery', 'Return', 'Delivery Failed', 'On Hold', 
        'Payment Invoice', 'Paid Return', 'Exchange'
    ]
    const paymentStatusNames = ['Pending', 'PAID', 'Partially Paid']

    const [orderFilter, setOrderFilter] = useState(JSON.parse(localStorage.getItem('FABRICRAFT_ORDER_DETAILS_FILTER')) || {
        "order_id": "",
        "customer_phone": "",
        "customer_name": "",
        "district": "",
    });

    
  const [visibleOrderList, setVisibleOrderList] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  
  const handleFilterChange = (event) => {
    const { name, value } = event.target; 
    console.log(name, ":", value);
    console.log("orderFIlter:", orderFilter);
    setOrderFilter((prv) => {return { ...prv, [name]: value }});
  }

  const [filterTimeout, setFilterTimeout] = useState(null);

  const filterOrders = async () => {
    // Clear any existing timeout
    if (filterTimeout) {
      clearTimeout(filterTimeout);
    }

    // Set a new timeout
    const timeout = setTimeout(() => {
      const orders = updateVisibleOrderListByFilter();
      if(!orders || !orders.length) return;

      let filteredOrders = [...orders];
      if (orderFilter.order_id) {
        filteredOrders = filteredOrders.filter(
          order => order.order_id.toString().toLowerCase().includes(orderFilter.order_id.toString().toLowerCase())
        );
      }
      if (orderFilter.customer_phone) {
        filteredOrders = filteredOrders.filter(
          order => order.delivery_details.phone.toString().toLowerCase().includes(orderFilter.customer_phone.toString().toLowerCase())
          );
      }
      if (orderFilter.customer_name) {
        filteredOrders = filteredOrders.filter(
          order => order.delivery_details.name.toString().toLowerCase().includes(orderFilter.customer_name.toString().toLowerCase())
        );
      }
      if (orderFilter.district && orderFilter.district != "District") {
        filteredOrders = filteredOrders.filter(
          order => order.delivery_details.district.toString().toLowerCase().includes(orderFilter.district.toString().toLowerCase())
        );
      }
      setVisibleOrderList(filteredOrders);
    }, 500);

    // Save the timeout reference
    setFilterTimeout(timeout);

    // Cleanup on unmount or orderFilter change
    return () => {
      clearTimeout(timeout);
    };
  }

  useEffect(() => {
    filterOrders();
  }, [orderFilter, visibleOrderList]);

  function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    localStorage.setItem('FABRICRAFT_ORDER_DETAILS_FILTER', JSON.stringify(orderFilter));
  }, [orderFilter])

  const fetchAllOrders = async () => {
    console.log("fetch all orders.")
    try {
      const ordersRef = collection(db, "orders");
      const querySnapshot = await getDocs(ordersRef);
  
      if (querySnapshot.empty) {
        console.log("No orders found.");
        return [];
      }
  
      const orders = querySnapshot.docs.map((doc) => doc.data());
      const sortedOrders = orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setAllOrders([...sortedOrders]);
      return sortedOrders;
    } 
    catch (error) {
      console.error("Error fetching all orders:", error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  },[])

  const [lastFilter, setLastFilter] = useState((localStorage.getItem('FABRICRAFT_ORDER_FILTER') || "All"));

  const showAllOrders = () => {
    const pendingOrders = [...allOrders];
    localStorage.setItem('FABRICRAFT_ORDER_FILTER', "All");
    
    if(lastFilter != "All") {  
      setLastFilter("All");
    }
    
    // if(!pendingOrders || !pendingOrders.length) return [];

    setVisibleOrderList(pendingOrders);
    return pendingOrders;
  };

  const fetchPendingOrders = () => {
    const pendingOrders = allOrders.filter(order => order.order_status === "Pending");
    localStorage.setItem('FABRICRAFT_ORDER_FILTER', "Pending");

    if(lastFilter != "Pending") {  
      setLastFilter("Pending");
    }
    
    // if(!pendingOrders || !pendingOrders.length) return [];

    setVisibleOrderList(pendingOrders);
    return pendingOrders;
  };

  const fetchPackagingOrders = () => {
    const packagingOrders = allOrders.filter(order => order.order_status === "Packaging");
    localStorage.setItem('FABRICRAFT_ORDER_FILTER', "Packaging");

    if(lastFilter != "Packaging") {  
      setLastFilter("Packaging");
    }
    
    // if(!packagingOrders || !packagingOrders.length) return [];

    setVisibleOrderList(packagingOrders);
    return packagingOrders;
  };

  const fetchOutForDeliveryOrders = () => {
    const outForDeliveryOrders = allOrders.filter(order => order.order_status === "Out For Delivery");
    localStorage.setItem('FABRICRAFT_ORDER_FILTER', "Out For Delivery");

    if(lastFilter != "Out For Delivery") {  
      setLastFilter("Out For Delivery");
    }

    // if(!outForDeliveryOrders || !outForDeliveryOrders.length) return [];

    setVisibleOrderList(outForDeliveryOrders);
    return outForDeliveryOrders;
  };

  const fetchDeliveredOrders = () => {
    const deliveredOrders = allOrders.filter(order => order.order_status === "Delivered");
    localStorage.setItem('FABRICRAFT_ORDER_FILTER', "Delivered");

    if(lastFilter != "Delivered") {  
      setLastFilter("Delivered");
    }
    
    // if(!deliveredOrders || !deliveredOrders.length) return [];

    setVisibleOrderList(deliveredOrders);
    return deliveredOrders;
  };

  const fetchReturnedOrders = () => {
    const returnedOrders = allOrders.filter(order => order.order_status === "Returned");
    localStorage.setItem('FABRICRAFT_ORDER_FILTER', "Returned");

    if(lastFilter != "Returned") {  
      setLastFilter("Returned");
    }
    
    // if(!returnedOrders || !returnedOrders.length) return [];

    setVisibleOrderList(returnedOrders);
    return returnedOrders;
  };

  const fetchCanceledOrders = () => {
    const canceledOrders = allOrders.filter(order => order.order_status === "Canceled");
    localStorage.setItem('FABRICRAFT_ORDER_FILTER', "Canceled");

    if(lastFilter != "Canceled") {  
      setLastFilter("Canceled");
    }
    
    // if(!canceledOrders || !canceledOrders.length) return [];

    setVisibleOrderList(canceledOrders);
    return canceledOrders;
  };

  const fetchIssueOrders = () => {
    const canceledOrders = allOrders.filter(order => order.delivery_issue);
    localStorage.setItem('FABRICRAFT_ORDER_FILTER', "Issue");

    if(lastFilter != "Issue") {
      setLastFilter("Issue");
    }
    
    // if(!canceledOrders || !canceledOrders.length) return [];

    setVisibleOrderList(canceledOrders);
    return canceledOrders;
  }

  const fetchPaidOrders = () => {
    const canceledOrders = allOrders.filter(order => order.is_paid);
    localStorage.setItem('FABRICRAFT_ORDER_FILTER', "Paid");

    if(lastFilter != "Paid") {
      setLastFilter("Paid");
    }
    
    // if(!canceledOrders || !canceledOrders.length) return [];

    setVisibleOrderList(canceledOrders);
    return canceledOrders;
  }

  const fetchUnpaidOrders = () => {
    const canceledOrders = allOrders.filter(order => !order.is_paid && order.order_status != "Canceled");
    localStorage.setItem('FABRICRAFT_ORDER_FILTER', "Unpaid");

    if(lastFilter != "Unpaid") {
      setLastFilter("Unpaid");
    }
    
    // if(!canceledOrders || !canceledOrders.length) return [];

    setVisibleOrderList(canceledOrders);
    return canceledOrders;
  }

  const updateVisibleOrderListByFilter = () => {
    console.log("=>> lastFilter:", lastFilter);
    if(lastFilter == "Issue") {
      return fetchIssueOrders();
    }
    else if(lastFilter == "Paid") {
      return fetchPaidOrders();
    }
    else if(lastFilter == "Unpaid") {
      return fetchUnpaidOrders();
    }
    else if(lastFilter == "Canceled") {
      return fetchCanceledOrders();
    }
    else if(lastFilter == "Returned") {
      return fetchReturnedOrders();
    }
    else if(lastFilter == "Delivered") {
      return fetchDeliveredOrders();
    }
    else if(lastFilter == "Out For Delivery") {
      return fetchOutForDeliveryOrders();
    }
    else if(lastFilter == "Packaging") {
      return fetchPackagingOrders();
    }
    else if(lastFilter == "Pending") {
      return fetchPendingOrders()
    }
    else if(lastFilter == "All") {
      return showAllOrders();
    }
  }
  
  useEffect(() => {
    updateVisibleOrderListByFilter();
  }, [lastFilter, allOrders]);

const [statistics, setStatistics] = useState({
  totalValue: 0,
  totalOrders: 0,
  paid: 0,
  delivered: { count: 0, value: 0, percentage: 0, delivery_charge: 0 },
  processing: { count: 0, value: 0, percentage: 0, delivery_charge: 0 },
  returned: { count: 0, value: 0, percentage: 0, delivery_charge: 0 },
});

const calculateStatistics = (orders) => {
  let totalValue = 0;
  let totalOrders = 0;
  let paid = 0;

  let delivered = { count: 0, value: 0, delivery_charge: 0 };
  let processing = { count: 0, value: 0, delivery_charge: 0 };
  let returned = { count: 0, value: 0, delivery_charge: 0 };

  orders.forEach((order) => {
    if(order.is_paid){
      if(order.order_status === "Returned") {
        paid -= (
          (order.courier_delivery_charge ? parseFloat(order.courier_delivery_charge) : 0)
        );
      }
      else {
        paid += (
          parseFloat(order.order_calculations.total_price) -
          (order.courier_delivery_charge ? parseFloat(order.courier_delivery_charge) : 0) -
          parseFloat((order.special_discount || 0)).toFixed(2)
        );
      }
    } 
    
    if (order.order_status === "Delivered") {
      totalOrders += 1;
      delivered.count += 1;

      totalValue += parseFloat(order.order_calculations.total_price);
      totalValue -= order.courier_delivery_charge
        ? parseFloat(order.courier_delivery_charge)
        : 0;
      totalValue -= parseFloat((order.special_discount || 0)).toFixed(2);

      delivered.value += parseFloat(order.order_calculations.total_price);
      delivered.delivery_charge += parseFloat(order.courier_delivery_charge || 0);
    } 
    else if (order.order_status === "Processing" || order.order_status === "Out For Delivery") {
      totalOrders += 1;
      processing.count += 1;

      totalValue += parseFloat(order.order_calculations.total_price);
      totalValue -= order.courier_delivery_charge
        ? parseFloat(order.courier_delivery_charge)
        : 0;
      totalValue -= parseFloat((order.special_discount || 0)).toFixed(2);

      processing.value += parseFloat(order.order_calculations.total_price);
      processing.delivery_charge += parseFloat(order.courier_delivery_charge || 0);
    } 
    else if (order.order_status === "Returned") {
      totalOrders += 1;
      returned.count += 1;

      totalValue -= order.courier_delivery_charge
        ? parseFloat(order.courier_delivery_charge)
        : 0;

      returned.value += parseFloat(order.order_calculations.total_price);
      returned.delivery_charge += parseFloat(order.courier_delivery_charge || 0);
    }
  });

  // Convert percentages to numbers for calculations
  const deliveredPercentage = parseFloat(
    ((delivered.count / totalOrders) * 100).toFixed(2)
  );
  const processingPercentage = parseFloat(
    ((processing.count / totalOrders) * 100).toFixed(2)
  );
  const returnedPercentage = parseFloat(
    ((returned.count / totalOrders) * 100).toFixed(2)
  );

  // Proper pie chart gradient calculation
  setStatistics({
    totalValue,
    totalOrders,
    paid,
    delivered: {
      ...delivered,
      percentage: deliveredPercentage,
    },
    processing: {
      ...processing,
      percentage: processingPercentage,
    },
    returned: {
      ...returned,
      percentage: returnedPercentage,
    },
    piechart: `conic-gradient(
      #3cb371 0% ${deliveredPercentage}%,
      #FFD700 ${deliveredPercentage}% ${
        deliveredPercentage + processingPercentage
      }%,
      #DF484F ${
        deliveredPercentage + processingPercentage
      }% 100%
    )`,
  });
};


useEffect(() => {
  console.log("statistics: ", statistics);
}, [statistics])

useEffect(() => {
  console.log("All order fatched");
  if (allOrders && allOrders.length > 0) {
    calculateStatistics(allOrders);
  }
}, [allOrders]);

  const [accountBalance, setAccountBalance] = useState(0);

  const calculateAccountBalance = async () => {
    const totalRef = collection(db, "totals");
    const totalRefSnap = await getDocs(totalRef);
    if (totalRefSnap.empty) return;
    const total = totalRefSnap.docs.map((doc) => doc.data())[0].total;

    const useRef = collection(db, "uses");
    const useRefSnap = await getDocs(useRef);
    if (useRefSnap.empty) return;
    const use = useRefSnap.docs.map((doc) => doc.data())[0].total;

    setAccountBalance(total-use+statistics.totalValue);
  }
  
  useEffect(() => {
    calculateAccountBalance();
  }, [statistics]);

  return (
    <div className="admin-panel-container" style={{marginBottom: '200px'}}>
        <h1 className="page-title">Order Dashboard</h1>
      
        <div className="order-management-container">
            <div className="order-management-filters">
                <input type="text" placeholder="Order ID" value={orderFilter.order_id} name='order_id' className="order-management-filter-input" onChange={handleFilterChange}/>
                <input type="text" placeholder="Phone no" value={orderFilter.customer_phone} name='customer_phone' className="order-management-filter-input" onChange={handleFilterChange}/>
                <input type="text" placeholder="Name" value={orderFilter.customer_name} name='customer_name' className="order-management-filter-input" onChange={handleFilterChange}/>
            </div>
            <div className="order-management-filters">
                <select className="order-management-filter-select" name="district" value={orderFilter.district} onChange={handleFilterChange}>
                {
                    districtsOfBangladesh.map((district, idx) => {
                        return (<option key={idx} value={district}>{district}</option>);
                    })
                }
                </select>
            </div>
            <div className="order-management-filters">
                <DatePicker 
                    selected={startDate}
                    onChange={(date) => {
                        if(startDate && endDate && date > startDate) setStartDate(null);
                        else setStartDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"                   
                    placeholderText="From"  
                    isClearable 
                />
                <DatePicker 
                    selected={endDate}
                    onChange={(date) => {
                        if(startDate && endDate && date < startDate) {
                            setEndDate(null);
                        }
                        else setEndDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"                   
                    placeholderText="To"  
                    isClearable 
                />
            </div>
            <button className="order-management-filter-button" onClick={filterOrders} style={{width: "100%"}}>Filter</button>

            <div className="admin-order-dashboard-overall-statistics-container">
              <div className="admin-order-dashboard-header">
                <h3>Overall Statistics</h3>
                <h4 className="see-all-link">Account Balance: <span style={{color: "green"}}>{accountBalance.toFixed(2)}</span></h4>
              </div>
              <div className="admin-order-dashboard-content">
                <div className="admin-order-dashboard-total-value-section">
                  <div className="admin-order-dashboard-circle-chart">
                    
                    <div
                      className="admin-order-dashboard-circle"
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        background: `${statistics.piechart}`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "relative",
                      }}
                    >
                      <div className="admin-order-dashboard-value" style={{marginTop: "40px"}}>
                        <span className="admin-order-dashboard-currency">৳</span>
                        <span className="admin-order-dashboard-amount">
                          <span> {parseFloat(statistics.totalValue).toFixed(2)} </span> <br/> 
                          <span style={{color: "yellow", fontSize: "0.5em"}}>({parseFloat(statistics.paid).toFixed(2)} paid)</span> 
                        </span>
                      </div>
                      <span className="admin-order-dashboard-orders">{statistics.totalOrders} Orders</span>
                    </div>


                  </div>
                </div>
                <div className="admin-order-dashboard-details-section">
                  <div className="admin-order-dashboard-detail delivered">
                    <span className="admin-order-dashboard-label">Delivered</span>
                    <span className="admin-order-dashboard-percentage">{statistics.delivered.percentage}%</span>
                    <span className="admin-order-dashboard-orders-info">{statistics.delivered.count} orders | ৳{statistics.delivered.value}<span style={{color: 'red'}}> | ৳{parseFloat(statistics.delivered.delivery_charge).toFixed(2)}</span></span>
                  </div>
                  <div className="admin-order-dashboard-detail admin-order-dashboard-processing">
                    <span className="admin-order-dashboard-label">Delivery Processing</span>
                    <span className="admin-order-dashboard-percentage" style={{color: "#FFD700"}}>{statistics.processing.percentage}%</span>
                    <span className="admin-order-dashboard-orders-info">{statistics.processing.count} orders | ৳{statistics.processing.value}<span style={{color: 'red'}}> | ৳{parseFloat(statistics.processing.delivery_charge).toFixed(2)}</span></span>
                  </div>
                  <div className="admin-order-dashboard-detail admin-order-dashboard-returned">
                    <span className="admin-order-dashboard-label">Returned</span>
                    <span className="admin-order-dashboard-percentage" style={{color: "#DF484F"}}>{statistics.returned.percentage}%</span>
                    <span className="admin-order-dashboard-orders-info">
                    {statistics.returned.count} orders | ৳{statistics.returned.value}<span style={{color: 'red'}}> | ৳{parseFloat(statistics.returned.delivery_charge).toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-management-status-actions">
                <div className="order-management-status-action-row">
                    <button className={`order-management-status-action-button ${lastFilter == "All" ? "admin-order-dashboard-filter-selected" : ""}`} onClick={showAllOrders}>All Orders</button>
                    <button className={`order-management-status-action-button ${lastFilter == "Pending" ? "admin-order-dashboard-filter-selected" : ""}`} onClick={fetchPendingOrders}>Panding Orders</button>
                    <button className={`order-management-status-action-button ${lastFilter == "Packaging" ? "admin-order-dashboard-filter-selected" : ""}`} onClick={fetchPackagingOrders}>Packaging Orders</button>
                </div>

                <div className="order-management-status-action-row">
                    <button className={`order-management-status-action-button ${lastFilter == "Out For Delivery" ? "admin-order-dashboard-filter-selected" : ""}`} onClick={fetchOutForDeliveryOrders}>Out for Delivery</button>
                    <button className={`order-management-status-action-button ${lastFilter == "Issue" ? "admin-order-dashboard-filter-selected" : ""}`} onClick={fetchIssueOrders}>Issues</button>
                </div>

                <div className="order-management-status-action-row">
                    <button className={`order-management-status-action-button ${lastFilter == "Canceled" ? "admin-order-dashboard-filter-selected" : ""}`} onClick={fetchCanceledOrders}>Canceled</button>
                    <button className={`order-management-status-action-button ${lastFilter == "Returned" ? "admin-order-dashboard-filter-selected" : ""}`} onClick={fetchReturnedOrders}>Returned</button>
                    <button className={`order-management-status-action-button ${lastFilter == "Delivered" ? "admin-order-dashboard-filter-selected" : ""}`} onClick={fetchDeliveredOrders}>Delivered</button>
                </div>

                <div className="order-management-status-action-row">
                    <button className={`order-management-status-action-button ${lastFilter == "Paid" ? "admin-order-dashboard-filter-selected" : ""}`} onClick={fetchPaidOrders}>Paid</button>
                    <button className={`order-management-status-action-button ${lastFilter == "Unpaid" ? "admin-order-dashboard-filter-selected" : ""}`} onClick={fetchUnpaidOrders}>Unpaid</button>
                </div>
            </div>

            <div className="order-management-table-container">
                <table className="order-management-table">
                    <thead>
                        <tr>
                            <th>{visibleOrderList.length}</th>
                            <th>ID</th>
                            <th>Value</th>
                            <th>charge</th>
                            <th>Delivery Status</th>
                            <th>Payment Status</th>
                            <th>Phone no</th>
                        </tr>
                    </thead>
                    <tbody>
                    {visibleOrderList.map((order, idx) => (
                        <tr key={idx} style={{cursor: "pointer"}} onClick={() => navigate(order.order_id, {state: order})}>
                            <td>{idx+1}</td>
                            <td>{order.order_id}</td>
                            <td>{(parseFloat(order.order_calculations.total_price)- parseFloat((order.special_discount || 0))).toFixed(0)}</td>
                            <td>{order.courier_delivery_charge}
                              {
                                order.special_discount && parseFloat(order.special_discount) > 0.00 &&
                                <span style={{fontSize: "0.7em", color: "Red"}}><br/>(SPD:{order.special_discount})</span>
                              }
                            </td>
                            <td>{order.order_status}</td>
                            <td>{order.is_paid ? "Paid" : "Unpaid"}</td>
                            <td> 
                              <span>{order.delivery_details.name}</span>
                              <br /><span>{order.delivery_details.phone}</span>
                              <br /><span>{order.delivery_details.district}</span>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="order-management-actions">
                {false &&
                <div className="order-management-action-item">
                    <input type="text" placeholder="Order ID" className="order-management-input" />
                    <button className="order-management-action">Receive Returned Package</button>
                </div>}
            </div>
        </div>
    </div>
  );
}

export default React.memo(OrderDashboard);