import '../assets/styles/AdminDashboard.css';
import '../assets/styles/ProductManager.css';

import { AuthContext } from '../contexts/AuthContext';

import React, { useContext, useState, useEffect } from 'react';

import { DataContext } from '../contexts/DataContext';
import Axios from 'axios';

import { useQuery } from 'react-query'


const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});


const ProductTags = ({selectedProduct, adminPassword}) => {
  const { authData } = useContext(AuthContext);
  const { getAccessToken, showToast } = authData;

  const { dataContextData } = useContext(DataContext);
  const { setIsLoading } = dataContextData;

  const [updatingTag, setUpdatingTag] = useState("");

  const fetchTags = async () => {
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axiosInstance.get(`product/tag/product/${selectedProduct.product_id}/`, config);
    console.log('fetch tag response: ', response)
    return response.data;
  }

  const tagList = useQuery(`product-tags`, fetchTags);

  function isValidTag(tag) {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(tag);
  }

  const saveTag = async () => {
    if(!isValidTag(updatingTag)) return;

    const productTag = {
      'tag' : updatingTag,
      'product' : selectedProduct.product_id,
      'admin_password': adminPassword,
    };
 
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      },
    };
    try{
      console.log('calling saveTag');
      setIsLoading(true);

      const response = await axiosInstance.post("product/tag/", productTag, config);
      
      console.log('saveTag response: ', await response.data);
      setIsLoading(false);

      tagList.refetch();

      const toast_message = `Saved Successfully : Status - ${response.statusText}`;
      showToast(toast_message);

      setUpdatingTag("");
    }
    catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
  };

  const deleteTag = async (tag) => {
    const token = await getAccessToken();
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    };
    try{
      const data = {'admin_password': adminPassword, 'product' : selectedProduct.product_id, 'tag' : tag.name};
      console.log('data: ', data);
      setIsLoading(true);

      const response = await axiosInstance.post(
        'product/tag/delete/',
        data, 
        config
      );
      console.log('deleteTag response: ', await response.data);
      setIsLoading(false);

      tagList.refetch();

      const toast_message = `Deleted Successfully : Status - ${response.statusText}`;
      showToast(toast_message);
    }
    catch (e) {
      setIsLoading(false);
      console.error("Exception: ", e);
      const exception_message = `${e?.response?.data?.message} | ${e?.response.statusText}`;
      showToast(exception_message);
    }
  }


  console.log('Product Tag component is being loaded');

  if(!selectedProduct || !selectedProduct.product_id) return "";

  return (
    <div>
      <div className="product-category-form-row">
        <input
            type="text"
            placeholder="Tag"
            value={updatingTag}
            onChange={(e)=>{setUpdatingTag(e.target.value)}}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault(); 
                saveTag();
              }
            }}
            name="tag"
        />
      </div>
      
      <div className="product-tag-list-container">
        {!tagList.isLoading && tagList.data.map((tag, index) => (
          <div key={index} className="product-tag-item">
            <span className="product-tag-name"><span className='product-hash-tag'>#</span>{tag.tag.name}</span>
            <button className="product-tag-delete-button" onClick={() => deleteTag(tag.tag)}>
              &#10006;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(ProductTags);