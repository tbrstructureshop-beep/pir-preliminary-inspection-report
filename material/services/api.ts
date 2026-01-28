
import { DashboardData } from '../types';

const API_URL = "https://script.google.com/macros/s/AKfycbyQG9-FrBkQidkbUzWgVUUHxK7mFVYyru5RO7EKyfOzomliEn8KBCF_bkagjNw_CK8r/exec";

export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as DashboardData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
