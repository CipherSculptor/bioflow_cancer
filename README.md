# BioFlow Login Page

A responsive login page for the BioFlow application with email/password authentication and social login options.

## Setup Instructions

1. Clone this repository to your local machine
2. Add the following images to the `assets` directory:
   - `logo.png` - BioFlow logo
   - `google-icon.png` - Google icon for the login button
   - `facebook-icon.png` - Facebook icon for the login button

## Features

- Clean and modern UI design
- Responsive layout that works on all devices
- Email and password authentication
- Social login options (Google and Facebook)
- "Forgot Password" and "Sign Up" functionality
- Smooth animations and transitions
- Cross-browser compatible

## File Structure

```
.
├── index.html
├── styles.css
├── script.js
├── README.md
└── assets/
    ├── logo.png
    ├── google-icon.png
    └── facebook-icon.png
```

## Usage

Simply open the `index.html` file in a web browser to view the login page. For production use, you'll need to:

1. Add your backend API endpoints for authentication
2. Configure Google and Facebook OAuth
3. Implement proper form validation and error handling
4. Set up proper security measures

## Customization

You can customize the colors and styling by modifying the CSS variables in the `styles.css` file. The main color scheme uses:
- Background: Dark maroon (#3D0C0C)
- Login container: Light green (#90EE90)
- Buttons and interactive elements use standard colors with hover effects 