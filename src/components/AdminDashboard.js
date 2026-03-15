import '../assets/styles/AdminDashboard.css';

import { useNavigate } from 'react-router-dom';
import React, { useContext } from 'react';


function AdminDashboard() {
  const navigate = useNavigate();


  return (
    <div className="admin-panel-container">
      <h1 className="page-title">Admin Panel</h1>
      
      <div className="card-container">

        <div className="card" onClick={() => navigate('product-management')} style={{cursor: 'pointer'}}>
          <i className="icon fa fa-shopping-bag" aria-hidden="true"></i>
          <p>Product Management</p>
        </div>

        <div className="card" onClick={() => navigate('order-management')} style={{cursor: 'pointer'}}>
          <i className="icon fa fa-shopping-cart" aria-hidden="true"></i>
          <p>Order Management</p>
        </div>

      </div>
      <br /><br /><br />
    </div>
  );
}

export default React.memo(AdminDashboard);