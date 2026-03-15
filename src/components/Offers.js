import React, { useState, useEffect } from "react";

import Axios from 'axios';
import { useQuery } from 'react-query';

import { CustomImage } from "./CustomImage";

import { useNavigate, Link, useParams } from 'react-router-dom';

import * as metaPixelEvents from "../utils/MetaPixelEvent";


function Offers() {  
  
    const [offers, setOffers] = useState([
        {
            "name": "eid-sale",
            "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/eid%20sale.png?alt=media&token=1fcf6dcf-38c2-4e38-ae38-233211daabbd",
            "blurhash": "LOQ[I7uXV#wO%Xt8nSTE%pwJDn%F"
        },
        {
            "name": "purchase-discount",
            "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/offer-discount.png?alt=media&token=b4efa4b6-35ac-4ce5-a4c2-54a6694015dd",
            "blurhash": "UBIgmF{+U^3F02_}GI%N0$CQ%3MKyqTyNFZ$"
        },
        {
            "name": "free-delivery",
            "url": "https://firebasestorage.googleapis.com/v0/b/onlyreactecom.firebasestorage.app/o/offer-free-delivery.png?alt=media&token=98789aa0-ea35-4f65-b60f-1ae3fc49d8c1",
            "blurhash": "U9ReKf*K4T;f02}m4;#Sh$}s01X4IC+bIVVZ"
        },
    ])

    useEffect(() => {
      metaPixelEvents.OfferPagePixelEvent();
    }, []);

  return (
    <div className="homepage-container">

      <Link to="/search" className="search-bar">
        <button className="search-button">
          <i className="fa fa-search" aria-hidden="true"></i>
          Search For Products
        </button>
      </Link>

      <h2 className="category-title">Offers</h2>

      {
        offers.map((offer, idx) => {
            return (
            <div className="offer-row" style={{marginBottom: "10px"}} key={idx}>
                <CustomImage 
                    imageUrl={offer.url} 
                    altText={""}
                    blurHash={offer.blurhash}
                    width={"100%"}
                    height={"130px"}
                    blurHashWidth={"400px"}
                    blurHashHeight={"130px"}
                    borderRadius={"10px"}/>
            </div>)
        })
      }
        
        <br /><br /><br />
    </div>
  );
}

export default React.memo(Offers);