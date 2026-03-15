import '../assets/styles/TopNavbar.css'

import React, { useState, useEffect } from 'react';
import {useNavigate, useLocation } from 'react-router-dom';

import UserIcon from '../assets/images/user-icon.png';
import BrandLogo from '../assets/images/fabricraft-logo.png';

import { IsCorrectPhoneNumber } from '../utils/SecurityUtils';


const BackButton = () => {
  console.log('Back button loaded');
  const navigate = useNavigate();
  const location = useLocation();

  const isBackButtonVisible = (location.pathname !== '/');

  const goBack = () => {
    console.log('back button clicked');
    navigate(-1);
  };
  
  return (
    isBackButtonVisible &&  
    <div onClick={goBack}>
      <i className="fa fa-chevron-left top-navbar-back-button" aria-hidden="true"></i>
    </div>
  );
};

function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [deliveryDetails, setDeliveryDetails] = useState(JSON.parse(localStorage.getItem('FABRICRAFT_DELIVERY_DETAILS')), {});

  useEffect(() => {
    if(location.pathname == '/checkout') {
      setDeliveryDetails(JSON.parse(localStorage.getItem('FABRICRAFT_DELIVERY_DETAILS')));
    }
  }, [location]);

  
  return (
    <div>
      <div className="top-navbar">
        <div className="top-navbar-left">
          
          <BackButton />
          
          <div onClick={() => {
              if(location.pathname !== '/') {
                navigate('');
              }
            }} className="top-navbar-icon-and-brand"  style={{cursor: 'pointer'}}>
            <img src={BrandLogo} alt="brand" className="top-navbar-brand-icon"/>
            <span className="top-navbar-brand-name">
              <span className="bold">Fabri</span>
              <span className="light">Craft</span>
            </span>
          </div>
        </div>
        
        {deliveryDetails && deliveryDetails.phone && IsCorrectPhoneNumber(deliveryDetails.phone) &&
        <div onClick={() => {
            if(location.pathname !== '/profile') {
              navigate("profile");
            }
          }} className="top-navbar-right" style={{cursor: 'pointer'}}>
          <span className="top-navbar-user-username">Hi, {deliveryDetails.name ? deliveryDetails.name.split(' ')[0].slice(0, 9) : 'User'}</span>
          <img src={UserIcon} alt="User" className="top-navbar-user-icon"/>
        </div>}
      </div>
      <div className='navbar-bottom'></div>
    </div>
  )
}

export default React.memo(TopNavbar);
