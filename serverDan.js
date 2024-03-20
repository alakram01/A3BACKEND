const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Dummy database or array to store quote history
let quoteHistory = [
    {
        id: 3,
        clientName: 'Jon Doe',
        gallonsRequested: 799,
        deliveryAddress: '789 St.',
        deliveryDate: '01-10-9024',
        pricePerGallon: 999,
        amountDue: 147
    },
    // Add more quote objects as needed
];

app.use(bodyParser.json());

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '/src/components/GetQuote')));

// API endpoint to handle fuel quote requests
app.post('/getquote', (req, res) => {
    const { gallonsRequested, deliveryDate, deliveryAddress,id,clientName } = req.body;

    // Validate required fields
    if (!gallonsRequested || !deliveryDate) {
        return res.status(400).json({ error: 'Gallons requested and delivery date are required fields' });
    }

    // Calculate suggested price and total amount due
    const suggestedPrice = calculateSuggestedPrice(gallonsRequested, deliveryDate);
    const totalAmountDue = calculateTotalAmountDue(gallonsRequested, suggestedPrice);

    // Generate a unique id (replace this with your logic)
    

    // Construct quote object
    const newQuote = {
        id,
        clientName,
        gallonsRequested,
        deliveryAddress: 'Client Profile Delivery Address', // Placeholder for client address
        deliveryDate,
        pricePerGallon: suggestedPrice,
        amountDue: totalAmountDue
    };

    // Update database (or array) with the new quote
    quoteHistory.push(newQuote);

    // Redirect to GetQuote history upon successful database update
    res.redirect('/getquote/history');
});

// Route to fetch quote history
app.get('/getquote/history', (req, res) => {
    res.json(quoteHistory);
});
app.get('/', (req, res) => {
    res.json(quoteHistory);
});


function calculateSuggestedPrice(gallonsRequested, deliveryDate) {
    // Your logic for calculating suggested price based on gallonsRequested and deliveryDate
    return 2.5; // Placeholder value
}

function calculateTotalAmountDue(gallonsRequested, suggestedPrice) {
    // Your logic for calculating total amount due based on gallonsRequested and suggestedPrice
    return gallonsRequested * suggestedPrice; // Placeholder value
}

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});