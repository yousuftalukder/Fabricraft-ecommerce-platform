import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { useNavigate, useLocation, Link } from "react-router-dom";
import React, { useContext, useState, useEffect, useCallback } from "react";

import { AuthContext } from '../contexts/AuthContext';
import { IsCorrectPhoneNumber, IsValidEmail } from '../utils/SecurityUtils';

import * as metaPixelEvents from "../utils/MetaPixelEvent";


function DeliveryDetails() {            
  const navigate = useNavigate();
  const { state } = useLocation();
  
  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [deliveryDetailsInitiated, setDeliveryDetailsInitiated] = useState(false);
  const [deliveryDetails, setDeliveryDetails] = useState({
    "name": "",
    "phone": "",
    "email": "",
    "address": "",
    "district": "",
    "note": "",
  });

  const districtsOfBangladesh = ['Bagerhat', 'Bandarban', 'Barguna', 'Barishal', 'Bhola', 'Bogura', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Chuadanga', 'Cumilla', "Cox's Bazar", 'Dhaka', 'Dinajpur', 'Faridpur', 'Feni', 'Gaibandha', 'Gazipur', 'Gopalganj', 'Habiganj', 'Jamalpur', 'Jashore', 'Jhalokati', 'Jhenaidah', 'Joypurhat', 'Khagrachari', 'Khulna', 'Kishoreganj', 'Kurigram', 'Kushtia', 'Lakshmipur', 'Lalmonirhat', 'Madaripur', 'Magura', 'Manikganj', 'Maulvibazar', 'Meherpur', 'Munshiganj', 'Mymensingh', 'Naogaon', 'Narayanganj', 'Narail', 'Narsingdi', 'Natore', 'Nawabganj', 'Netrokona', 'Nilphamari', 'Noakhali', 'Pabna', 'Panchagarh', 'Patuakhali', 'Pirojpur', 'Rajbari', 'Rajshahi', 'Rangamati', 'Rangpur', 'Satkhira', 'Shariatpur', 'Sherpur', 'Sirajgonj', 'Sunamganj', 'Sylhet', 'Tangail', 'Thakurgaon'];
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const updateFilteredDistricts = (val) => {
    if(!val) {
      setFilteredDistricts([...districtsOfBangladesh]);
    }
    else {
      setFilteredDistricts(
        districtsOfBangladesh.filter((d) =>
          d.toLowerCase().startsWith(val.toLowerCase())
        )
      );
    }
    setIsDropdownVisible(true);
  }

  const handleDistrictChange = (e) => {
    const value = e.target.value;
    setDeliveryDetails((prev) => ({
      ...prev,
      district: value
    }));
    updateFilteredDistricts(value);
  };
  
  const handleDistrictSelect = (d) => {
    setDeliveryDetails((prev) => ({
      ...prev,
      district: d
    }));
    setIsDropdownVisible(false);
  };

  const isDistrictSelected = () => {
    const district = deliveryDetails.district;
    for (const d of districtsOfBangladesh) {
      if (district === d) return true;
    }
    return false;
  }

  if(!state) {
    navigate('/cart');
  }
  
  useEffect(() => {
    const localDeliveryDetails = JSON.parse(localStorage.getItem('FABRICRAFT_DELIVERY_DETAILS'));
    if (localDeliveryDetails) 
    {
      setDeliveryDetails(localDeliveryDetails);
    }
    setDeliveryDetailsInitiated(true);
  }, []);

  useEffect(() => {
    const localDeliveryDetails = JSON.parse(localStorage.getItem('FABRICRAFT_DELIVERY_DETAILS'));
    if (JSON.stringify(deliveryDetails) !== JSON.stringify(localDeliveryDetails) && deliveryDetailsInitiated) 
    {
      localStorage.setItem('FABRICRAFT_DELIVERY_DETAILS', JSON.stringify(deliveryDetails));
    }
  }, [deliveryDetails]);

  useEffect(() => {
    metaPixelEvents.DeliveryDetailsPagePixelEvent();
  }, []);

  return (
    <div className="cart-page-container" style={{marginBottom: "500px"}}>
        
        <div className="delivery-form-container">
          <form className="delivery-form">
            <div className="delivery-form-group">
              <label className="delivery-label" htmlFor="name">Name (নাম)</label>
              <input className="delivery-input" type="text" id="name" name="name" placeholder="Name" 
              value={deliveryDetails.name}
                onChange={(e) => {
                  setDeliveryDetails((prev) => ({
                    ...prev,
                    name: e.target.value
                  }));
                }}
              />
            </div>

            <div className="delivery-form-group">
              <label className="delivery-label" htmlFor="phone">Phone (ফোন নাম্বার)</label>
              <input className="delivery-input" type="text" id="phone" name="phone" placeholder="Phone" 
                value={deliveryDetails.phone}
                onChange={(e) => {
                  setDeliveryDetails((prev) => ({
                    ...prev,
                    phone: e.target.value
                  }));
                }}
              />
            </div>

            <div className="delivery-form-group">
              <label className="delivery-label" htmlFor="email">E-mail (ই-মেইল) (optional)</label>
              <input className="delivery-input" type="email" id="email" name="email" placeholder="E-mail" 
                value={deliveryDetails.email}
                onChange={(e) => {
                  setDeliveryDetails((prev) => ({
                    ...prev,
                    email: e.target.value
                  }));
                }}
              />
            </div>

            <div className="delivery-form-group">
              <label className="delivery-label" htmlFor="address">Address (ঠিকানা)</label>
              <input className="delivery-input" type="text" id="address" name="address" placeholder="Address" 
                value={deliveryDetails.address}
                onChange={(e) => {
                  setDeliveryDetails((prev) => ({
                    ...prev,
                    address: e.target.value
                  }));
                }}
              />
            </div>

            <div className="delivery-form-group">
              <label className="delivery-label" htmlFor="district">District (জেলা)</label>
              <input className="delivery-input" 
                type="text"
                id="district"
                name="district"
                placeholder="District"
                value={deliveryDetails.district}
                onChange={handleDistrictChange}
                onBlur={() => setTimeout(() => {
                  setIsDropdownVisible(false);
                }, 200)}
                onFocus={(e) => {updateFilteredDistricts(e.target.value)}}
              />
              {isDropdownVisible && (
                <div className="delivery-district-dropdown">
                  {filteredDistricts.map((d, index) => (
                    <div
                      key={index}
                      className="delivery-district-dropdown-item"
                      onClick={() => handleDistrictSelect(d)}>
                      {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="delivery-form-group">
              <label className="delivery-label" htmlFor="note">Note (নোট) (optional)</label>
              <textarea className="delivery-textarea"
                id="note"
                name="note"
                placeholder="Note"
                value={deliveryDetails.note}
                onChange={(e) => {
                  setDeliveryDetails((prev) => ({
                    ...prev,
                    note: e.target.value
                  }));
                }}
              />
            </div>
          </form>
        </div>

        <div className="cart-fixed-bar-container" style={{fontSize: "1em", cursor: "text"}}>
          <div style={{paddingLeft: "10px", paddingRight: "10px", cursor: "pointer"}} onClick={() => {
            navigate(-1);
          }}>
            <i class="fa fa-chevron-left" aria-hidden="true"></i>
            <span style={{marginLeft: "20px",}}>Back</span>
          </div>
            <span className="divider" style={{marginLeft: "20px", marginRight: "20px", }}>|</span>
          <div style={{paddingLeft: "10px", paddingRight: "10px", cursor: "pointer"}} onClick={() => {
            if (!isDistrictSelected()) {
              showToast("Please select your District.");
              return;
            }
            if(!IsCorrectPhoneNumber(deliveryDetails.phone))  {
              showToast("Please enter your phone number.");
              return;
            }
            if(!IsValidEmail(deliveryDetails.email)) {
              const updatedDeliveryDetails = {
                ...deliveryDetails,
                email: "",
              };
              localStorage.setItem('FABRICRAFT_DELIVERY_DETAILS', JSON.stringify(updatedDeliveryDetails));
            }
            navigate('/checkout', {'state': true});
          }}>
            <span style={{marginRight: "20px",}}>Next</span>
            <i class="fa fa-chevron-right" aria-hidden="true"></i>
          </div>
        </div>
    </div>
  );
}

export default React.memo(DeliveryDetails);
