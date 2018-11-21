var express = require('express');
var app = express();
var engine = require('ejs-locals');
var bodyParser = require('body-parser');
app.engine('ejs', engine);
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const jsdom = require("jsdom");
var request = require('request');
var crypto = require('crypto');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var xhr = new XMLHttpRequest();
var ecpay_payment = require('ECPAY_Payment_node_js');
//增加靜態檔案的路徑
app.use(express.static('public'))

var admin = require("firebase-admin");

var serviceAccount = require("./meowmeow-31087-firebase-adminsdk-mn4xy-674265ee68.json");

admin.initializeApp({
    // credential: admin.credential.cert(serviceAccount),
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://meowmeow-31087.firebaseio.com"
});

let inv_params = {
};




//路由
app.get('/', function (req, res) {
    var user = {
        name: "陳冠維",
        id: 1
    }
    // res.send(crypto.createHash('sha256').update('HashKey=5294y06JbISpM5x9&ChoosePayment=CVS&ChooseSubPayment=CVS&ClientBackURL=https://developers.opay.tw/AioMock/MerchantClientBackUrl&EncryptType=1&ItemName=MacBook 30元X2#iPhone6s 40元X1&MerchantID=2000132&MerchantTradeDate=2018/11/19 17:45:28&MerchantTradeNo=DX20181119174528f85c&PaymentType=aio&ReturnURL=https://developers.opay.tw/AioMock/MerchantReturnUrl&StoreID=&TotalAmount=31&TradeDesc=建立超商代碼測試訂單&HashIV=v77hoKGq4kWxNNIS', 'utf8').digest());
})
app.post('/', function (req, res) {
    req.session.name = req.body.name;
    req.session.email = req.body.email;
    res.redirect('/')
})

app.get('/donatecvs', function (req, res) {
    
    // orderInfo.CheckMacValue = CheckMacValue(orderInfo);
    // console.log(JSON.stringify(orderInfo));
    // res.send(orderInfo);
    // res.send(crypto.createHash('sha256').update('hashkey%3d5294y06jbispm5x9%26choosepayment%3dcvs%26choosesubpayment%3dcvs%26clientbackurl%3dhttps%3a%2f%2fdevelopers.opay.tw%2faiomock%2fmerchantclientbackurl%26encrypttype%3d1%26itemname%3d%e4%b8%ad%e9%80%94%e4%b9%8b%e5%ae%b6%e6%8d%90%e6%ac%be%26merchantid%3d2000132%26merchanttradedate%3d2018%2f11%2f2+21%3a15%3a5%26merchanttradeno%3dtfirslpmt0rba03hirab%26paymenttype%3daio%26returnurl%3dhttp%3a%2f%2f140.127.220.111%2ffinishpay%26storeid%3d%26totalamount%3d50%26tradedesc%3d%e6%8d%90%e6%ac%be%e7%b5%a6%e4%b8%ad%e9%80%94%e4%b9%8b%e5%ae%b6%26hashiv%3dv77hokgq4kwxnnis').digest());
    // CreateNewOrder(orderInfo);
    
    var targetFundraisingKey = req.query.targetFundraisingKey;
    var targetFundraisingName = req.query.targetFundraisingName;
    var totalAmount = req.query.totalAmount;
    var sponsor = req.query.sponsor;
    var cvs_type = req.query.cvs_type;

    var tradeNo = CreateTradeNo();
    var orderDate = GetDateStr();
    let base_param = {
        ChooseSubPayment: cvs_type,
        MerchantTradeNo: tradeNo, //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
        MerchantTradeDate: orderDate, //ex: 2017/02/13 15:45:30
        TotalAmount: totalAmount,
        TradeDesc: targetFundraisingName,
        ItemName: targetFundraisingName,
        ReturnURL: 'http://140.127.220.111/finishPay',
        // ChooseSubPayment: '',
        // OrderResultURL: 'http://192.168.0.1/payment_result',
        // NeedExtraPaidInfo: '1',
        // ClientBackURL: 'https://www.google.com',
        // ItemURL: 'http://item.test.tw',
        // Remark: '交易備註',
        // StoreID: '',
        CustomField1: targetFundraisingKey,
        CustomField2: sponsor,
        // CustomField3: '',
        // CustomField4: ''
    };
    let cvs_params = {
        StoreExpireDate: '60',
        Desc_1: '超商螢幕描述A',
        Desc_2: '超商螢幕描述B',
        Desc_3: '超商螢幕描述C',
        Desc_4: '超商螢幕描述D',
        PaymentInfoURL: 'http://140.127.220.111/finishCreateOrder'
    };
    let client_redirect = '';
    let create = new ecpay_payment();
    let htm = create.payment_client.aio_check_out_cvs(cvs_info = cvs_params, parameters = base_param, invoice = inv_params, client_redirect_url = client_redirect);
    res.send(htm);
    // console.log(htm);
    // admin.database().ref('donate-request/' + tradeNo).update(orderInfo, function (error) {
    //     if (error) {
    //         console.log(error);
    //     }
    //     else {
    //         admin.database().ref('donate/' + tradeNo).on('value', function (snapshot) {
    //             if(snapshot.val() != null)
    //                 res.send(tradeNo);
    //             // res.send(tradeNo);
    //         });
    //     }
    // });
})

