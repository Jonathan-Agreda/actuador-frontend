// src/lib/axios.ts
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_WS_URL + "/api",
});

export default instance;
