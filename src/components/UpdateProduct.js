import "../assets/styles/AdminDashboard.css";
import "../assets/styles/ProductManager.css";

import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

import React, { useContext, useState, useEffect } from "react";

import Axios from "axios";
import { CustomImage } from "./CustomImage";

import { db, storage } from '../firebaseConfig'; 
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc, query, where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { encode } from "blurhash";
import SHA256 from "crypto-js/sha256";


const generateProductId = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const randomFourDigitNumber = String(Math.floor(1000 + Math.random() * 9000));
  const randomBlockLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  
  return `F${currentYear}${currentMonth}${randomFourDigitNumber}${randomBlockLetter}`;
}

function UpdateProduct() {
  const navigate = useNavigate();
  
  const { authData } = useContext(AuthContext);
  const { showToast } = authData;

  const { state } = useLocation();

  const [updatingProduct, setUpdatingProduct] = useState({
    "product_id": "",
    "product_name": "",
    "product_price": "",
    "product_discount_price": "",
    "product_category": "",
    "product_description": "",
    "product_specification": "",
    "product_video_url": "",
    "product_size_chart": "",
    "product_stock": "",
    "product_blurhash": ""
});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatingProduct((prv) => ({ ...prv, [name]: value}));
  };

  const updateProduct = async () => {
    try {
      const productRef = collection(db, "products");
  
      const q = query(productRef, where("product_id", "==", updatingProduct.product_id));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        alert(`No product found with product_id: ${updatingProduct.product_id}`);
        return;
      }

      querySnapshot.forEach(async (doc) => {
        const productDoc = doc.ref;
        await updateDoc(productDoc, updatingProduct);
        alert(`Product updated with product_id: ${updatingProduct.product_id}`);
      });
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product. Check console for details.");
    }
  };

  const addProduct = async () => {
    try {
      const productRef = collection(db, "products");
      const newProduct = {
        ...updatingProduct,
        product_id: generateProductId(),
      };
      const addedDoc = await addDoc(productRef, newProduct);
      alert(`Product added successfully with ID: ${addedDoc.id}`);
    } 
    catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product. Check console for details.");
    }
  };

  const saveProduct = async () => {
    console.log("Saving Products:", updatingProduct);
    
    const adminSecret = prompt("Enter a admin secret:");
    const adminSecretHash = SHA256(adminSecret).toString();
    if(adminSecretHash != process.env.REACT_APP_ADMIN_SUPER_SECRET) {
      showToast("Admin secret is not valid");
      return;
    }
    
    if(!updatingProduct.product_id) {
      await addProduct();
    }
    else {
      await updateProduct();
    }
    navigate(-1);
  }

  const deleteProduct = async () => {
    const adminSecret = prompt("Enter a admin secret:");
    const adminSecretHash = SHA256(adminSecret).toString();
    if(adminSecretHash != process.env.REACT_APP_ADMIN_SUPER_SECRET) {
      showToast("Admin secret is not valid");
      return;
    }

    try {
      const productRef = collection(db, "products");
  
      const q = query(productRef, where("product_id", "==", updatingProduct.product_id));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        alert(`No product found with product_id: ${updatingProduct.product_id}`);
        return;
      }
  
      querySnapshot.forEach(async (doc) => {
        const productDoc = doc.ref;
        await deleteDoc(productDoc);
        alert(`Product deleted with product_id: ${updatingProduct.product_id}`);
      });
    } 
    catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Check console for details.");
    }
    finally {
      navigate(-1);
    }
  };

  const generateBlurHash = (file) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onloadend = () => {
      image.src = reader.result;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const blurHashString = encode(
          imageData.data,
          image.width,
          image.height,
          4,
          4 
        );
        setUpdatingProduct((prv) => ({
          ...prv,
          product_blurhash: blurHashString,
        }));
      };
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      generateBlurHash(file);
    }
  };

  const [productPhotoURL, setProductPhotoURL] = useState("");
  const [productPhotoBlurHash, setProductPhotoBlurHash] = useState("");
  
  const generateBlurHashForProductPhoto = (file) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onloadend = () => {
      image.src = reader.result;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        const blurHashString = encode(
          imageData.data,
          image.width,
          image.height,
          4,
          4 
        );
        setProductPhotoBlurHash(blurHashString);
      };
    };

    reader.readAsDataURL(file);
  };

  const addProductPhoto = () => {
    console.log("addProductPhoto");
    if(!productPhotoURL || !productPhotoBlurHash) return;
    setUpdatingProduct((prv) => (
      {
        ...prv,
        product_photos: [
          ...(prv.product_photos || []),
          {
            url: productPhotoURL,
            blurHash: productPhotoBlurHash,
          },
        ],
      }
    ));
    setProductPhotoBlurHash("");
    setProductPhotoURL("");
  }

  const deleteProductPhoto = (photoToDelete) => {
    setUpdatingProduct((prv) => ({
      ...prv,
      product_photos: prv.product_photos.filter(
        (photo) => photo.url !== photoToDelete.url
      ),
    }));
  };

  useEffect(() => {
    if(state) {
      setUpdatingProduct({...state});
    }
  }, [])

  useEffect(() => {
    console.log("updating prodcut: ", updatingProduct);
  }, [updatingProduct]);

  return (
    <div className="admin-panel-container">
      {state && <h1 className="page-title">#{state.product_id}</h1>}
      <h1 className="page-title">
        {state ? `Update : ${state.product_name}` : "Create New Product"}
      </h1>

      <div className="card-container">
        <div
          className="product-category-edit-container"
          style={{ maxWidth: "600px", marginTop: "0px" }}
        >
          <div className="product-category-form-row">
            <input
              type="text"
              placeholder="Product Name"
              value={updatingProduct.product_name}
              onChange={handleInputChange}
              name="product_name"
            />
          </div>

          <div className="product-category-form-row">
            <input
              type="number"
              placeholder="Price"
              value={updatingProduct.product_price}
              onChange={handleInputChange}
              name="product_price"
            />
          </div>
          
          <div className="product-category-form-row">
            <input
              type="number"
              placeholder="Discount Price"
              value={updatingProduct.product_discount_price}
              onChange={handleInputChange}
              name="product_discount_price"
            />
          </div>
          
          <div className="product-category-form-row">
            <input
              type="text"
              placeholder="Category"
              value={updatingProduct.product_category}
              onChange={handleInputChange}
              name="product_category"
            />
          </div>
          
          <div className="product-category-form-row">
            <textarea
              type="text"
              placeholder="Description"
              value={updatingProduct.product_description}
              onChange={handleInputChange}
              name="product_description"
            />
          </div>
          
          <div className="product-category-form-row">
            <textarea
              type="text"
              placeholder="Specification"
              value={updatingProduct.product_specification}
              onChange={handleInputChange}
              name="product_specification"
            />
          </div>
          
          <div className="product-category-form-row">
            <input
              type="text"
              placeholder="Video URL"
              value={updatingProduct.product_video_url}
              onChange={handleInputChange}
              name="product_video_url"
            />
          </div>

          <div className="product-category-form-row">
            <input
              type="text"
              placeholder="{'XL':{'Chest (round)':'43', 'Length':'29', 'Sleeve':'25'}, 'XXL':{'Chest (round)':'45.5', 'Length':'30', 'Sleeve':'25.5'}}"
              value={updatingProduct.product_size_chart}
              onChange={handleInputChange}
              name="product_size_chart"
            />
          </div>
          
          <div className="product-category-form-row">
            <input
              type="text"
              placeholder="{'M':10, 'L':20, 'XL':20, 'XXL':10}"
              value={updatingProduct.product_stock}
              onChange={handleInputChange}
              name="product_stock"
            />
          </div>

          <div className="product-category-form-row">
            <input
              type="number"
              placeholder="Discount %"
              value={updatingProduct.product_discount_percentage || ""}
              onChange={handleInputChange}
              name="product_discount_percentage"
            />
          </div>
          
          <div className="product-category-form-row">
            <div>
              {updatingProduct.product_blurhash && (
                <div>BlurHash: <span style={{color: "blue"}}>{updatingProduct.product_blurhash}</span> </div>
              )} <br /> <br />
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>

          {state &&       
            <div className="product-description-container">
              <div>
                <h4>
                  Product Photos
                </h4>
                <hr className="product-description-hzline" />
              
                {updatingProduct.product_photos && 
                <div>
                  <h4>Uploaded Photos:</h4>
                  {updatingProduct.product_photos.map((photo, index) => (
                    <>
                      <CustomImage 
                      imageUrl={photo.url}
                      altText={index}
                      blurHash={photo.blurHash}
                      width={"190px"}
                      height={"190px"}
                      blurHashWidth={"190px"}
                      blurHashHeight={"190px"}
                      borderRadius={"10px"}/>
                      <div onClick={() => deleteProductPhoto(photo)} style={{color: "red", padding: "5px"}}>Delete</div>
                    </>
                  ))}
                </div>}

                <div>
                  <span style={{color: "blue"}}>blurHash: {productPhotoBlurHash}</span> <br />
                  <input type="file" accept="image/*" onChange={(e) => generateBlurHashForProductPhoto(e.target.files[0])} />
                  <input
                    type="text"
                    placeholder="Product Photo URL"
                    value={productPhotoURL}
                    onChange={(e) => setProductPhotoURL(e.target.value)}
                  />
                  <div onClick={addProductPhoto} style={{background: "lightcoral", padding: "5px"}}>Add</div>
                </div>
              </div>
            </div>
          }
          
          <div className="product-category-buttons">
            <button
              onClick={saveProduct}
              style={{ padding: "20px", width: "100%", fontSize: "medium" }}
            >
              {state ? "Update" : "Save"}
            </button>
            {state && (
              <button
                onClick={deleteProduct}
                style={{ padding: "20px", width: "100%", fontSize: "medium" }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
        <br />
        <br />
        <br />
      </div>
    </div>
  );
}

export default React.memo(UpdateProduct);
