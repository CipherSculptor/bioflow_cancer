import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os

app = Flask(__name__)
# Configure CORS to allow requests from any origin with any headers
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*", "allow_headers": "*", "expose_headers": "*"}})

# Global variables to store our trained models and preprocessing objects
encoder = None
scaler = None
model_rbc = None
model_wbc = None
model_platelets = None
model_hemoglobin = None
valid_blood_groups = ['A+', 'B+', 'O+']

def load_or_train_models():
    global encoder, scaler, model_rbc, model_wbc, model_platelets, model_hemoglobin
    
    try:
        # Check if models are already saved
        if os.path.exists('models/model_rbc.joblib'):
            # Load pre-trained models
            encoder = joblib.load('models/encoder.joblib')
            scaler = joblib.load('models/scaler.joblib')
            model_rbc = joblib.load('models/model_rbc.joblib')
            model_wbc = joblib.load('models/model_wbc.joblib')
            model_platelets = joblib.load('models/model_platelets.joblib')
            model_hemoglobin = joblib.load('models/model_hemoglobin.joblib')
            print("Loaded pre-trained models from disk")
            return True
        else:
            # Generate and train with sample data
            print("Models not found. Using sample data to train new models.")
            # Sample data since file not found (for deployment purposes)
            data = pd.DataFrame({
                'Blood Group': ['A+', 'B+', 'O+'] * 10,
                'Permittivity': np.random.normal(25.81, 0.01, 30),
                'RBC Count': np.random.normal(4.5, 0.5, 30),
                'WBC Count': np.random.normal(8000, 1000, 30),
                'Platelets': np.random.normal(250000, 50000, 30),
                'Hemoglobin': np.random.normal(14, 1.5, 30)
            })
            
            # Train models with the sample data
            # Preprocess data
            encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
            blood_group_encoded = encoder.fit_transform(data[['Blood Group']])
            
            scaler = StandardScaler()
            numerical_features = scaler.fit_transform(data[['Permittivity']])
            
            X = np.hstack((numerical_features, blood_group_encoded))
            y_rbc = data['RBC Count']
            y_wbc = data['WBC Count']
            y_platelets = data['Platelets']
            y_hemoglobin = data['Hemoglobin']
            
            # Train models directly without splitting (since this is sample data)
            model_rbc = RandomForestRegressor(n_estimators=50, random_state=42)
            model_wbc = RandomForestRegressor(n_estimators=50, random_state=42)
            model_platelets = RandomForestRegressor(n_estimators=50, random_state=42)
            model_hemoglobin = RandomForestRegressor(n_estimators=50, random_state=42)
            
            model_rbc.fit(X, y_rbc)
            model_wbc.fit(X, y_wbc)
            model_platelets.fit(X, y_platelets)
            model_hemoglobin.fit(X, y_hemoglobin)
            
            # Try to save models if directory exists or can be created
            try:
                os.makedirs('models', exist_ok=True)
                joblib.dump(encoder, 'models/encoder.joblib')
                joblib.dump(scaler, 'models/scaler.joblib')
                joblib.dump(model_rbc, 'models/model_rbc.joblib')
                joblib.dump(model_wbc, 'models/model_wbc.joblib')
                joblib.dump(model_platelets, 'models/model_platelets.joblib')
                joblib.dump(model_hemoglobin, 'models/model_hemoglobin.joblib')
                print("Sample models trained and saved successfully")
            except Exception as e:
                print(f"Warning: Could not save models: {e}")
                
            return True
    except Exception as e:
        print(f"Error in load_or_train_models: {e}")
        return False

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("Received data:", data)  # Debug logging
        
        # Extract data from request
        try:
            permittivity = float(data['permittivity'])
        except (ValueError, TypeError):
            return jsonify({
                'error': 'Permittivity must be a valid number'
            }), 400
            
        blood_group = data['bloodGroup']
        name = data['name']
        
        print(f"Extracted - Name: {name}, Blood Group: {blood_group}, Permittivity: {permittivity}")  # Debug logging
        
        # Validate blood group
        if blood_group not in valid_blood_groups:
            print(f"Invalid blood group: '{blood_group}', Valid groups are: {valid_blood_groups}")  # Debug logging
            return jsonify({
                'error': f'Invalid blood group. Accepted values are {", ".join(valid_blood_groups)}'
            }), 400
        
        # Validate permittivity range (based on CSV data)
        if permittivity < 25.80 or permittivity > 25.83:
            print(f"Warning: Permittivity value {permittivity} is out of expected range (25.80-25.83)")
            return jsonify({
                'error': f'Permittivity value {permittivity} is out of expected range (25.80-25.83)'
            }), 400
        
        # Preprocess input
        new_data_point_scaled = scaler.transform([[permittivity]])
        new_data_point_encoded = encoder.transform([[blood_group]])
        new_data = np.hstack((new_data_point_scaled, new_data_point_encoded))
        
        # Make predictions
        predicted_rbc = model_rbc.predict(new_data)[0]
        predicted_wbc = model_wbc.predict(new_data)[0]
        predicted_platelets = model_platelets.predict(new_data)[0]
        predicted_hemoglobin = model_hemoglobin.predict(new_data)[0]
        
        # Reference ranges for context
        reference_ranges = {
            'rbc': {
                'low': 4.2,
                'high': 5.4,
                'unit': 'millions/cumm'
            },
            'wbc': {
                'low': 4000,
                'high': 11000,
                'unit': '/microliter'
            },
            'platelets': {
                'low': 150000,
                'high': 450000,
                'unit': '/microliter'
            },
            'hemoglobin': {
                'low': 12.0,
                'high': 16.0,
                'unit': 'g/dL'
            }
        }
        
        # Add status indications (low, normal, high)
        rbc_status = 'low' if predicted_rbc < reference_ranges['rbc']['low'] else ('high' if predicted_rbc > reference_ranges['rbc']['high'] else 'normal')
        wbc_status = 'low' if predicted_wbc < reference_ranges['wbc']['low'] else ('high' if predicted_wbc > reference_ranges['wbc']['high'] else 'normal')
        platelets_status = 'low' if predicted_platelets < reference_ranges['platelets']['low'] else ('high' if predicted_platelets > reference_ranges['platelets']['high'] else 'normal')
        hemoglobin_status = 'low' if predicted_hemoglobin < reference_ranges['hemoglobin']['low'] else ('high' if predicted_hemoglobin > reference_ranges['hemoglobin']['high'] else 'normal')
        
        # Format and return predictions
        return jsonify({
            'name': name,
            'blood_group': blood_group,
            'rbc_count': f"{predicted_rbc:.2f} millions/cumm",
            'rbc_status': rbc_status,
            'wbc_count': f"{predicted_wbc:.2f} /microliter",
            'wbc_status': wbc_status,
            'platelets_count': f"{int(predicted_platelets)} /microliter",
            'platelets_status': platelets_status,
            'hemoglobin': f"{predicted_hemoglobin:.2f} g/dL",
            'hemoglobin_status': hemoglobin_status
        })
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in predict route: {str(e)}\n{error_details}")
        return jsonify({'error': str(e)}), 400

@app.route('/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'success',
        'message': 'API is working!'
    })

@app.route('/info', methods=['GET'])
def info():
    # Provide information about the ML models and valid inputs
    models_loaded = all([model_rbc, model_wbc, model_platelets, model_hemoglobin])
    return jsonify({
        'status': 'running',
        'models_loaded': models_loaded,
        'valid_blood_groups': valid_blood_groups,
        'permittivity_range': '25.80 - 25.83',
        'version': '1.0'
    })
    
# Add a root endpoint for health checks
@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'status': 'running',
        'message': 'BioFlow API is operational',
        'version': '1.0'
    })

# Call this function when the app initializes
if __name__ == "__main__":
    load_or_train_models()
    app.run(debug=True) 