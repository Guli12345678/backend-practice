# 🔧 Fix: Foreign Key Constraint Error

## ❌ The Problem:

You're getting a 500 error because you're trying to create a product with a `categoryId` that doesn't exist in the database.

**Error:** `Foreign key constraint violated on the constraint: products_categoryId_fkey`

## ✅ The Solution:

### Step 1: Create Categories First

Before creating products, you need to create categories:

```bash
# Create a category first
POST /api/category
{
  "name": "Electronics"
}

# This will return something like:
{
  "id": 1,
  "name": "Electronics"
}
```

### Step 2: Use Valid Category ID

When creating a product, use the category ID from step 1:

```bash
# Create product with valid category ID
POST /api/products
{
  "name": "iPhone 15",
  "price": 999,
  "categoryId": 1,  // Use the ID from the category you created
  "image": "data:image/jpeg;base64,..."
}
```

### Step 3: Check Available Categories

You can also check what categories exist:

```bash
# Get all categories
GET /api/category

# Or get categories from products endpoint
GET /api/products/categories
```

## 🎯 What I Fixed:

1. **Better Error Handling** - Now shows clear error message instead of 500
2. **Category Validation** - Checks if category exists before creating product
3. **Helpful Error Messages** - Tells you exactly what's wrong
4. **Added Categories Endpoint** - Easy way to see available categories

## 📝 Test Steps:

1. **Create a category:**

   ```bash
   POST /api/category
   {"name": "Electronics"}
   ```

2. **Create a product with that category ID:**

   ```bash
   POST /api/products
   {
     "name": "Test Product",
     "price": 100,
     "categoryId": 1,
     "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
   }
   ```

3. **Check the response** - Should work now! 🎉

## 🚨 Common Mistakes:

- ❌ Using `categoryId: 1` when no categories exist
- ❌ Using wrong category ID
- ❌ Not creating categories first

## ✅ Now You'll Get:

Instead of 500 error, you'll get:

```json
{
  "statusCode": 400,
  "message": "Category with ID 1 does not exist. Please create a category first.",
  "error": "Bad Request"
}
```

**Try creating a category first, then create your product!** 🚀
