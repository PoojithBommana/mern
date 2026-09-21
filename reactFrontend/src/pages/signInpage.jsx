import React from 'react'
import { RegisterUser } from '../apis/authApis'
import { useState } from 'react'


export const SignInpage = () => {

  const [userData, setUserData] = useState({
            username: '',
            email: '',
            password: '',
            businessName: '',
            businessDescription: '',
            brandTheme: '',
            brandAccent: '',
            timezone: '',
            emailOtp: '',
    });

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await RegisterUser(userData);
            console.log(response);
        } catch (error) {
            console.error('Registration error:', error);
        }
    }

  return (
    <div>
        <form onSubmit={handleSubmit}>
           <input type="text" placeholder='Username' value={userData.username} onChange={handleChange} />
           <input type="email" placeholder='Email' value={userData.email} onChange={handleChange} />
           <input type="password" placeholder='Password' value={userData.password} onChange={handleChange} />
           <input type="text" placeholder='Business Name' value={userData.businessName} onChange={handleChange} />
           <input type="text" placeholder='Business Description' value={userData.businessDescription} onChange={handleChange} />
           <input type="text" placeholder='Brand Theme' value={userData.brandTheme} onChange={handleChange} />
           <input type="text" placeholder='Brand Accent' value={userData.brandAccent} onChange={handleChange} />
           <input type="text" placeholder='Timezone' value={userData.timezone} onChange={handleChange} />
           <input type="text" placeholder='Email OTP' value={userData.emailOtp} onChange={handleChange} />
        </form>
        <button type='submit' onClick={handleSubmit}>Register</button>
    </div>
  )
}

export default SignInpage;
