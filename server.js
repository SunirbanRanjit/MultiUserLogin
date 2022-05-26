const express = require('express')
const path = require('path');
const http = require('http')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('./model/user');

const bodyParser = require('body-parser')
const { JsonWebTokenError } = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const server = http.createServer(app);
app.use(express.static('public'))
app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
JWT_SECRET =`fifghbpegurh84t0934834tqre['ogi'g;./gfhfdgiu]`;

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/neww', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true
});

app.get('/', (req, res) => {

})
console.log(mongoose.connection.readyState);

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());

//login route


app.post('/login' , async (req, res) => {
    // json parsing
    const {usertype, username, password: plainTextpassword } = req.body;
    var user;
    if(usertype === 'user'){
        // if user logins
        user = await User.findOne({$and:[{username}, {usertype: false}]}).lean();
    }else{
        // if admin logins
        user  = await User.findOne({$and: [{username}, {usertype: true}]}).lean();
    }
    //console.log(username,plainTextpassword);
    if(!user){
        // return error invalid username
        return res.json({state: 'error', error: 'Invalid username!!'});
    }

    if(await bcrypt.compare(plainTextpassword, user.password)){
        // username and password matched
        const token = jwt.sign({
            id: user._id,
            username: user.username,
            usertype: usertype

        }, 
            JWT_SECRET
        );
        return res.json({state: 'ok', data: token});
    }
    // case for incorrect password
    return res.json({state: 'error', error: 'Invalid password!!'});
})

//route for authenticate

app.post('/authenticate', async (req, res) => {
    const {token, usertype} = req.body;
    //console.log(token);
    try{
        // verify token stored in cookie

        const user = jwt.verify(token,JWT_SECRET);
        //console.log(user);
        if(user.usertype === usertype){
            // if token is verified
            return res.json({state: 'ok', username: user.username});
        }else{
            // if token is invalid or changed
            return res.json({state: 'error' , error: 'Please ... Log in'});
        }
    } catch(error){
        console.log(error);
        return res.json({state: 'error' , error: 'Oops.. \nSomething went wrong'});
    }
})

// route for getResult , returns the distance

app.post('/getResult', async (req, res) =>{
    const {token, long1, lat1} = req.body;
    try{
        // verify token
        const usr = jwt.verify(token,JWT_SECRET);
        var result = false;
        // find admin database for admin location 
        const user = await User.findOneAndUpdate({ $and: [{usertype: false}, {username: usr.username}]}, {long: long1, lat: lat1});
        const admin = await User.findOne({usertype: true},'long lat');
        //console.log(admin.long, admin.lat);
        
        // calculate distance between 2 places
        var dist = distance(lat1, admin.lat, long1, admin.long );
        if(dist<100){
            result= true;
        }
        return res.json({ state: 'ok', result, dist});
    }catch(error){
        console.log(error);
        return res.json({state:'error'})
    }
})

// route for setLocation, stores location in database

app.post('/setLocation', async (req, res) => {
    const {token, long1, lat1} = req.body;
    try{
        // verify token
        const user = jwt.verify(token,JWT_SECRET);
        
        const admin = await User.findOneAndUpdate({ $and: [{usertype: true}, {username: user.username}]}, {long: long1, lat: lat1});
        return res.json({ state: 'ok'});
    }catch(error){
        console.log(error);
        return res.json({state:'error'})
    }
})

// route for registration

app.post('/register', async (req, res) =>{
 
    const {username, password: plainTextpassword } = req.body;
    if(plainTextpassword.length <8)
        return res.json({status: 'error', error: 'Password should be atleast 8 characters'});
    const password = await bcrypt.hash(plainTextpassword ,  10 );
    
    try{
        // create new entry in database
        const response = await User.create({
            usertype: false, username, password
        });
        console.log('Usr created successfully ', response);
    }catch(error){
        //  console.log(JSON.stringify(error));

        // if there is a username conflict
        if(error.code === 11000)
            return res.json({status: 'error', error: 'Username already in use.'});
        else
            throw error;
    }

    res.json({ status: 'ok'});
});

// function to calculate distance from 2 points( longitude and latitude )
function distance(lat1,
    lat2, lon1, lon2)
{

// The math module contains a function
// named toRadians which converts from
// degrees to radians.
lon1 =  lon1 * Math.PI / 180;
lon2 = lon2 * Math.PI / 180;
lat1 = lat1 * Math.PI / 180;
lat2 = lat2 * Math.PI / 180;

// Haversine formula
let dlon = lon2 - lon1;
let dlat = lat2 - lat1;
let a = Math.pow(Math.sin(dlat / 2), 2)
+ Math.cos(lat1) * Math.cos(lat2)
* Math.pow(Math.sin(dlon / 2),2);

let c = 2 * Math.asin(Math.sqrt(a));

// Radius of earth in kilometers. Use 3956

let r = 3956;

// calculate the result
return(c * r);
}

const PORT  =  process.env.PORT || 3000;
server.listen(PORT, ()=> console.log(`Server started at ${PORT} `));