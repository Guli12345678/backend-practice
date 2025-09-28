# 📁 File Upload System - Easy to Use!

## ✅ What I Created:

I've added **real file upload** support! Now you can upload actual image files instead of base64 strings.

## 🚀 How to Use in Your Frontend:

### **Method 1: Upload Image First, Then Create Product**

#### Step 1: Upload Image File
```javascript
// Create FormData with your image file
const formData = new FormData();
formData.append('image', fileInput.files[0]); // fileInput is your <input type="file">

// Upload the image
const uploadResponse = await fetch('/api/products/upload-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData
});

const { imageUrl } = await uploadResponse.json();
// imageUrl will be like: "/uploads/products/uuid-filename.jpg"
```

#### Step 2: Create Product with Image URL
```javascript
const productResponse = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'iPhone 15',
    price: 999,
    categoryId: 1,
    image: imageUrl // Use the URL from step 1
  })
});
```

### **Method 2: Upload Image and Create Product in One Request**

```javascript
// Create FormData with image + product data
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('name', 'iPhone 15');
formData.append('price', '999');
formData.append('categoryId', '1');
formData.append('description', 'Latest iPhone');
formData.append('is_active', 'true');

// Create product with file upload
const response = await fetch('/api/products/with-file', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData
});
```

## 🎯 Frontend HTML Example:

```html
<form id="productForm">
  <input type="file" id="imageInput" accept="image/*" required>
  <input type="text" id="nameInput" placeholder="Product Name" required>
  <input type="number" id="priceInput" placeholder="Price" required>
  <input type="number" id="categoryInput" placeholder="Category ID" required>
  <textarea id="descriptionInput" placeholder="Description"></textarea>
  <button type="submit">Create Product</button>
</form>

<script>
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('image', document.getElementById('imageInput').files[0]);
  formData.append('name', document.getElementById('nameInput').value);
  formData.append('price', document.getElementById('priceInput').value);
  formData.append('categoryId', document.getElementById('categoryInput').value);
  formData.append('description', document.getElementById('descriptionInput').value);
  formData.append('is_active', 'true');
  
  try {
    const response = await fetch('/api/products/with-file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });
    
    const result = await response.json();
    console.log('Product created:', result);
  } catch (error) {
    console.error('Error:', error);
  }
});
</script>
```

## 📋 Available Endpoints:

1. **`POST /api/products/with-file`** - Create product with file upload (RECOMMENDED)
2. **`POST /api/products/upload-image`** - Upload image file only
3. **`POST /api/products`** - Create product with base64 image (old method)
4. **`GET /api/products/categories`** - Get available categories

## 🎨 Image Display in Frontend:

```html
<!-- Use the returned imageUrl directly -->
<img src="http://localhost:3020/uploads/products/filename.jpg" alt="Product" />
```

## ✅ Benefits:

- **Easy to Use** - Just select a file and upload
- **No Base64 Conversion** - Works with actual files
- **Automatic File Naming** - UUID-based unique names
- **File Validation** - Only allows image files
- **Size Limits** - 5MB maximum file size
- **Multiple Formats** - JPEG, PNG, GIF, WebP

## 🚨 Important Notes:

1. **Create Categories First** - Use `POST /api/category` before creating products
2. **Authentication Required** - All endpoints need JWT token
3. **File Size Limit** - Maximum 5MB per image
4. **Supported Formats** - Only image files (JPEG, PNG, GIF, WebP)

**Now you can easily upload images from your frontend!** 🎉
