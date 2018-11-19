var express = require('express');
var app = express();
var engine = require('ejs-locals');
var bodyParser = require('body-parser');
app.engine('ejs', engine);
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
var crypto = require('crypto');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
//增加靜態檔案的路徑
app.use(express.static('public'))

var admin = require("firebase-admin");

var serviceAccount = require("./meowmeow-31087-firebase-adminsdk-mn4xy-674265ee68.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://meowmeow-31087.firebaseio.com"
});




//路由
app.get('/', function (req, res) {
    var user = {
        name: "陳冠維",
        id: 1
    }
    res.send(encodeOPayURI('HashKey=5294y06JbISpM5x9&ChoosePayment=CVS&ChooseSubPayment=CVS&ClientBackURL=https://developers.opay.tw/AioMock/MerchantClientBackUrl&EncryptType=1&ItemName=MacBook 30元X2#iPhone6s 40元X1&MerchantID=2000132&MerchantTradeDate=2018/11/19 17:45:28&MerchantTradeNo=DX20181119174528f85c&PaymentType=aio&ReturnURL=https://developers.opay.tw/AioMock/MerchantReturnUrl&StoreID=&TotalAmount=31&TradeDesc=建立超商代碼測試訂單&HashIV=v77hoKGq4kWxNNIS'));
})
app.post('/', function (req, res) {
    req.session.name = req.body.name;
    req.session.email = req.body.email;
    res.redirect('/')
})

app.get('/donate', function (req, res) {
    var tradeNo = CreateTradeNo();
    var orderDate = GetDateStr();
    var orderInfo = {
        ChoosePayment: "CVS",
        ItemName: "中途之家捐款",
        MerchantID: 2000132,
        MerchantTradeDate: orderDate,
        MerchantTradeNo: tradeNo,
        PaymentInfoURL: "http://140.127.220.111/finishCreateOrder",
        PaymentType: "aio",
        ReturnURL: "http://140.127.220.111/finishPay",
        TotalAmount: 50,
        TradeDesc: "捐款給中途之家"
    }
    orderInfo.CheckMacValue = CheckMacValue(orderInfo);
    CreateNewOrder(orderInfo);
    admin.database().ref('donate-request/' + tradeNo).update(orderInfo, function (error) {
        if (error) {
            console.log(error);
        }
        else {
            admin.database().ref('donate/' + tradeNo).on('value', function (snapshot) {
                if(snapshot.val() != null)
                res.send(tradeNo);
                // res.send(tradeNo);
            });
        }
    });
})

app.post('/finishPay', function(req,res){

});

app.post('/finishCreatOrder', function (req, res) {
    admin.database().ref('donate/' + req.body.MerchantTradeNo).update(req.body,function(error){
        if(error)
            console.log(error);
        else
            console.log('create order success');
    })
})

function CheckMacValue(orderInfo){
    var str = "";
    str += "HashKey=5294y06JbISpM5x9&";
    for(i in orderInfo)
    {
        str += i + "=" + orderInfo[i];
        str += "&";
    }
    str += "&HashIV=v77hoKGq4kWxNNIS";
    str = encodeOPayURI(str);
    console.log(str);
    str = sha256(str);
    return str;
}

function CreateNewOrder(orderInfo){
    var http = new XMLHttpRequest();
    var url = 'https://payment-stage.opay.tw/Cashier/AioCheckOut/V5';
    var params = '';
    var isFirst = true;
    for(i in orderInfo)
    {
        if(isFirst)
            isFirst = false;
        else
            params += "&";

        params += i + "=" + orderInfo[i];
    }
    http.open('POST', url, true);
    http.send(params);
}

function GetDateStr(){
    var date = new Date();
    var str = date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDay() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
}

function CreateTradeNo(){
    return crypto.randomBytes(32).toString('base64').substr(0, 20);
}

function encodeOPayURI(str) {
    str = encodeURIComponent(str);
    str = str.replace(/\%20/g, '+');
    str = str.toLowerCase();
    return str;
}

var sha256 = function sha256(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    };

    var mathPow = Math.pow;
    var maxWord = mathPow(2, 32);
    var lengthProperty = 'length'
    var i, j; // Used as a counter across the whole file
    var result = ''

    var words = [];
    var asciiBitLength = ascii[lengthProperty] * 8;

    //* caching results is optional - remove/add slash from front of this line to toggle
    // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
    // (we actually calculate the first 64, but extra values are just ignored)
    var hash = sha256.h = sha256.h || [];
    // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
    var k = sha256.k = sha256.k || [];
    var primeCounter = k[lengthProperty];
	/*/
	var hash = [], k = [];
	var primeCounter = 0;
	//*/

    var isComposite = {};
    for (var candidate = 2; primeCounter < 64; candidate++) {
        if (!isComposite[candidate]) {
            for (i = 0; i < 313; i += candidate) {
                isComposite[i] = candidate;
            }
            hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
            k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
        }
    }

    ascii += '\x80' // Append Ƈ' bit (plus zero padding)
    while (ascii[lengthProperty] % 64 - 56) ascii += '\x00' // More zero padding
    for (i = 0; i < ascii[lengthProperty]; i++) {
        j = ascii.charCodeAt(i);
        if (j >> 8) return; // ASCII check: only accept characters in range 0-255
        words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words[lengthProperty]] = ((asciiBitLength / maxWord) | 0);
    words[words[lengthProperty]] = (asciiBitLength)

    // process each chunk
    for (j = 0; j < words[lengthProperty];) {
        var w = words.slice(j, j += 16); // The message is expanded into 64 words as part of the iteration
        var oldHash = hash;
        // This is now the undefinedworking hash", often labelled as variables a...g
        // (we have to truncate as well, otherwise extra entries at the end accumulate
        hash = hash.slice(0, 8);

        for (i = 0; i < 64; i++) {
            var i2 = i + j;
            // Expand the message into 64 words
            // Used below if 
            var w15 = w[i - 15], w2 = w[i - 2];

            // Iterate
            var a = hash[0], e = hash[4];
            var temp1 = hash[7]
                + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) // S1
                + ((e & hash[5]) ^ ((~e) & hash[6])) // ch
                + k[i]
                // Expand the message schedule if needed
                + (w[i] = (i < 16) ? w[i] : (
                    w[i - 16]
                    + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) // s0
                    + w[i - 7]
                    + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)) // s1
                ) | 0
                );
            // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
            var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) // S0
                + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

            hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
            hash[4] = (hash[4] + temp1) | 0;
        }

        for (i = 0; i < 8; i++) {
            hash[i] = (hash[i] + oldHash[i]) | 0;
        }
    }

    for (i = 0; i < 8; i++) {
        for (j = 3; j + 1; j--) {
            var b = (hash[i] >> (j * 8)) & 255;
            result += ((b < 16) ? 0 : '') + b.toString(16);
        }
    }

    result = result.toUpperCase();

    return result;
};

// 監聽 port
var port = process.env.PORT || 80;
app.listen(port);