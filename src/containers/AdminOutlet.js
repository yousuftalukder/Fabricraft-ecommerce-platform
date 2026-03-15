import { Navigate, Outlet } from "react-router-dom";
import SHA256 from "crypto-js/sha256";

export const AdminOutlet = () => {
  let adminSecretHash = localStorage.getItem('ONLY_REACT_ADMIN_SECRET');
  console.log(`adminSecretHash: ${adminSecretHash}`);

  if(!adminSecretHash){
    const adminSecret = prompt("Enter a admin secret:");
    const adminSecretHash = SHA256(adminSecret).toString();
    localStorage.setItem('ONLY_REACT_ADMIN_SECRET', adminSecretHash);
  }
  return adminSecretHash == process.env.REACT_APP_ADMIN_SECRET ? <Outlet/> : <Navigate to='/'/>;
}