app.get('/donateatm', function(req,res){
    var targetFundraisingKey = req.query.targetFundraisingKey;
    var targetFundraisingName = req.query.targetFundraisingName;
    var totalAmount = req.query.totalAmount;
    var sponsor = req.query.sponsor;

    var tradeNo = CreateTradeNo();
    var orderDate = GetDateStr();
    let base_param = {
        MerchantTradeNo: tradeNo, //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
        MerchantTradeDate: orderDate, //ex: 2017/02/13 15:45:30
        TotalAmount: totalAmount,
        TradeDesc: targetFundraisingName,
        ItemName: targetFundraisingName,
        ReturnURL: 'http://140.127.220.111/finishPay',
        EncryptType: '1',
        ChooseSubPayment: 'CHINATRUST',
        // OrderResultURL: 'http://192.168.0.1/payment_result',
        // NeedExtraPaidInfo: '1',
        // ClientBackURL: 'https://www.google.com',
        // ItemURL: 'http://item.test.tw',
        // Remark: '交易備註',
        // StoreID: '',
        CustomField1: targetFundraisingKey,
        CustomField2: sponsor,
        // CustomField3: '',
        // CustomField4: ''
    };

    // 若要測試開立電子發票，請將inv_params內的"所有"參數取消註解 //
    let inv_params = {
        // RelateNumber: 'PLEASE MODIFY',  //請帶30碼uid ex: SJDFJGH24FJIL97G73653XM0VOMS4K
        // CustomerID: 'MEM_0000001',  //會員編號
        // CustomerIdentifier: '',   //統一編號
        // CustomerName: '測試買家',
        // CustomerAddr: '測試用地址',
        // CustomerPhone: '0123456789',
        // CustomerEmail: 'johndoe@test.com',
        // ClearanceMark: '2',
        // TaxType: '1',
        // CarruerType: '',
        // CarruerNum: '',
        // Donation: '2',
        // LoveCode: '',
        // Print: '1',
        // InvoiceItemName: '測試商品1|測試商品2',
        // InvoiceItemCount: '2|3',
        // InvoiceItemWord: '個|包',
        // InvoiceItemPrice: '35|10',
        // InvoiceItemTaxType: '1|1',
        // InvoiceRemark: '測試商品1的說明|測試商品2的說明',
        // DelayDay: '0',
        // InvType: '07'
    };

    let pay_info_url = 'http://140.127.220.111/finishCreateOrder';
    let exp = '60';
    let cli_redir_url = '';

    let create = new ecpay_payment();
    let htm = create.payment_client.aio_check_out_atm(parameters = base_param, url_return_payinfo = pay_info_url, exp_period = exp, client_redirect = cli_redir_url, invoice = inv_params);
    console.log(htm);
    res.send(htm);
})

app.post('/finishPay', function(req,res){

});

app.post('/finishCreateOrder', function (req, res) {
    console.log(JSON.stringify(req.body));
    res.send(JSON.stringify(req.body));
    var obj = req.body;
    obj['finishPay'] = false;
    admin.database().ref('donate/' + req.body.MerchantTradeNo).update(obj, function (error) {
        if (error)
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
    str += "HashIV=v77hoKGq4kWxNNIS";
    str = encodeOPayURI(str);
    console.log(str);
    // console.log(str);   
    str = sha256(str);
    return str;
}

function CreateNewOrder(orderInfo){
    var http = new XMLHttpRequest();
    var url = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5';
    http.open('POST', url, true);
    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
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
    // params = encodeURIComponent(params);
    console.log(params);
    http.onreadystatechange = function () {//Call a function when the state changes.
        if (http.readyState == 4 && http.status == 200) {
            console.log(http.responseText);
        }
    }
    http.send(params);
}

function GetDateStr(){
    var date = new Date();
    var str = date.getFullYear() + "/" + ('0' + (date.getMonth() + 1)).slice(-2) + "/" + ('0' + date.getDay()).slice(-2) + " " + ('0' + date.getHours()).slice(-2) + ":" + ('0' + date.getMinutes()).slice(-2) + ":" + ('0' + date.getSeconds()).slice(-2);
    return str;
}

function CreateTradeNo() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 20; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function makeid() {
}

function encodeOPayURI(str) {
    str = encodeURIComponent(str);
    str = str.replace(/\%20/g, '+');
    str = str.toLowerCase();
    return str;
}

Number.prototype.pad = function (n) {
    return new Array(n).join('0').slice((n || 2) * -1) + this;
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