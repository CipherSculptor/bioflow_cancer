from api import app, load_or_train_models

# Load models when the application starts
load_or_train_models()

if __name__ == "__main__":
    app.run() 