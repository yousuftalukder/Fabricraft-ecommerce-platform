import '../assets/styles/Login.css';
import "../assets/styles/ProductManager.css";

import PhoneIcon from '../assets/images/phone-icon.png';
import BrandLogo from '../assets/images/fabricraft-logo.png';
import KeyIcon from '../assets/images/key-icon.jpg';

import React from 'react';
import Axios from 'axios'

import { useState } from 'react';


import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from "react-router-dom";

import { IsCorrectPhoneNumber } from '../utils/SecurityUtils';


const axiosInstance = Axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

  
function Login() {
    console.log('Login is being loaded . . . ');

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [phoneNo, setPhoneNo] = useState("");

    const [searchOnGoing, setSearchOnGoing] = useState(false);
    
    const { authData } = useContext(AuthContext);
    const {handleUserLogin, userProfile, showToast} = authData;
    
    if(userProfile != null) {
        return <Navigate to='/'/>
    }

    const sendOTP = async (phoneNo) => {
        console.log('sendOTP');

        const sendOtpResponse = await axiosInstance.post("auth/send-otp/", {
            'phone_number': phoneNo,
        });
        const data = ('data' in sendOtpResponse) && (await sendOtpResponse.data);
        return [data['status']==='OK', data['message'], data['count']];
    };

    const submitButtonClicked = async () => {
        console.log('submitButtonClicked');

        if (otpSent) {
            setSearchOnGoing(true);
            const [status, message] = await handleUserLogin({phoneNo, otp});
            setSearchOnGoing(false);
            showToast(message);

            if(status && otp.length === 6) {
                localStorage.setItem(`${phoneNo}_OTP`, otp);
                return <Navigate to='/'/>
            }
        } 
        else if (IsCorrectPhoneNumber(phoneNo)) {
            {
                const oldOtp = localStorage.getItem(`${phoneNo}_OTP`)
                console.log("old otp: ", oldOtp, ", phone: ", phoneNo);
                const [status, message] = await handleUserLogin({phoneNo, otp: oldOtp});
                if(status) {
                    showToast(message);
                    return <Navigate to='/'/>
                }
            }

            setOtpSent(true);
            const [isOtpSent, message, count] = await sendOTP(phoneNo);
            if (!isOtpSent) {
                setOtpSent(false);
            }
            showToast(message);
            setTimeout(() => {
                if(count >= 5) {
                    showToast("Can't send more than 5 OTP in 24 hour.");
                }
                else if(count >= 2) {
                    showToast(`Total ${count} OTP sent in last 24 hour.`);
                }
                
            }, 3500);
        } 
        else {
            showToast("Please Enter A Valid Phone Number.");
        }
    };

    const backButtonClicked = () => {
        console.log('backButtonClicked');
            
        setOtpSent(false);      
        setOtp("");
        setPhoneNo("");
    };

    const handleOnchange = (event) => {
        if (otpSent) {
            setOtp(event.target.value);
        } else {
            setPhoneNo(event.target.value);
        }
    }

    return (
        <div className="container">
            <div className="brand">
                <img src={BrandLogo} alt="Logo" />
                <h1>
                    <span className="bold">Fabri</span>
                    <span className="light">Craft</span>
                </h1>
            </div>
            <p className="tagline">Sign In With A Phone Number</p>
            <div className="form-container">
                <div className="input-container">
                    <img src={otpSent ? KeyIcon : PhoneIcon} alt="Phone Icon" />
                    <input
                        type={(otpSent && otp.length > 6 && otp[6] === '-') ? "password" : "text"}
                        placeholder={otpSent ? "OTP Code" : "Phone Number"}
                        value={otpSent ? otp : phoneNo}
                        className="input-box"
                        onChange={handleOnchange}
                    />
                </div>

                {searchOnGoing && (<div class="lds-ripple"><div></div><div></div></div>)}

                <button className="login-button" onClick={submitButtonClicked}>
                    {otpSent ? "Submit" : "Login"}
                </button>
                {otpSent ? (
                    <button className="login-button" onClick={backButtonClicked}>
                        Back
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default React.memo(Login);