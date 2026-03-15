import { useState, useRef, useEffect, useCallback } from "react";
import { CustomImage } from "./CustomImage";
import Axios from "axios";

import { useQuery } from 'react-query';

const axiosInstance = Axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});
  
const ImageSlider = ({productImages}) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const timerRef = useRef(null);

    const goToNextSlide = useCallback(() => {
        setCurrentIndex((prv) => {
            return ((prv + 1 >= (productImages ? productImages.length : 0)) ? 0 : prv + 1);
        });
    }, [setCurrentIndex, productImages]);

    const goToPreviousSlide = () => {
        setCurrentIndex((prv) => {
            return ((prv - 1 < 0) ? (productImages ? productImages.length : 1) - 1 : prv - 1);
        });
    }

    const [startingX, setStartingX] = useState(0);
    const [startingY, setStartingY] = useState(0);
    const [movingX, setMovingX] = useState(0);
    const [movingY, setMovingY] = useState(0);

    const touchStart = (e) => {
        setStartingX(e.touches[0].clientX);
        setStartingY(e.touches[0].clientY);
    }
    const touchMove = (e) => {
        setMovingX(e.touches[0].clientX);
        setMovingY(e.touches[0].clientY);
    }

    const touchEnd = () => {
        if(startingX+100 < movingX) {
            goToPreviousSlide();
        }
        else if(startingX-100 > movingX) {
            goToNextSlide();
        }
    }

    useEffect(() => {
        if(timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
            goToNextSlide();
        }, 3500);
        return () => clearTimeout(timerRef.current);
    }, [currentIndex, goToNextSlide]);

    return (
        <div>
            <div onTouchStart={touchStart}
                onTouchMove={touchMove}
                onTouchEnd={touchEnd}
                style={{height: '390px'}}>
                {
                    productImages && (currentIndex < productImages.length) &&
                    <CustomImage 
                        imageUrl={productImages[currentIndex].url}
                        altText={""}
                        blurHash={productImages[currentIndex].blurhash}
                        width={"100%"}
                        height={"390px"}
                        blurHashWidth={"400px"}
                        blurHashHeight={"390px"}
                        borderRadius={"0px"}/>
                }
            </div>

            <div className="ImageSliderDotContainer">
                {productImages && productImages.map((slide, slideIndex) => (
                    <div key={slideIndex} className={slideIndex === currentIndex ? "ImageSliderSelectedDot" : "ImageSliderDot"} onClick={() => {setCurrentIndex(slideIndex)}}>•</div>
                ))}
            </div>
        </div>
    );
}

export default ImageSlider;