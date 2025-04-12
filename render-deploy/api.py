import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
import joblib
import os

app = Flask(__name__)
# Configure CORS to allow requests from any origin with any headers
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*", "allow_headers": "*", "expose_headers": "*"}})

# Global variables to store our trained models and preprocessing objects
scaler_X = None
scaler_y = None
imputer_X = None
model = None

def load_or_train_models():
    global scaler_X, scaler_y, imputer_X, model

    # Check if models are already saved
    if os.path.exists('models/mlp_model.joblib'):
        # Load pre-trained models
        scaler_X = joblib.load('models/scaler_X.joblib')
        scaler_y = joblib.load('models/scaler_y.joblib')
        imputer_X = joblib.load('models/imputer_X.joblib')
        model = joblib.load('models/mlp_model.joblib')
        print("Loaded pre-trained models from disk")
    else:
        # Load and prepare data
        try:
            # Load the CSV data with proper handling of thousands separator
            data = pd.read_csv('sample 1.csv')
            print(f"Successfully loaded data from CSV: {len(data)} rows")

            # Fix column names (remove spaces if any)
            data.columns = data.columns.str.strip()

            print("Data shape after loading:", data.shape)
            print("Data columns:", data.columns.tolist())
            print("Data preview:", data.head())

        except FileNotFoundError:
            # Sample data if file not found (for development purposes)
            print("Warning: CSV file not found. Using sample data.")
            data = pd.DataFrame({
                'Age': np.random.normal(35, 10, 100),
                'Sex': np.random.choice([0, 1], size=100),  # 0 for female, 1 for male
                'Permittivity_Real': np.random.normal(25.81, 0.01, 100),
                'RBC': np.random.normal(4.5, 0.5, 100),
                'TLC': np.random.normal(8000, 1000, 100),
                'PLT /mm3': np.random.normal(250, 50, 100) * 1000,  # Realistic scale
                'HGB': np.random.normal(14, 1.5, 100)
            })

        # Select features and target variables
        X = data[['Age', 'Sex', 'Permittivity_Real']]
        y = data[['RBC', 'TLC', 'PLT /mm3', 'HGB']]

        # Handle missing values
        imputer_X = SimpleImputer(strategy='mean')
        X_imputed = pd.DataFrame(imputer_X.fit_transform(X), columns=X.columns)

        imputer_y = SimpleImputer(strategy='mean')
        y_imputed = pd.DataFrame(imputer_y.fit_transform(y), columns=y.columns)

        # Split data for validation
        X_train, X_test, y_train, y_test = train_test_split(X_imputed, y_imputed, test_size=0.2, random_state=42)

        # Feature scaling
        scaler_X = StandardScaler()
        X_train_scaled = scaler_X.fit_transform(X_train)
        X_test_scaled = scaler_X.transform(X_test)

        scaler_y = StandardScaler()
        y_train_scaled = scaler_y.fit_transform(y_train)

        print("Training model with MLPRegressor (Neural Network)...")

        # Train model with Neural Network
        model = MLPRegressor(hidden_layer_sizes=(64, 64), activation='relu',
                            solver='adam', max_iter=500, random_state=42)
        model.fit(X_train_scaled, y_train_scaled)

        # Evaluate model
        y_pred_scaled = model.predict(X_test_scaled)
        y_pred = scaler_y.inverse_transform(y_pred_scaled)

        # Print model evaluation metrics
        from sklearn.metrics import mean_absolute_error
        print(f"Model Mean Absolute Error: {mean_absolute_error(y_test, y_pred):.4f}")

        # Save models
        os.makedirs('models', exist_ok=True)
        joblib.dump(scaler_X, 'models/scaler_X.joblib')
        joblib.dump(scaler_y, 'models/scaler_y.joblib')
        joblib.dump(imputer_X, 'models/imputer_X.joblib')
        joblib.dump(model, 'models/mlp_model.joblib')

        print("Model trained and saved successfully")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        print("Received data:", data)  # Debug logging

        # Extract data from request
        try:
            permittivity = float(data['permittivity'])
            age = float(data['age'])
            gender = data['gender']
            # Convert gender to binary (0 for female, 1 for male)
            sex = 1 if gender.lower() == 'male' else 0
        except (ValueError, TypeError, KeyError) as e:
            return jsonify({
                'error': f'Invalid input data: {str(e)}'
            }), 400

        name = data['name']

        print(f"Extracted - Name: {name}, Age: {age}, Sex: {sex}, Permittivity: {permittivity}")  # Debug logging

        # Validate permittivity range
        if permittivity < 25.70 or permittivity > 25.90:
            print(f"Warning: Permittivity value {permittivity} is out of expected range (25.70-25.90)")
            return jsonify({
                'error': f'Permittivity value {permittivity} is out of expected range (25.70-25.90)'
            }), 400

        # Preprocess input
        input_data = np.array([[age, sex, permittivity]])
        input_data_imputed = imputer_X.transform(input_data)
        input_data_scaled = scaler_X.transform(input_data_imputed)

        # Make predictions
        prediction_scaled = model.predict(input_data_scaled)
        prediction = scaler_y.inverse_transform(prediction_scaled)[0]

        # Extract individual predictions
        predicted_rbc = prediction[0]
        predicted_wbc = prediction[1]
        predicted_platelets = prediction[2]
        predicted_hemoglobin = prediction[3]

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
    return jsonify({
        'permittivity_range': {'min': 25.70, 'max': 25.90},
        'model': {
            'type': type(model).__name__,
            'features': ['Age', 'Sex', 'Permittivity_Real'],
            'targets': ['RBC', 'TLC', 'PLT /mm3', 'HGB']
        }
    })

# Load models when the module is imported
try:
    load_or_train_models()
except Exception as e:
    print(f"Failed to load models: {str(e)}")

if __name__ == '__main__':
    try:
        app.run(debug=True, host='0.0.0.0', port=5070)
    except Exception as e:
        print(f"Failed to start server: {str(e)}")