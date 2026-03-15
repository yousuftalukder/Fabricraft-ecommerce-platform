import React, {useState, useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import TopNavbar from './components/TopNavbar';
import BottomNavbar from './components/BottomNavbar';
import Home from './components/Home';
import SplashScreen from './components/SplashScreen';

import AuthProvider from './contexts/AuthContext';
import DataProvider from './contexts/DataContext';

import { PrivateOutlet } from './containers/PrivateOutlet';
import { AdminOutlet } from './containers/AdminOutlet';
import AdminDashboard from './components/AdminDashboard';
import UpdateProduct from './components/UpdateProduct.js';
import ProductDashboard from './components/ProductDashboard.js';
import SearchManager from './components/SearchManager';
import CategoryProducts from './components/CategoryProducts';
import CategoriesPage from './components/CategoriesPage';

import WishListPage from './components/WishListPage';
import CartPage from './components/CartPage';
import DeliveryDetails from './components/DeliveryDetails';
import CheckoutPage from './components/CheckoutPage';
import OrderSuccess from './components/OrderSuccess';
import OrderHistory from './components/OrderHistory';
import OrderDetails from './components/OrderDetails';
import OrderDashboard from './components/OrderDashboard';
import AdminOrderDetails from './components/AdminOrderDetails.js';

import ProductPage from './components/ProductPage';
import Offers from './components/Offers.js';

import ProfilePage from './components/ProfilePage';
import Login from './components/Login';
import { NotFound } from './components/NotFound';

import BrandLogo from './assets/images/fabricraft_dark_logo.png';

import { QueryClient, QueryClientProvider } from 'react-query'

import ShopProducts from './components/ShopProducts';

import ReviewManagement from './components/ReviewManagement';

const queryClient = new QueryClient()


function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(false);

  useEffect(() => {
    setIsSplashVisible(true);
    setTimeout(() => {
      setIsSplashVisible(false);
    }, 1500);
  }, []);

  if(isSplashVisible) {
    return <SplashScreen logo={BrandLogo}/>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <AuthProvider>
          <DataProvider>
            <Router>
              <TopNavbar/>

              <Routes>
                <Route path='/' element={<Home/>} exact/>
                <Route path='/search' element={<SearchManager/>} exact/>

                <Route path='/category' element={<CategoriesPage/>} exact/>
                <Route path='/category/:categorySlug' element={<CategoryProducts/>} exact/>
                
                <Route path="/shop/:query?" element={<ShopProducts/>} exact/>
                
                <Route path='/product/:productId' element={<ProductPage/>} exact/>

                <Route path='/offers' element={<Offers/>} exact/>

                <Route path='/wishlist' element={<WishListPage/>} exact/>
                <Route path='/cart' element={<CartPage/>} exact/>
                
                <Route path='/delivery-details' element={<DeliveryDetails/>} exact/>
                <Route path='/checkout' element={<CheckoutPage/>} exact/>
                <Route path='/order-success' element={<OrderSuccess/>} exact/>

                <Route path='profile' element={<ProfilePage/>} exact/>
                <Route path='order-history' element={<OrderHistory/>} exact/>
                <Route path='order-history/:orderId' element={<OrderDetails/>} exact/>

                <Route path='/fabricraft-super-admin-panel/' element={<AdminOutlet/>}>
                  <Route path='' element={<AdminDashboard/>}/>
                  <Route path='product-management' element={<ProductDashboard/>}/>
                  <Route path='product-management/edit' element={<UpdateProduct/>}/>
                  <Route path='order-management' element={<OrderDashboard/>}/>
                  <Route path='order-management/:orderId' element={<AdminOrderDetails/>} exact/>
                </Route>

                <Route path='*' element={<NotFound/>}/>
              </Routes>

              <BottomNavbar/>
            </Router>
          </DataProvider>
        </AuthProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
 
