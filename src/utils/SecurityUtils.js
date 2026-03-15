export const IsCorrectPhoneNumber = (phoneNo) => {
    if (phoneNo.length < 11 || phoneNo.length === 12 || phoneNo.length > 14) {
        return false;
    }
    if (phoneNo.length === 13 && !phoneNo.startsWith("88")) {
        return false;
    }
    if (phoneNo.length === 14 && !phoneNo.startsWith("+88"))  {
        return false;
    }

    if (phoneNo.length > 11) {
      phoneNo = phoneNo.slice(-11);
    }

    const validPrefixes = ["013", "014", "015", "016", "017", "018", "019"];
    if (!validPrefixes.includes(phoneNo.substring(0, 3)))  {
        return false;
    }

    if (!phoneNo.substring(3).split("").every((char) => !isNaN(char)))  {
        return false;
    }
    return true;
}

export const IsValidPassword = (newPassword, confirmNewPassword) => {
    if (newPassword !== confirmNewPassword) {
        return false;
    }
    if (
        newPassword.length < 8 ||
        !/[a-z]/.test(newPassword) ||
        !/[A-Z]/.test(newPassword) ||
        !/\d/.test(newPassword) ||
        !/[~!@#$%^&*-_+=|?]/.test(newPassword)
    ){
        return false;
    }

    return true;
}

export function IsValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }