import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import '../assets/styles/BottomNavbar.css';
import HomeIcon from '../assets/images/home-icon.png';
import CategoriesIcon from '../assets/images/category-icon.png';
import WishlistIconPink from '../assets/images/wishlist-icon.png';
import CartIcon from '../assets/images/cart-icon.png';

import { DataContext } from '../contexts/DataContext';

function BottomNavbar() {
  const {dataContextData}  = useContext(DataContext);
  const { getWishlistItemCount, getCartItemCount } = dataContextData;

  console.log('bottom navbar loaded.');
  return (
    <div>
      <div className="bottom-navbar">
        <Link to="/" className="bottom-navbar-button-nobadge bottom-navbar-button">
          <img src={HomeIcon} alt="Home" className="bottom-navbar-icon"/>
          <span className='bottom-navbar-text'>Home</span>
        </Link>
        <Link to="/category" className="bottom-navbar-button-nobadge bottom-navbar-button">
          <img src={CategoriesIcon} alt="Categories" className="bottom-navbar-icon"/>
          <span className='bottom-navbar-text'>Categories</span>
        </Link>
        <Link to="/wishlist" className="bottom-navbar-button">
          <img src={WishlistIconPink} alt="Wishlist" className="bottom-navbar-icon"/>
          <span className='bottom-navbar-text'>Wishlist</span>
          <div className="bottom-navbar-wishlist-badge bottom-navbar-badge">{getWishlistItemCount()}</div>
        </Link>
        <Link to="/cart" className="bottom-navbar-button">
          <img src={CartIcon} alt="Cart" className="bottom-navbar-icon"/>
          <span className='bottom-navbar-text'>Cart</span>
          <div className="bottom-navbar-cart-badge bottom-navbar-badge">{getCartItemCount()}</div>
        </Link>
      </div>
    </div>
  );
}

export default React.memo(BottomNavbar);
