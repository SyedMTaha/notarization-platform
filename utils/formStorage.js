// Utility functions to handle form data in localStorage

const FORM_DATA_KEY = 'form2_data';

export const saveFormData = (step, data) => {
  try {
    // Get existing data
    const existingData = getFormData();
    
    // Update data for current step
    const updatedData = {
      ...existingData,
      [`step${step}`]: data
    };
    
    // Save to localStorage
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error saving form data:', error);
    return false;
  }
};

export const getFormData = () => {
  try {
    const data = localStorage.getItem(FORM_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting form data:', error);
    return {};
  }
};

export const clearFormData = () => {
  try {
    localStorage.removeItem(FORM_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing form data:', error);
    return false;
  }
};

// Save document-specific form data
export const saveDocumentFormData = (documentType, data) => {
  try {
    const existingData = getFormData();
    const updatedData = {
      ...existingData,
      documentForms: {
        ...existingData.documentForms,
        [documentType]: data
      }
    };
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(updatedData));
    return true;
  } catch (error) {
    console.error('Error saving document form data:', error);
    return false;
  }
};

// Get document-specific form data
export const getDocumentFormData = (documentType) => {
  try {
    const data = getFormData();
    return data.documentForms?.[documentType] || {};
  } catch (error) {
    console.error('Error getting document form data:', error);
    return {};
  }
};

// Utility function to upload file to Cloudinary
export const uploadToCloudinary = async (file, folder = '') => {
  if (!file) return null;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'WiScribbles');
    formData.append('cloud_name', 'dvhrg7bkp');

    if (folder) {
      formData.append('folder', folder);
    }

    // Cloudinary Key
    const response = await fetch(
      'https://api.cloudinary.com/v1_1/dvhrg7bkp/image/upload',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
