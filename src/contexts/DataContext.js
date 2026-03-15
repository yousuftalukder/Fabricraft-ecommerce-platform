import '../assets/styles/AdminDashboard.css';

import React, { createContext, useMemo, useContext, useState, useEffect } from "react";
import Axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

export const DataContext = createContext();

const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

function DataProvider({children}) {
  const { authData } = useContext(AuthContext);
  const {getAccessToken} = authData;
  
  const [wishlistItemCount, setWishlistItemCount] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const localWishlist = JSON.parse(localStorage.getItem('FABRICRAFT_WISHLIST'));
    console.log("localWishlist count updated:", localWishlist);

    if(localWishlist && localWishlist.length > 0) {
      setWishlistItemCount(localWishlist.length);
    }

    const localCartlist = JSON.parse(localStorage.getItem('FABRICRAFT_CARTLIST'));
    console.log("localCartlist count updated:", localCartlist);

    if(localCartlist && localCartlist.length > 0) {
      setCartItemCount(localCartlist.length);
    }
  }, []);

  const getWishlistItemCount = () => wishlistItemCount;
  const getCartItemCount = () => cartItemCount;

  const dataContextData = {
    isLoading, setIsLoading,
    getWishlistItemCount, setWishlistItemCount,
    getCartItemCount, setCartItemCount
  };

  const memoChildren = useMemo(() => children, [children]);

  console.log('DataProvider being loaded . .. . ');
  return (
    <DataContext.Provider value={{dataContextData}}>
      {memoChildren}
      {isLoading && (
        <div className="loading-popup-overlay">
          <div className="loading-popup">
            <svg className="pl" viewBox="0 0 200 200" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="pl-grad1" x1="1" y1="0.5" x2="0" y2="0.5">
                  <stop offset="0%" stopColor="hsl(359, 100%, 50%)" />
                  <stop offset="100%" stopColor="hsl(207, 100%, 50%)" />
                </linearGradient>
                <linearGradient id="pl-grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(359, 100%, 50%)" />
                  <stop offset="100%" stopColor="hsl(207, 100%, 50%)" />
                </linearGradient>
              </defs>
              <circle className="pl__ring" cx="100" cy="100" r="82" fill="none" stroke="url(#pl-grad1)" strokeWidth="36" strokeDasharray="0 257 1 257" strokeDashoffset="0.01" strokeLinecap="round" transform="rotate(-90,100,100)" />
              <line className="pl__ball" stroke="url(#pl-grad2)" x1="100" y1="18" x2="100.01" y2="182" strokeWidth="36" strokeDasharray="1 165" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      )}
    </DataContext.Provider>
  );
}

export default React.memo(DataProvider);
