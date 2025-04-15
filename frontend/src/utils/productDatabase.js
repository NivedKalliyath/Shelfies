// Product categories
export const PRODUCT_CATEGORIES = {
    'Seafood & Meat Products': [0, 1, 2, 11, 12, 13, 28, 29, 30, 31, 78, 114, 157, 159, 160, 236, 237, 238, 239, 240, 249, 255, 258, 259, 279],
    'Dairy & Milk Products': [4, 5, 6, 8, 14, 15, 32, 50, 72, 149, 150, 199, 200, 216, 250, 272, 280, 281, 282, 283, 284],
    'Beverages (Non-Alcoholic)': [3, 10, 21, 22, 40, 41, 42, 43, 44, 45, 46, 47, 48, 58, 60, 61, 65, 68, 91, 92, 93, 115, 162, 168, 191, 192, 193, 195, 196, 197, 198, 204, 242, 254, 269, 273, 285, 287],
    'Fruits': [9, 19, 26, 62, 66, 108, 169, 232, 244, 275, 286, 289, 290, 291, 292, 293],
    'Vegetables': [16, 20, 23, 27, 90, 94, 111, 264, 277],
    'Snacks & Confectionery': [17, 18, 24, 25, 33, 34, 35, 36, 37, 38, 39, 49, 63, 67, 69, 73, 75, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 110, 112, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 158, 164, 165, 166, 167, 172, 173, 174, 175, 183, 184, 185, 186, 187, 188, 189, 190, 194, 210, 211, 212, 213, 214, 215, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 233, 243, 245, 246, 247, 248, 251, 252, 253, 256, 260, 261, 262, 263, 265, 266, 267, 268, 270, 274, 278, 288],
    'Instant Foods & Noodles/Pasta': [176, 177, 178, 179, 180, 181, 182, 257, 271],
    'Bakery & Pastries': [70, 71, 170, 171, 205, 206, 217, 218, 219, 220],
    'Sauces, Condiments & Seasonings': [7, 51, 52, 53, 54, 55, 56, 57, 59, 64, 163],
    'Cereals': [74, 201, 202, 203],
    'Eggs & Tofu': [76, 276],
    'Mushrooms': [109, 156],
    'Alcoholic Beverages': [151, 152, 153, 154, 155, 241]
  };
  
  // Event listeners for product updates
  const listeners = new Set();
  
  // In-memory storage for products
  let products = [];
  
  // Subscribe to product updates
  export function subscribeToProducts(callback){
    listeners.add(callback);
    return () => listeners.delete(callback);
  }
  
  // Notify all listeners of updates
  function notifyListeners(){
    listeners.forEach(listener => listener());
  }
  
  // Function to get category from class ID
  export function getCategoryFromClassId(classId){
    for(const [category, ids] of Object.entries(PRODUCT_CATEGORIES)){
      if(ids.includes(classId)){
        return category;
      }
    }
    return 'Uncategorized';
  }
  
  // Function to update product count
  export function updateProductCount(classId, productName){
    const category = getCategoryFromClassId(classId);
    const existingProduct = products.find(p => p.name === productName);
    
    if(existingProduct){
      existingProduct.count += 1;
      existingProduct.lastUpdated = new Date().toISOString();
    } 
    else{
      products.push({
        name: productName,
        category,
        count: 1,
        lastUpdated: new Date().toISOString()
      });
    }
  
    // Notify all listeners of the update
    notifyListeners();
  }
  
  // Function to get all products
  export function getAllProducts(){
    return products;
  }
  
  // Function to get products by category
  export function getProductsByCategory(category){
    if (!category) return products;
    return products.filter(p => p.category === category);
  }
  
  // Function to search products
  export function searchProducts(query){
    const lowercaseQuery = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.category.toLowerCase().includes(lowercaseQuery)
    );
  }