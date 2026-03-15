import '../assets/styles/AdminDashboard.css';

import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import React, { useContext, useState, useEffect } from 'react';

import Axios from 'axios';
import { useQuery } from 'react-query';

import { CustomImage } from './CustomImage';

const axiosInstance = Axios.create({
    baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

const getInitials = (name) => {
    const initials = name.split(' ').map((word) => word[0]).join('');
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    return { initials, randomColor };
};


function ReviewManagement() {
  const navigate = useNavigate();

  const { authData } = useContext(AuthContext);
  const { getAccessToken, showToast } = authData;

  const SubmittedProductReviews = useQuery(`submitted-product-review`, async () => {
        try{
            const token = await getAccessToken();
            const config = {
                headers: {
                Authorization: `Bearer ${token}`,
                },
            }
            return axiosInstance.get(`order/ordered-product/admin-review/`, config);
            }
        catch(e) {
            return {'data':[]};
        }
    }, { 
        staleTime: (10) * (60 * 1000),
        cacheTime: (6 * 60) * (60 * 1000),
    });

    console.log('Order manager is being loaded');

    const ReviewCard = ({ review, query }) => {
        const { initials, randomColor } = getInitials(review.reviewer_name);
        
        const reviewApproveButtonClicked = async (isApproved) => {
            try{
                const token = await getAccessToken();
                const config = {
                    headers: {
                    Authorization: `Bearer ${token}`,
                    },
                }
                console.log('=>> review:', review);
                const res = await axiosInstance.post(`order/ordered-product/admin-review-approval/`, {'review':review, 'is_approved':isApproved}, config);
                console.log('=>> review update response: ', res);
                
                SubmittedProductReviews.refetch();
            }
            catch(e) {
                showToast(`exception occoured: ${e}`)
            }
        }

        return (
            <div className="review-management-card">
                <div className="review-management-header">
                <div className="review-management-profile-pic" style={{ backgroundColor: randomColor }}>
                    {initials}
                </div>
                <div className="review-management-reviewer-info">
                    <span className="review-management-reviewer-name">{review.reviewer_name}</span>
                    <div className="review-management-review-body">
                    <div className="review-management-review-rating">
                        {'★'.repeat(Math.round(review.rating))}{''}
                        {Array(5 - Math.round(review.rating)).fill('☆').join('')}
                    </div>
                    <span className="review-management-review-date">{review.review_date}</span>
                    </div>
                </div>
                </div>
                <p className="review-management-review-text">{review.review}</p>
                <div className="review-management-review-body">
                    <div 
                        onClick={() => reviewApproveButtonClicked(true)}
                        style={{
                            backgroundColor: 'rgb(223, 1, 112)',
                            padding: '5px',
                            borderRadius: '5px',
                            color: 'white',
                            fontWeight: '600',
                            width: '150px',
                            cursor: 'pointer'
                        }}>
                        Approve
                    </div>
                    <div 
                        onClick={() => reviewApproveButtonClicked(false)}
                        style={{
                            backgroundColor: 'rgb(223, 1, 112)',
                            padding: '5px',
                            borderRadius: '5px',
                            color: 'white',
                            fontWeight: '600',
                            width: '150px',
                            cursor: 'pointer'
                        }}>
                        Reject
                    </div>
                </div>
                
            </div>
        );
    };

  return (
    <div className="admin-panel-container" style={{marginBottom: '200px'}}>
        <h1 className="page-title">Review Management</h1>
      
        {!SubmittedProductReviews.isLoading && SubmittedProductReviews.data && SubmittedProductReviews.data.data && SubmittedProductReviews.data.data.length > 0 && 
            SubmittedProductReviews.data.data.map((review) => (
                <ReviewCard key={review.id} review={review} query={SubmittedProductReviews} />
            )
        )}
        {!SubmittedProductReviews.isLoading && SubmittedProductReviews.data && SubmittedProductReviews.data.data && 
            SubmittedProductReviews.data.data.length === 0 && <span style={{opacity: '0.4', marginTop: '100px', fontWeight: '600', fontSize: '17px'}}>No Review Found</span>}
    </div>
  );
}

export default React.memo(ReviewManagement);