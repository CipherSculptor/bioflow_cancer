# Machine Learning Model Update for CBC Prediction

## Overview of Changes
This update modifies the CBC prediction model to use Age, Gender, and Permittivity as features instead of Blood Group and Permittivity. The machine learning model has been updated from RandomForest to MLPRegressor (neural network) for improved prediction accuracy.

## Key Changes

### 1. Machine Learning Model
- Replaced `RandomForestRegressor` with `MLPRegressor` (neural network)
- Updated model parameters to use hidden layers of size (100, 50) with max_iter=1000
- Improved model training with better feature handling

### 2. Feature Engineering
- Removed Blood Group as a feature
- Added Age and Gender (Sex) as new features
- Maintained Permittivity as a key feature
- Updated preprocessing to handle the new feature set

### 3. API Changes
- Updated API endpoints to accept Age and Gender instead of Blood Group
- Modified response format to include Age and Gender in results
- Updated validation logic for the new features
- Improved error handling for invalid inputs

### 4. Frontend Updates
- Removed Blood Group field from the form
- Updated form validation for Age and Gender
- Modified results display to show Age and Gender instead of Blood Group
- Updated PDF report generation to include the new features

### 5. Configuration Updates
- Updated version number to 2.0
- Improved error handling in model loading
- Updated API documentation to reflect the new feature set

## Files Modified
- `render-package/api.py` and `render-deploy/api.py`: Updated ML model and feature handling
- `dashboard.html`: Removed Blood Group field
- `dashboard.js`: Updated form submission logic
- `results.js` and `results.html`: Updated results display
- `build/dashboard.js`, `netlify-deploy/dashboard.js`, `netlify-clean/dashboard.js`: Updated to match the new feature set
- `render-package/wsgi.py` and `render-deploy/wsgi.py`: Improved error handling

## Technical Details
The neural network model (MLPRegressor) was chosen for its ability to capture complex non-linear relationships between the input features (Age, Gender, Permittivity) and the CBC parameters (RBC, WBC, Platelets, Hemoglobin). The model architecture uses two hidden layers (100, 50) with ReLU activation and Adam optimizer.

## Testing
The application has been tested locally and all features are working as expected. The prediction accuracy has been maintained while simplifying the input requirements.
