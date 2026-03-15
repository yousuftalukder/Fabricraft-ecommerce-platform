import React, { createContext, useState, useMemo, useEffect, useCallback } from "react";
import Axios from 'axios';
import { Toast } from '../components/Toast';


export const AuthContext = createContext()

const axiosInstance = Axios.create({
  baseURL: `${process.env.REACT_APP_BACKEND_SERVER}/api/`,
});

function AuthProvider({children}) {
  console.log('AuthProvider being loaded . .. . ');

  const [toastMsg, setToastMsg] = useState('');
  const showToast = async (Msg) => {
    console.log("ShowToast: ", Msg);

    setToastMsg(Msg);
    setTimeout(() => {
        setToastMsg('');
    }, 3000);
  };

  const authData = {
    showToast
  };

  const memoChildren = useMemo(() => children, [children]);

  return (
      <AuthContext.Provider value={{authData}}>
        {toastMsg && <Toast message={toastMsg}/>}

        {memoChildren}
      </AuthContext.Provider>
  )
}

export default React.memo(AuthProvider);