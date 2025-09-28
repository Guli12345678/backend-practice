# 📚 Swagger File Upload Guide - Complete Documentation

## 🎯 What's Available in Swagger:

I've updated your Swagger documentation with **proper file upload support**! Now you can test file uploads directly in Swagger UI.

## 🚀 Swagger Endpoints for File Upload:

### **1. POST /api/products/with-file (RECOMMENDED)**

- **Purpose**: Create product with file upload in one request
- **Content-Type**: `multipart/form-data`
- **Swagger UI**: Shows file upload button + form fields
- **Fields**:
  - `image` (file) - Product image file (required)
  - `name` (string) - Product name (required)
  - `price` (number) - Product price (required)
  - `categoryId` (integer) - Category ID (required)
  - `description` (string) - Product description (optional)
  - `is_active` (boolean) - Product status (optional)

### **2. POST /api/products/upload-image**

- **Purpose**: Upload image file only
- **Content-Type**: `multipart/form-data`
- **Swagger UI**: Shows file upload button
- **Fields**:
  - `image` (file) - Image file (required)

### **3. POST /api/products/upload-base64**

- **Purpose**: Upload base64 image data
- **Content-Type**: `application/json`
- **Swagger UI**: Shows JSON input field
- **Fields**:
  - `image` (string) - Base64 encoded image (required)

### **4. POST /api/products**

- **Purpose**: Create product with base64 image (alternative method)
- **Content-Type**: `application/json`
- **Swagger UI**: Shows JSON input with base64 field
- **Fields**: Same as CreateProductWithImageDto

## 🎨 How to Use in Swagger UI:

### **Step 1: Access Swagger**

1. Go to `http://localhost:3020/api/docs`
2. Click "Authorize" button
3. Enter your JWT token: `Bearer your-jwt-token-here`
4. Click "Authorize"

### **Step 2: Test File Upload (Recommended Method)**

#### **Method A: Create Product with File Upload**

1. Find `POST /api/products/with-file`
2. Click "Try it out"
3. In the `image` field, click "Choose File" and select an image
4. Fill in other required fields:
   - `name`: "iPhone 15 Pro"
   - `price`: 999.99
   - `categoryId`: 1 (create a category first if needed)
   - `description`: "Latest iPhone"
   - `is_active`: true
5. Click "Execute"

#### **Method B: Upload Image First, Then Create Product**

1. **Upload Image**:
   - Find `POST /api/products/upload-image`
   - Click "Try it out"
   - Choose an image file
   - Click "Execute"
   - Copy the `imageUrl` from response

2. **Create Product**:
   - Find `POST /api/products`
   - Click "Try it out"
   - Fill in product data
   - Use the `imageUrl` from step 1 in the `image` field
   - Click "Execute"

## 📋 Step-by-Step Testing Process:

### **1. Create a Category First**

```
POST /api/category
{
  "name": "Electronics",
  "description": "Electronic devices and gadgets"
}
```

### **2. Test File Upload**

```
POST /api/products/with-file
- image: [Select your image file]
- name: "iPhone 15 Pro"
- price: 999.99
- categoryId: 1
- description: "Latest iPhone with advanced features"
- is_active: true
```

### **3. View Your Product**

```
GET /api/products
```

## 🎯 Swagger UI Features:

### **File Upload Button**

- Swagger automatically shows a "Choose File" button for file fields
- Supports drag & drop in modern browsers
- Shows file size and type validation

### **Form Data Display**

- Shows all form fields clearly
- Required fields are marked with red asterisk (\*)
- Example values are provided for each field

### **Response Examples**

- Shows expected response format
- Includes example response data
- Clear error message descriptions

## 🔧 Technical Details:

### **Supported File Types**

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### **File Size Limit**

- Maximum: 5MB per file
- Error message if exceeded

### **Authentication**

- All endpoints require JWT token
- Use "Authorize" button in Swagger UI
- Format: `Bearer your-jwt-token`

## 🚨 Important Notes:

1. **Create Categories First**: Use `POST /api/category` before creating products
2. **Authentication Required**: All endpoints need JWT token
3. **File Validation**: Only image files are accepted
4. **Size Limits**: Maximum 5MB per file
5. **Unique Filenames**: Files are automatically renamed with UUID

## 🎉 Benefits:

- **Easy Testing**: Test file uploads directly in Swagger
- **Visual Interface**: See file upload button and form fields
- **Real-time Validation**: Immediate feedback on file types and sizes
- **Complete Documentation**: All endpoints properly documented
- **Multiple Methods**: Choose between file upload or base64

**Now you can test file uploads directly in Swagger UI!** 🚀

## 🔗 Quick Links:

- **Swagger UI**: `http://localhost:3020/api/docs`
- **File Upload Endpoint**: `POST /api/products/with-file`
- **Image Upload Only**: `POST /api/products/upload-image`
- **Categories**: `GET /api/products/categories`
