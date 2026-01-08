import { pdfService } from './lib/pdfService';

// Test data for PDF generation
const testBillData = {
  id: 'TEST-001',
  items: [
    {
      product: { 
        id: '1',
        name: 'Almonds', 
        description: 'Premium almonds',
        price: 450.00,
        originalPrice: 500.00,
        image: '/images/almonds.jpg',
        category: 'nuts',
        weight: '500g',
        inStock: true,
        featured: true
      },
      quantity: 2,
      price: 450.00,
      discount: 0,
      total: 900.00
    },
    {
      product: { 
        id: '2',
        name: 'Cashews', 
        description: 'Premium cashews',
        price: 650.00,
        originalPrice: 700.00,
        image: '/images/cashews.jpg',
        category: 'nuts',
        weight: '250g',
        inStock: true,
        featured: false
      },
      quantity: 1,
      price: 650.00,
      discount: 0,
      total: 650.00
    }
  ],
  subtotal: 1550.00,
  tax: 279.00,
  total: 1829.00,
  customerName: 'John Doe',
  customerPhone: '+91-9876543210',
  date: new Date().toISOString(),
  paymentMethod: 'cash',
  shopConfig: {
    name: 'Shreem Nuts N Fruits',
    address: '123 Main Street, City',
    phone: '+91-1234567890',
    gstNumber: 'GST123456789'
  }
};

// Test PDF generation
async function testPDFGeneration() {
  try {
    console.log('🧪 Testing PDF generation...');
    const pdfBlob = await pdfService.generateBillPDF(testBillData);
    console.log('✅ PDF generated successfully, size:', pdfBlob.size, 'bytes');

    // Test download (commented out to avoid actual download in test)
    // pdfService.downloadPDF(pdfBlob, 'test_bill.pdf');
    // console.log('✅ PDF download initiated');

    return true;
  } catch (error) {
    console.error('❌ PDF generation failed:', error);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting PDF service tests...\n');

  const pdfTest = await testPDFGeneration();
  console.log('');

  if (pdfTest) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check the output above.');
  }
}

runTests();