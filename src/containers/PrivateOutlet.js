import { Navigate, Outlet } from "react-router-dom";

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const PrivateOutlet = () => {
  const { authData } = useContext(AuthContext);
  const {userProfile} = authData;
  
  return userProfile != null ? <Outlet/> : <Navigate to=''/>;
}

