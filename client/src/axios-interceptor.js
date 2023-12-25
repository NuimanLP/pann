import axios from "axios";

const axiosConfig = {}

axios.interceptors.request.use((request) => {
    if(axiosConfig.jwt){
        request.headers.set('Authorization', `Bearer ${axiosConfig.jwt}`);
    }
  
    return request;
  }
);

export default axiosConfig;