const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testSystem() {
  console.log('🧪 No-Broker Kathmandu - Comprehensive System Test');
  console.log('================================================\n');

  const results = {
    backend: false,
    database: false,
    auth: false,
    listings: false,
    images: false,
    frontend: false
  };

  try {
    // Test 1: Backend Health
    console.log('1. Testing Backend Health...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
      if (healthResponse.data.status === 'OK') {
        console.log('✅ Backend is running and healthy');
        results.backend = true;
      } else {
        console.log('❌ Backend health check failed');
      }
    } catch (error) {
      console.log('❌ Backend not accessible:', error.message);
    }

    // Test 2: Database Connection
    console.log('\n2. Testing Database Connection...');
    try {
      const dbResponse = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
      if (dbResponse.data.database === 'Connected') {
        console.log('✅ Database connection successful');
        results.database = true;
      } else {
        console.log('❌ Database connection failed');
      }
    } catch (error) {
      console.log('❌ Database test failed:', error.message);
    }

    // Test 3: Authentication System
    console.log('\n3. Testing Authentication System...');
    try {
      // Test registration
      const registerData = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+977-1-1234567',
        password: 'password123',
        role: 'tenant'
      };

      const registerResponse = await axios.post('http://localhost:5000/api/auth/register', registerData);
      if (registerResponse.data.token) {
        console.log('✅ User registration working');
        
        // Test login
        const loginData = {
          email: 'test@example.com',
          password: 'password123'
        };

        const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
        if (loginResponse.data.token) {
          console.log('✅ User login working');
          results.auth = true;
        } else {
          console.log('❌ User login failed');
        }
      } else {
        console.log('❌ User registration failed');
      }
    } catch (error) {
      console.log('❌ Authentication test failed:', error.response?.data?.error || error.message);
    }

    // Test 4: Listings API
    console.log('\n4. Testing Listings API...');
    try {
      const listingsResponse = await axios.get('http://localhost:5000/api/listings');
      if (listingsResponse.data.listings) {
        console.log('✅ Listings API working');
        console.log(`   Found ${listingsResponse.data.listings.length} listings`);
        results.listings = true;

        // Check if any listings have images
        const listingsWithImages = listingsResponse.data.listings.filter(
          listing => listing.primary_photo
        );
        console.log(`   ${listingsWithImages.length} listings have images`);
      } else {
        console.log('❌ Listings API failed');
      }
    } catch (error) {
      console.log('❌ Listings test failed:', error.response?.data?.error || error.message);
    }

    // Test 5: Image Serving
    console.log('\n5. Testing Image Serving...');
    try {
      // Check if uploads directory exists
      const uploadsDir = path.join(__dirname, 'backend', 'uploads', 'listings');
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        console.log(`✅ Uploads directory exists with ${files.length} files`);
        
        if (files.length > 0) {
          const testImage = files[0];
          const imageUrl = `http://localhost:5000/uploads/listings/${testImage}`;
          
          try {
            const imageResponse = await axios.get(imageUrl, {
              responseType: 'arraybuffer',
              timeout: 5000
            });
            console.log('✅ Image serving working');
            console.log(`   Test image: ${testImage} (${(imageResponse.data.length / 1024).toFixed(2)} KB)`);
            results.images = true;
          } catch (imageError) {
            console.log('❌ Image serving failed:', imageError.message);
          }
        } else {
          console.log('⚠️  No images found in uploads directory');
        }
      } else {
        console.log('❌ Uploads directory not found');
      }
    } catch (error) {
      console.log('❌ Image test failed:', error.message);
    }

    // Test 6: Frontend Accessibility
    console.log('\n6. Testing Frontend...');
    try {
      const frontendResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
      if (frontendResponse.status === 200) {
        console.log('✅ Frontend is accessible');
        results.frontend = true;
      } else {
        console.log('❌ Frontend not accessible');
      }
    } catch (error) {
      console.log('❌ Frontend not accessible:', error.message);
    }

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`Backend: ${results.backend ? '✅' : '❌'}`);
    console.log(`Database: ${results.database ? '✅' : '❌'}`);
    console.log(`Authentication: ${results.auth ? '✅' : '❌'}`);
    console.log(`Listings API: ${results.listings ? '✅' : '❌'}`);
    console.log(`Image Serving: ${results.images ? '✅' : '❌'}`);
    console.log(`Frontend: ${results.frontend ? '✅' : '❌'}`);

    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
      console.log('\n🎉 All tests passed! System is fully functional.');
      console.log('\n🌐 Access URLs:');
      console.log('   Frontend: http://localhost:3000');
      console.log('   Backend API: http://localhost:5000/api');
      console.log('   Health Check: http://localhost:5000/api/health');
      console.log('\n👥 Demo Accounts:');
      console.log('   Tenant: tenant@test.com / password123');
      console.log('   Owner: owner@test.com / password123');
      console.log('   Admin: admin@nobroker.com / password123');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the issues above.');
      console.log('\n🔧 Troubleshooting:');
      console.log('   1. Ensure PostgreSQL is running');
      console.log('   2. Start backend: cd backend && npm run dev');
      console.log('   3. Start frontend: cd frontend && npm start');
      console.log('   4. Check database connection in backend/.env');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

testSystem();
