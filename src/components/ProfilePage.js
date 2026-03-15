import '../assets/styles/ProfilePage.css';

import ClockIcon from '../assets/images/clockicon.png';
import Coin from '../assets/images/coin-icon.png';
import ProfileIcon from '../assets/images/user-icon.png';
import CallIcon from '../assets/images/call-icon.png';
import EmailIcon from '../assets/images/mail-icon.png';
import AddressIcon from '../assets/images/address-icon.png';

import React, { useState, useEffect } from 'react';
import {useNavigate } from 'react-router-dom';

import * as metaPixelEvents from "../utils/MetaPixelEvent";


function getRandomBackgroundColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function ProfilePage() {
  console.log('profile page is being loaded');
  const navigate = useNavigate();
  const randomBackgroundColor = getRandomBackgroundColor();

  const [deliveryDetails, setDeliveryDetails] = useState(JSON.parse(localStorage.getItem('FABRICRAFT_DELIVERY_DETAILS')) || {});
  const [localOrders, setLocalOrders] = useState(JSON.parse(localStorage.getItem('FABRICRAFT_LOCAL_ORDERS')) || []);

  const registeredYearsAgo = () => {
    if (!localOrders || localOrders.length === 0) return 0;
  
    const joinedDate = new Date(localOrders[0].created_at);
    const currentDate = new Date();
  
    const timeDifference = currentDate - joinedDate;
    const millisecondsInYear = 365.25 * 24 * 60 * 60 * 1000;
    
    const yearsAgo = timeDifference / millisecondsInYear;
    return Math.floor(yearsAgo);
  };
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    metaPixelEvents.ProfilePagePixelEvent();
  }, []);

  return (
    <div>
        <div className="profile-container">
          
          <div className="profile-header">
            <div className="profile-image" style={{ background: randomBackgroundColor }}>
            <div className="initials">{deliveryDetails.name ? deliveryDetails.name.split(' ').map(word => word[0]).join('') : 'U'}</div>
            </div>

            <div className="user-info">
              <div className="username">{deliveryDetails.name || "User"}</div>
              <div className="registered-since">
                <img src={ClockIcon} alt="reg" className="registration-icon" />
                Registered {registeredYearsAgo()} years ago
              </div>
            </div>

            <div className="user-points-container">
              <div className="user-points">
                <img src={Coin} alt="Gold Coin Icon" className="gold-coin" />
                <div className="total-points">{0}</div>
                <div className="points-text">coins</div>
              </div>
            </div>
          </div>

          <div className="profile-row">
            <img src={CallIcon} alt="PhoneNo" className="icon" />
            <div className="editable-light">{deliveryDetails.phone || "01XXXXX3629"}</div>
          </div>

          <div>
            <div className="profile-row">
              <img src={ProfileIcon} alt="UserIcon" className="icon" />
              <div className="editable-light textbox">{deliveryDetails.name || "User"}</div>
            </div>

            <div className="profile-row">
              <img src={EmailIcon} alt="Email" className="icon" />
              <div className="editable-light textbox">{deliveryDetails.email || "user@email.com"}</div>
            </div>

            <div className="profile-row">
              <img src={AddressIcon} alt="Address" className="icon" />
              <div className="editable-light textbox">{deliveryDetails.address || "Address"}, {deliveryDetails.district}</div>
            </div>
            
            <br />            
            <div className="profile-row order-history" onClick={() => navigate('/order-history')}>
              <i className="fa fa-heart" aria-hidden="true" style={{marginLeft: 15}}></i>
              <div className="order-history-text" style={{marginLeft: 25}}>Order History</div>
              <i className="fa fa-chevron-right" aria-hidden="true" style={{textAlign: 'right', marginRight: 15}}></i>
            </div>
          </div>
        </div>
        <br /><br /> <br />
    </div>
  )
}

export default React.memo(ProfilePage);