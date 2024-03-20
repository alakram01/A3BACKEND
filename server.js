const express = require('express');
const app =express();
const cors =require('cors');
const knex = require('knex');
const bcrypt = require ('bcrypt-nodejs');

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

db.select('*').from('users').then(data=>{
    console.log(data);
});
db.select('*').from('login').then(data=>{
    console.log(data);
});
/*
const database ={
    users:[
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'Asdfgh123',
            entries: 0,
            joined: new Date(),
            fullname:'',
            address1: '',
            address2: '',
            city:'',
            province:'',
            zipcode: '',

        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date(),
            fullname:'',
            address1: '',
            address2: '',
            city:'',
            province:'',
            zipcode:'',
        }

    ]
}
*/
//app.use(express.urlencoded({extended: false}))
app.use(express.json());
app.use(cors())

app.get('/',(req,res)=>{
    res.json(quoteHistory);
});

app.post('/updateprofile',(req,res)=>{
    const{fullname, address1, address2, city,selectedState, zipcode,id} = req.body;
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
.catch(err => res.status(400).json('Error getting user'))
   
    
});










app.post('/signin',(req,res)=>{
    
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
                else{
                    res.status(400).json('User not found in database')
                }
            
            
        })
    })

   .then(trx.commit)
   .catch(trx.rollback)
    })
.catch(err => res.status(789).json('Error logging in'))
})
    

/*
    database.users.push({
        id: '125',
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date(),
        fullname:'placeholder',
        address1: 'placeholder',
        address2: '',
        city:'placeholder',
        province:'ph',
        zipcode:'ph'
    })
    res.json(database.users[database.users.length-1])
    */


app.post('/clientprofile',(req,res)=>{
    const{fullname,name, address1, address2, city,selectedState, zipcode,id} = req.body;
    
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
.catch(err => res.status(400).json('Error getting user'))
    
    
});
app.get('/profile/:id',(req,res)=>{
    const{id} = req.params;
    
    db.select('*').from('users').where({id})
    .then(user=>{
        console.log(user)
        if(user.length){
            res.json(user[0])
        }
        else{
            res.status(400).json('User not found in database')
        }
       
    })
    .catch(err => res.status(400).json('Error getting user'))
    
    
});
app.post('/GetQuote', (req, res) => {
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
        deliveryAddress, // Placeholder for client address
        deliveryDate,
        pricePerGallon: suggestedPrice,
        amountDue: totalAmountDue
    };

    // Update database (or array) with the new quote
    quoteHistory.push(newQuote);

    // Redirect to GetQuote history upon successful database update
    res.json('ok');
});
function calculateSuggestedPrice(gallonsRequested, deliveryDate) {
    // Your logic for calculating suggested price based on gallonsRequested and deliveryDate
    return 2.5; // Placeholder value
}

function calculateTotalAmountDue(gallonsRequested, suggestedPrice) {
    // Your logic for calculating total amount due based on gallonsRequested and suggestedPrice
    return gallonsRequested * suggestedPrice; // Placeholder value
}




app.listen(3000);