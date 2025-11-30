// NEW - Backend integration (SECURE)
async function initiateRazorpayPayment() {
    const orderForm = document.getElementById('orderForm');
    const submitBtn = document.getElementById('paymentSubmitBtn');
    const selectedPlan = document.getElementById('planSelect').value;
    
    const planPrices = {
        artisan: 5999,
        couture: 14999,
        atelier: 29999,
        maison: 74999,
        legacy: 0
    };

    // Get customer info
    const clientNameInput = document.querySelector('input[name="clientname"]');
    const clientEmailInput = document.querySelector('input[name="clientemail"]');
    const clientPhoneInput = document.querySelector('input[name="clientphone"]');

    if (!clientNameInput || !clientEmailInput || !clientPhoneInput) {
        alert('Customer info not found. Please refresh.');
        return;
    }

    const clientName = clientNameInput.value;
    const clientEmail = clientEmailInput.value;
    const clientPhone = clientPhoneInput.value;

    if (!clientName || !clientEmail || !clientPhone) {
        alert('Please fill all customer details');
        return;
    }

    // Calculate amount
    const basePrice = planPrices[selectedPlan] || 0;
    let totalAmount = basePrice * 100;

    const addons = [
        { id: 'addonExtraModel', value: 2500 },
        { id: 'addonExtraGarment', value: 500 },
        { id: 'addonFastDelivery', value: 1000 },
        { id: 'addonPremiumRetouch', value: 1500 },
        { id: 'addonBrandNamePlacement', value: 1000 }
    ];

    addons.forEach(addon => {
        const checkbox = document.getElementById(addon.id);
        if (checkbox && checkbox.checked) {
            totalAmount += addon.value * 100;
        }
    });

    submitBtn.textContent = 'Creating Order...';
    submitBtn.disabled = true;

    try {
        // ✅ CALL YOUR NETLIFY BACKEND
        const createOrderResponse = await fetch('/.netlify/functions/createOrder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: totalAmount,
                currency: 'INR',
                receipt: 'order_' + Date.now()
            })
        });

        const orderData = await createOrderResponse.json();

        if (!orderData.success) {
            alert('Failed to create order: ' + orderData.message);
            submitBtn.textContent = 'Proceed to Payment';
            submitBtn.disabled = false;
            return;
        }

        // ✅ NOW OPEN RAZORPAY WITH BACKEND ORDER
        const options = {
            key: 'rzp_test_RlfywSc3dl1yTg',  // Still public (it's OK)
            order_id: orderData.orderId,      // ← From backend
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'Maison Model X',
            description: 'AI-Generated Fashion Model - ' + selectedPlan,
            prefill: {
                name: clientName,
                email: clientEmail,
                contact: clientPhone
            },
            theme: { color: '#d4af37' },
            handler: handlePaymentSuccess
        };

        const rzp = new Razorpay(options);
        rzp.open();

    } catch (error) {
        console.error('Error:', error);
        alert('Payment initialization failed: ' + error.message);
        submitBtn.textContent = 'Proceed to Payment';
        submitBtn.disabled = false;
    }
}
