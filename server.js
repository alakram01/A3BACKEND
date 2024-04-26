const express = require('express');
const app = express();
const cors =require('cors');
const knex = require('knex');
const bcrypt = require ('bcrypt-nodejs');

const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;


  const db= knex({
    client: 'pg',
    connection: {
      host : '127.0.0.1', //localhost
      user : 'postgres', //add your user name for the database here
      port: 5432, // add your port number here
      password : 'test', //add your correct password in here
      database : 'coogsfuel' //add your database name you created here
    }
});


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json("success");
});


app.post('/updateprofile',(req,res)=>{
    const{fullname, address1, address2, city,selectedState, zipcode,id} = req.body;
    if(!fullname || fullname.length > 100 || !address1 ||!city || !selectedState|| selectedState.length >2 || !zipcode || zipcode.length < 5 || zipcode.length > 9|| !id){
        res.status(400);
    }
    db('users')
  .where({ id: id })
  .update({ fullname: fullname, address1: address1,address2: address2,city: city, province: selectedState,zipcode:zipcode })
    .returning(['fullname', 'address1', 'address2', 'city','province', 'zipcode','name','id', 'joined', 'entries','email' ])
    .then((user) => {
        console.log(user[0]) ;
        if(user.length){
            res.json(user[0])
        }
        else{
            res.status(401).json('User not found in database')
        }
    })
.catch(err => res.status(400).json('Error getting user'))});


app.post('/signin',(req,res)=>{
    
    if (!email_pattern.test(req.body.email) || !password_pattern.test(req.body.password)) {
        return res.status(400).json('All fields are required');
    }
    db.select('email','hash').from('login')
    .where('email', '=', req.body.email)
    .then(data =>{
        const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
        if(isValid){
          return  db.select('*').from('users')
            .where('email', '=', req.body.email)
            .then(user=>{
                console.log(user);
                res.json(user[0])
            })
            .catch(err=> res.status(400).json('unable to get user'))
        }
        else{
            res.status(400).json('wrong credentials')
        }
    })
    .catch(err=> res.status(400).json('wrong credentials'))
});







app.post('/register',(req,res)=>{
    const{email, name, password} = req.body;
    
    if (!email_pattern.test(email) || !name || !password_pattern.test(password)) {
        return res.status(789).json('All fields are required');
    }

    // Check password length and complexity
    const MIN_PASSWORD_LENGTH = 8;
    if (password.length < MIN_PASSWORD_LENGTH) {
        return res.status(789).json('Password must be at least 8 characters long');
    }


    const hash = bcrypt.hashSync(password);
    db.transaction(trx=>{
        trx.insert({
            hash: hash,
            email: email
        })
        .into('login')
        .returning('email')
        .then(loginEmail=> {
            return trx('users')
                .returning('*')
                .insert({
                name: name,
                email: loginEmail[0].email,
                joined: new Date(),
                fullname:'',
                address1: '',
                address2: '',
                city:'',
                province:'',
                zipcode:''
             })
             .then(user=>{
                if(user.length){
                    res.json(user[0])
                }
                else{res.status(400).json('User not found in database')}})}).then(trx.commit).catch(trx.rollback)})
.catch(err => res.status(789).json('Error logging in'))
})
    




app.post('/clientprofile',(req,res)=>{
    const{fullname, name, address1, address2, city,selectedState, zipcode,id} = req.body;
    if(!fullname || fullname.length > 100 ||  !name || name.length > 100 ||  !address1 ||!city || !selectedState|| selectedState.length >2 || !zipcode || zipcode.length < 5 || zipcode.length > 9|| !id){
        res.status(400);
    }
    db('users')
  .where({ id: id })
  .update({ fullname: fullname, address1: address1,address2: address2,city: city, province: selectedState,zipcode:zipcode })
    .returning(['fullname', 'address1', 'address2', 'city','province', 'zipcode','name','id', 'joined', 'entries','email' ])
    .then((user) => {
        console.log(user[0]) ;
        if(user.length){
            res.json(user[0])
            res.status('ok');
        }
        else{
            res.status(501).json('User not found in database')
        }
    })
.catch(err => res.status(400).json('Error getting user'))
    
    
});



app.post('/GetQuote', async(req, res) => {
    const { gallonsRequested, deliveryDate, deliveryAddress,id,clientName } = req.body;
    console.log(deliveryDate);
    // Validate required fields
    if (!gallonsRequested || !deliveryDate) {
        return res.status(400).json({ error: 'Gallons requested and delivery date are required fields' });
    }
    try {

        // Retrieve user's province from the database
        const userData = await db('users').select('province').where({ id: id }).first();
        if (!userData) {
            return res.status(404).json({ error: 'User not found' });
        }
        const state = userData.province;

        // Determine Location Factor based on the user's state
        const locationFactor = state === 'TX' ? 0.02 : 0.04;

        // Check if the user has history (query 'quotes' table)
        const quotesCount = await db('quotes').where({ id: id }).count('id as count').first();
        const hasHistory = quotesCount.count > 0;
        const rateHistoryFactor = hasHistory ? 0.01 : 0;

        // Calculate suggested price and total amount due
        const suggestedPrice = calculateSuggestedPrice(gallonsRequested, locationFactor, rateHistoryFactor);
        const totalAmountDue = calculateTotalAmountDue(gallonsRequested, suggestedPrice);



        // Insert new quote into the database
        await db('quotes').insert({
            id,
            client_name: clientName,
            gallons_requested: gallonsRequested,
            delivery_address: deliveryAddress,
            delivery_date: deliveryDate,
            price_per_gallon: suggestedPrice,
            amount_due: totalAmountDue
        });
        // Send response
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving quote:', error);
        res.status(500).json( 'Internal server error' );
    
    }
    res.status('ok');
});


function calculateSuggestedPrice(gallonsRequested, locationFactor, rateHistoryFactor) {
    // Constants for calculation
    const currentPricePerGallon = 1.50;
    const gallonsRequestedFactor = gallonsRequested > 1000 ? 0.02 : 0.03;
    const companyProfitFactor = 0.10;

    // Calculate margin
    const margin = currentPricePerGallon * (locationFactor - rateHistoryFactor + gallonsRequestedFactor + companyProfitFactor);

    // Calculate suggested price per gallon
    const suggestedPrice = currentPricePerGallon + margin;

    return suggestedPrice;
}

function calculateTotalAmountDue(gallonsRequested, suggestedPrice) {
    // Calculate total amount due
    const totalAmountDue = gallonsRequested * suggestedPrice;
    return totalAmountDue;
}



app.post('/qoutehistory', async (req, res) => {
    const { id } = req.body;
    try {
        const quotes = await db('quotes').where({ id });
        res.json(quotes);
        res.status('ok');
    } catch (error) {
        console.error('Error retrieving quote history:', error);
        res.status(500).json({ error: 'Unable to retrieve quote history' });
    }
    res.status('ok');
});


 const PORT = 3000;
 app.listen(PORT, () => {

   console.log('Server is running on port PORT' + {PORT});
 });
 
module.exports = app;
