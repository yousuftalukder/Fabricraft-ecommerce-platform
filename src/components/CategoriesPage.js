import React, { useState, useEffect } from "react";

import Axios from 'axios';
import { useQuery } from 'react-query';

import { useNavigate, useLocation, Link } from 'react-router-dom';

import { CustomImage } from "./CustomImage";

import * as metaPixelEvents from "../utils/MetaPixelEvent";


function CategoriesPage() {  
  const navigate = useNavigate();

  const [productCategories, setProductCategories] = useState([
    {
      "category": "sweatshirt",
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/category-card-premium-sweatshirt.png?alt=media&token=ac990c2c-8e81-43df-9e78-793152619eb6",
      "blurhash": "UUP%YE~V_201xaNGRj%2~VW?M|jE?GR-kCnN"
    },
    {
      "category": "hoodie",
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/category-card-hoodie.png?alt=media&token=e4121f93-7b47-4259-8f17-35b76bd137b6",
      "blurhash": "UwODk9~q%M9FRkj?t7WB-;R*WVRjt7ofj[Rk"
    },
    {
      "category": "casual-shirt",
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/category-card-casual-shirt.png?alt=media&token=28899a1b-35df-490a-a209-70a47720aac5",
      "blurhash": "UTQ,H]%g~q8_-;M_M|%M_3s;IUt7t8axt6WV"
    },
    {
      "category": "sweatshirt",
      "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/category-card-light-sweatshirt.png?alt=media&token=beb56959-822e-4d68-af4d-a2c2e038ef2e",
      "blurhash": "UVQvj;?w%h8^%MRjWBxu%Nxut6IUxuRjWUoL"
    },
  ]);
  
  useEffect(() => {
    metaPixelEvents.categoryPagePixelEvent();
  }, []);

  return (
    <div className="homepage-container">

      <Link to="/search" className="search-bar">
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </Link>

        <div className="search-product-card-container"> 
        {(productCategories && productCategories.length > 0) && 
            productCategories.map((category) => {
                return (
                    <div className="category-item-card" key={category.category}>
                        <div className="category-item-image" onClick={() => navigate(`/category/${category.category}`)}> 
                          <CustomImage 
                            imageUrl={category.url}
                            altText={""}
                            blurHash={category.blurhash}
                            width={"100%"}
                            height={"120px"}
                            blurHashWidth={"100%"}
                            blurHashHeight={"120px"}
                            borderRadius={"5px"}
                          />
                        </div>
                    </div>
                );
            })
        }
        </div>
        
        <br /><br /><br />
    </div>
  );
}

export default CategoriesPage;