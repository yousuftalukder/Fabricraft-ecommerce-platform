import '../assets/styles/AdminDashboard.css';


import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';

import Axios from 'axios';
import { useQuery } from 'react-query';

import { CustomImage } from './CustomImage';

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
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const axiosInstance = Axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

function ProductDashboard() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  const [visibleProductList, setVisibleProductList] = useState([]);

  const fetchProducts = async () => {
    const productCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productCollection);
    const productList = productSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setVisibleProductList(productList);
  };

  const fetchProductById = async (product_id) => {
    try {
      const productRef = collection(db, "products");
      const q = query(productRef, where("product_id", "==", product_id));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        alert(`No product found with product_id: ${product_id}`);
        return;
      }
      querySnapshot.forEach((doc) => {
        const productData = doc.data();
        console.log("Product retrieved:", productData);
      });
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  const fetchProductsByCategory = async (category) => {
    const productCollection = collection(db, 'products');
    const productSnapshot = await getDocs(productCollection);
    const filteredProducts = productSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((product) => product.product_category === category);
  };

  useEffect(() => {
    fetchProducts();
  }, [])

  return (
    <div className="admin-panel-container">
      <h1 className="page-title">Product Dashboard</h1>
      
      <div className="card-container">

        <div className="product-dashboard-card" onClick={() => navigate('edit')} style={{cursor: 'pointer'}}>
          <i className="fa fa-shopping-bag" aria-hidden="true"></i>
          <p>Add Product</p>
        </div>


        <div className="product-dashboard-container">
            <table className="product-dashboard-product-table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                </tr>
                </thead>
                <tbody>
                {visibleProductList && visibleProductList.map((product, idx) => (
                    <tr key={product.product_id} style={{cursor: 'pointer'}}>
                        <td onClick={() => {navigate('edit', {'state':product})}}>{idx+1}.</td>
                        <td onClick={() => {navigate('edit', {'state':product})}}>{product.product_id}</td>
                        <td onClick={() => {navigate('edit', {'state':product})}}>
                            <CustomImage 
                                imageUrl={
                                    product.product_photos && product.product_photos[0].url
                                }
                                blurHash={product && product.product_blurhash}
                                width={50}
                                height={50}
                                blurHashWidth={50}
                                blurHashHeight={50}
                                borderRadius={10}
                            />
                        </td>
                        <td onClick={() => {navigate('edit', {'state':product})}}>
                            {product.product_name} <br/>
                            <span style={{color: 'grey'}}>({product.product_category})</span>
                        </td>
                        <td onClick={() => {navigate('edit', {'state':product})}}>
                            <span style={{color: 'red', }}>৳{product.product_price}</span><br />
                            <span style={{ color: 'green' }}>৳{product.product_discount_price} </span><br />
                            <span style={{ color: 'green' }}>{product.product_discount_percentage}%</span><br />
                        </td>
                        <td onClick={() => {navigate('edit', {'state':product})}}>
                            <p>
                            {product.product_stock && Object.entries(JSON.parse(product.product_stock)).map(([key, value]) => (
                                <span key={key} style={{ fontWeight: 200 }}>{key}: {value} <br /></span>
                            ))}
                            </p>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProductDashboard);