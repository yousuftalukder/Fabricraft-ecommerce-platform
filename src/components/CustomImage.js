import { Blurhash } from "react-blurhash";
import React, { useEffect, useState } from 'react';

export const CustomImage = ({imageUrl, altText, blurHash, cssClass, height, width, blurHashHeight, blurHashWidth, borderRadius}) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div>
            {blurHash &&
            <div style={{
                display: !imageLoaded ? "inline" : "none",
            }}>
                <Blurhash hash={blurHash}
                    width={blurHashWidth}
                    height={blurHashHeight}
                    resolutionX={32}
                    resolutionY={32}
                    punch={1}/>
            </div>}
            {imageLoaded ? 
                <img style={{
                        width: width,
                        height: height,
                        borderRadius: borderRadius,
                    }} 
                    src={imageUrl} 
                    alt={altText} 
                    className={cssClass} 
                    onLoad={() => {
                        console.log('image loaded');
                        setImageLoaded(true);
                    }} 
                    loading="lazy"/> :
                <img style={{
                        width: width,
                        height: 1
                    }} 
                    src={imageUrl} 
                    alt={altText} 
                    className={cssClass} 
                    onLoad={() => {
                        console.log('image loaded');
                        setImageLoaded(true);
                    }} 
                    loading="lazy"/>
            }
        </div>
    );
}