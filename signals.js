let kwVersion = 1.01
let websocketClients = {}
let marketsList = []
let signalData = {}
let signalDataHistory = {}
let D3_MARKET_CHART = {}
let BTCPairID = 0
let ETHPairID = 0
let lastMessage = Math.floor(new Date()) // SET LAST MESSAGE AS NOW
let accountsData = {}
let angelData = {}
let angelLastMessage = 0




/* $.getJSON('https://koinwatch.com/json-data/exchanges-list.json',
     function(jsonData) {
    exchangesList = jsonData
   // console.log('LOADED AND FOUND '+exchangesList.length+' EXCHANGES FROM CONFIG')
}).error(function(jqXhr, textStatus, error) {
            console.log("ERROR: " + textStatus + ", " + error);
}); */
/* 
// INITATE DOWNLOAD OF CONFIG FILES
$.getJSON('https://koinwatch.com/json-data/signals-config.json',
     function(jsonData) {
    // SET CONFIG
        config = jsonData
       // console.log('LOADED AND FOUND CONFIG',config)            
    // ASSIGN THE ID TO USE FOR BTCUSD VALUE CONVERSION
        BTCPairID = config.BTCPairID
        ETHPairID = config.ETHPairID
    // START WEBSOCKETS FOR CUSTOMER AND MARKET DATA
        startWebSocket(config.koinwatchWSURL,"MARKET-DATA")
    // CHECK WEBSOCKET STATUS EVERY 5 SECONDS
        setInterval(checkWebsocketActive(config.koinwatchWSURL,"MARKET-DATA"), 5000)

    if(pageIdentifcation != 'SIGNALS-HOME-PAGE') {    
        // LOAD TIME PERIODS
            populateTimePeriods()
     //     BUILD MARKET DATA AREA
            buildMarketHistoryArea()
        // RELOAD MARKET AND GRAPH IF REFRESHED AND SELECTED MARKET IS FOUND
     //       loadMarket()
    }
    
    if(pageIdentifcation == 'SIGNALS-DASHBOARD-DEVELOPER') {
        $('.devOnly').show();     
    }    

}).error(function(jqXhr, textStatus, error) {
            console.log("ERROR: " + textStatus + ", " + error);
});

 */



// INITIALISE ON PAGE READY
$( document ).ready(function() {


    BTCPairID = config.BTCPairID
    ETHPairID = config.ETHPairID
    // START WEBSOCKETS FOR CUSTOMER AND MARKET DATA
    startWebSocket(config.koinwatchWSURL,"MARKET-DATA")
    // CHECK WEBSOCKET STATUS EVERY 5 SECONDS
    setInterval(checkWebsocketActive(config.koinwatchWSURL,"MARKET-DATA"), 5000)
    
    if(pageIdentifcation != 'SIGNALS-HOME-PAGE') {    
    // LOAD TIME PERIODS
        populateTimePeriods()
    //     BUILD MARKET DATA AREA
        buildMarketHistoryArea()
    // RELOAD MARKET AND GRAPH IF REFRESHED AND SELECTED MARKET IS FOUND
    //       loadMarket()
    }
    
    if(pageIdentifcation == 'SIGNALS-DASHBOARD-DEVELOPER') {
    $('.devOnly').show();     
    } 
    
    
   // console.log('DOCUMENT READY')

    $('#entry').on('click', '.condition img', function() {    
       // console.log('clicked',$(this).parent().data("text"))
        if(algorithm.entryConditions !== undefined) {            
            let removeFromArray = $(this).parent().data("text")        
            for(var i = algorithm.entryConditions.length - 1; i >= 0; i--) {
                if(algorithm.entryConditions[i] == removeFromArray) {
                   algorithm.entryConditions.splice(i, 1);
                }
            }
            
        }
        $(this).parent().remove();
    });
    
    $('#exit').on('click', '.condition img', function() {    
       // console.log('clicked',$(this).parent().data("text"))
        if(algorithm.exitConditions !== undefined) {
            let removeFromArray = $(this).parent().data("text")        
            for(var i = algorithm.exitConditions.length - 1; i >= 0; i--) {
                if(algorithm.exitConditions[i] == removeFromArray) {
                   algorithm.exitConditions.splice(i, 1);
                }
            }        
            
        }
        $(this).parent().remove();
    });
    
    init();    
    // RESIZE 
	resizeToFit()    

})



function init() {
    
  //  console.log('INIT')


// IF WE CANNOT ESTABLISH A CONNECTION AFTER 21 SECONDS THEN RELOAD THE PAGE     
    setInterval(function(){
        let now =  Math.floor(new Date())
        let timeSinceMessage = (now - lastMessage) / 1000
        if(timeSinceMessage > 21) {
            // RELOAD
            window.location.reload(true)
        }
    },5000)
    
    // DETECT AND HIDE ITEMS FROM CHROME
    if(detectChrome() === true) {        
      //  $('#takeScreen').hide()
        console.log('DETECTED CHROME BROWSER')           
    }
    // DISPLAY MARKET STATS ON LOADING LARGE GRAPH
    //$('.algorithm').show();
    $('.marketHistory').show();    
    $('.marketGraphDetailsHeader .marketDataBtn').css({'background-color': '#225F61'});
    displayOptions();
    displayChoice('entry');
    displayChoice('exit');
    
    if(pageIdentifcation != 'SIGNALS-DASHBOARD-DEVELOPER') {
        $('.marketArea .algorithmBtn').hide();    
        $('.marketArea .botsBtn').hide();    
        $('.marketArea .tradingBtn').hide();    
   }
}

function buildMarketHistoryArea() {

    let lenO = config.timePeriods.length       
    for (let y = 0; y < lenO; y++) {    
        let timePeriod = config.timePeriods[y].display
        if(timePeriod != '' && timePeriod.length > 0) {    

            if(!$("#marketGraphDetails .marketHistoryCont .marketData"+timePeriod).length) {
                // BUILD HTML AND APPEND
               let html = $(".marketHistoryTemplate").html()                   
               html = replaceAll(html, '[TIME]',timePeriod)
               html = replaceAll(html, '[TTIME]',config.timePeriods[y].ohlcv)
               html = replaceAll(html, '[TIMEDISPLAY]',timePeriod.replace('min',' min').replace('h',' hour'))
               //html = html.replace('[TTIME]',config.timePeriods[y].ohlcv)
               //html = html.replace('[TIMEDISPLAY]',timePeriod.replace('min',' min').replace('h',' hour'));                   
               //html = html.replace('[TIMEDISPLAY]',timePeriod.replace('min',' min').replace('h',' hour'));                   
               $(html).appendTo($("#marketGraphDetails .marketHistoryCont"))

            }                
        }
    }
    
}


function getExchangeName(exchangeID) {
    let len = exchangesList.length;
 //   console.log('MARKETS LIST',data.data,len)
    for (let y = 0; y < len; y++) {
        if(exchangesList[y].exchangeID == exchangeID) {
            return exchangesList[y].exchangeName
        }
    }
    return exchangeID
}


// WEBSOCKET FUNCTIONS
function startWebSocket(wsUri,wsID) {
    console.log("STARTING " + wsID+' WEBSOCKET -> '+wsUri)
    websocketClients[wsID] = new WebSocket(wsUri)
    websocketClients[wsID].onopen = function(evt) { onOpen(evt,wsID) }
    websocketClients[wsID].onclose = function(evt) { onClose(evt,wsID,wsUri) }
    websocketClients[wsID].onmessage = function(evt) { onMessage(evt,wsID) }
    websocketClients[wsID].onerror = function(evt) { onError(evt,wsID) }
}
// CHECK WEBSOCET IS ACTIVE AND START WEBSOCKET IF NOT
function checkWebsocketActive(wsUri,wsID){
    if(!websocketClients[wsID] || websocketClients[wsID].readyState === WebSocket.CLOSED) {

        // START WEBSOCKET SINCE IT IS NOT ACTIVE
        websocketClients[webSocketID].close() // CLOSE CONNECTION WITH SERVER
        // THIS SHOULD TRIGGER THE ONCLOSE FUNCTION TO START THE WEBSOCKET AGAIN

    }
}


function subscribeBalances(customerID,walletID,exchangeID) {        
    
    let thisMessage = {
              subscribe:true,              
			  accountsData:true,              
			  c:customerID,
              walletID:walletID,
              exchangeID:exchangeID,
              id:pageIdentifcation
		  }
        // SEND REQUEST
        sendOnWebsocket(thisMessage,"MARKET-DATA")
// DELETE LOCAL STORAGE    
    delete accountsData[walletID]
// SET HTML TO BE BLANK    
    $('#balancesList #wallet'+walletID).html('');
    
}
function unsubscribeBalances(customerID,walletID,exchangeID) {        
    
    let thisMessage = {              
              unsubscribe:true,
			  accountsData:true,
			  c:customerID,
              walletID:walletID,
              exchangeID:exchangeID,
              id:pageIdentifcation
		  }
        // SEND REQUEST
        sendOnWebsocket(thisMessage,"MARKET-DATA")
// DELETE LOCAL STORAGE    
    delete accountsData[walletID]
// SET HTML TO BE BLANK    
    $('#balancesList #wallet'+walletID).remove();
    
}






function onOpen(evt,webSocketID) {

    console.log("CONNECTED TO " + webSocketID +" WEBSOCKET")
    websocketClients[webSocketID].connected = true
    
    // SEND CLIENT IDENTIFICATION TO WEBSOCKET SERVER TO AUTHENTICATE
    let thisMessage = {
			  authenticate:true,
			  c:customerID,
              id:pageIdentifcation
		  }
        
    // SEND REQUEST FOR MARKET DATA GRAPH OF SELECTED MARKET/S
    if(isNaN(parseFloat($('#marketExchPairID').val())) !== true) {
        thisMessage.exchPairID = $('#marketExchPairID').val();
    } else {
        thisMessage.exchPairID = 0;
    }    
    let timePeriod = $('.marketArea #timePeriod').val()
    if(pageIdentifcation == 'SIGNALS-HOME-PAGE') { 
        // NO TIME PERIOD
    } else {        
        if(!timePeriod) timePeriod = '10min'
        // ADD REQUEST TIME PERIOD
        thisMessage.timePeriod = getTimePeriodConfig(timePeriod).graphRequest        
    }
    // SEND REQUEST
    sendOnWebsocket(thisMessage,webSocketID)
    
    if(customerID && customerID.indexOf('DEMO-') == -1) {        
        startAngelSubscription(customerID,21)
    }
    
}
function onClose(evt,webSocketID,wsUri) {
    console.log("DISCONNECTED FROM " + webSocketID +" WEBSOCKET -> RESTART IN 1 SECOND")
    setTimeout(function() {
        startWebSocket(wsUri,webSocketID)
    },1000)
}
function onError(evt,webSocketID) {
        console.log("ERROR FROM " + webSocketID +" WEBSOCKET -> "+stringifyIfObject(evt))
}
function onMessage(evt,webSocketID)  {

    let now =  Math.floor(new Date())
    lastMessage = now

	let data = JSON.parse(evt.data)
   // console.log(webSocketID,data)
    
    if(data.authenticated !== undefined && data.authenticated !== true) {
        console.log('AUTHENTICATION FAILED -> REDIRECT TO LOGIN')
        document.location.href = '/login/?timed_out=true'
    }    

// REPLY PONG TO PING    
	if(data.ping !== undefined ) {
      //  console.log('PINGED')
		sendOnWebsocket({pong:true,T:now},webSocketID)
        return
	}

// LOCAL MARKET DATA     
    if(webSocketID == "MARKET-DATA" && data.balances) {

       // console.log('BALANCE FROM',data.exchangeID,data)
        processBalancesData(data)

    }
    
// LOCAL MARKET DATA     
    if(webSocketID == "MARKET-DATA" && data.koinwatchAngel) {

        //console.log('ANGEL',data)
        processAngelData(data)

    }    
    
    
    
// LOCAL MARKET DATA     
    if(webSocketID == "MARKET-DATA") {

        processMarketData(data)

    }
    
        
    

}
function sendOnWebsocket(message,webSocketID) {
    if(websocketClients["MARKET-DATA"].connected !== true) {
        console.log(webSocketID+ " WEBSOCKET CANNOT SEND NOT CONNECTED -> " + message)
        return
    }
    // STRINGIFY IF NEEDED BEFORE SENDING
    message = stringifyIfObject(message)
    websocketClients[webSocketID].send(message)
    console.log(webSocketID+ " WEBSOCKET SENT: " + message)
}
window.onbeforeunload = function() {
    for(let webSocketID in websocketClients) {
        websocketClients[webSocketID].onclose = function () {} // DISABLE ONCLOSE HANDLER
        websocketClients[webSocketID].close() // CLOSE CONNECTION WITH SERVER
    }
};
// end of WEBSOCKET FUNCTIONS    
///////////////////////////////////////////// 

function processAngelData(data) {
    
    if(data.koinwatchAngel !== undefined && data.data.instanceID) {
        let instanceID = data.data.instanceID
        let now =  Math.floor(new Date()) 
    // SAVE DATA TO LOCAL OBJECT    
        angelData[instanceID] = data.data          
    // SAVE EXCHANGE ID    
        angelData[instanceID].exchangeID = data.exchangeID
    // SAVE BALANCES    
        angelData[instanceID].lastMessage = now
        angelLastMessage = now
    //console.log('ANGEL ->',data.data.instanceStatus,angelData[instanceID].instanceStatus,data.data)
    // DISPLAY ANGEL DATA    
        displayAngelData(instanceID);
    }        
}




function processBalancesData(data) {
    
    
    if(data.balances !== undefined) {
        
        let now =  Math.floor(new Date())                     
        
    // CREATE LOCAL WALLET IF DOES NOT EXIST    
        if(!accountsData[data.walletID]) accountsData[data.walletID] = {};
    // SAVE EXCHANGE ID    
        accountsData[data.walletID].exchangeID = data.exchangeID
    // SAVE BALANCES    
        accountsData[data.walletID].balances = data.balances          
        accountsData[data.walletID].lastMessage = now
        
                   // console.log(data)
       // let updateSecsAgo = (parseFloat(now) - parseFloat(data.lastUpdate)) / 1000 
        
        if(!$('#balancesList #wallet'+data.walletID).length) {              
          //  console.log('CREATE NEW WALLET ELEMENT',data.walletID)                        
            document.getElementById('balancesList').innerHTML = document.getElementById('balancesList').innerHTML + '\n' + document.getElementById('balanceListTemplate').innerHTML.replace('[WALLETID]',data.walletID).replace('[WALLETID]',data.walletID)
        }        
        
        $('#balancesList #wallet'+data.walletID+' .nickName').html(data.nickName)

        for (let currency in data.balances) {

            let displayCurrency = currency.toUpperCase()  
            
            if(!$('#balancesList #wallet'+data.walletID+' .currencies #currency'+displayCurrency).length) {                              
              //  console.log('CREATE NEW ELEMENT')                        
                $('#balancesList #wallet'+data.walletID+' .currencies').html($('#balancesList #wallet'+data.walletID+' .currencies').html() + '\n' + document.getElementById('currencyTemplate').innerHTML.replace('[CURRENCY]',displayCurrency))               
            }                  

            let balance = 0 
            if(data.balances[currency] !== undefined && data.balances[currency].balance !== undefined) balance =  data.balances[currency].balance.toFixed(4)
            
            let balanceFiat = numberWithCommas((signalData[BTCPairID].lastPrice * balance).toFixed(0))

            // IF WE HAVE POSITIONS THEN DISPLAY PNL
            let PNL = "0.0000" 
            let PNLpercent = "0"                        
            let PNLFiat = "0.00"
            if(data.balances[currency] !== undefined && data.balances[currency].PNL !== undefined && parseFloat(data.balances[currency].PNL) != 0) {
                PNL = data.balances[currency].PNL.toFixed(4)            
                PNLFiat = numberWithCommas((signalData[BTCPairID].lastPrice * PNL).toFixed(0))
                PNLpercent = data.balances[currency].PNLpercent.toFixed(2)
            }


            let bgCol = "#225F61'"
            if(parseFloat(PNL) > 0) {
                bgCol = "#55AA55'"
            }
            if(parseFloat(PNL) < 0) {
                bgCol = "#ED5565'"
            }

            let currencySymbol = ''
            if(displayCurrency == 'XBT' || displayCurrency == 'BTC') {
                currencySymbol = '&#3647;'
            }
            if(displayCurrency == 'ETH') {
                currencySymbol = '<i class="fab fa-ethereum"></i>'
            }                        
            
            
            $('#balancesList #wallet'+data.walletID+' .currencies #currency'+displayCurrency+' .PNLcont').css("background-color",bgCol)
            $('#balancesList #wallet'+data.walletID+' .currencies #currency'+displayCurrency+' .PNL').html(PNL)
            $('#balancesList #wallet'+data.walletID+' .currencies #currency'+displayCurrency+' .PNLFiat').html("$"+PNLFiat)
            $('#balancesList #wallet'+data.walletID+' .currencies #currency'+displayCurrency+' .PNLpercent').html(PNLpercent+"%")
            $('#balancesList #wallet'+data.walletID+' .currencies #currency'+displayCurrency+' .currency').html(displayCurrency+' '+currencySymbol)
            $('#balancesList #wallet'+data.walletID+' .currencies #currency'+displayCurrency+' .balance').html(balance)
            $('#balancesList #wallet'+data.walletID+' .currencies #currency'+displayCurrency+' .balanceFiat').html("$"+balanceFiat)
            
        //    console.log('POSITIONS',data.positions)

            if(data.positions[currency] !== undefined && true === false) {

                for (let exchSymbol in data.positions[currency]) {

                    if(data.positions[currency][exchSymbol] !== undefined && data.positions[currency][exchSymbol].amount !== undefined && parseFloat(data.positions[currency][exchSymbol].amount) != 0) {       
                        
                    if(!$('#balancesList #wallet'+data.walletID+' .positions #position'+exchSymbol).length) {                              
                      //  console.log('CREATE NEW ELEMENT')                        
                        $('#balancesList #wallet'+data.walletID+' .positions').html($('#balancesList #wallet'+data.walletID+' .positions').html() + '\n' + document.getElementById('positionTemplate').innerHTML.replace('[EXCHSYMBOL]',exchSymbol))                
                    }                  



                        let bgPCol = "#225F61'"
                        if(parseFloat(data.positions[currency][exchSymbol].profitLoss) > 0) {
                            bgPCol = "#55AA55'"
                        }
                        if(parseFloat(data.positions[currency][exchSymbol].profitLoss) < 0) {
                            bgPCol = "#ED5565'"
                        }

                     //   customerHTML += "<div class='positions'><span class='exchSymbol'>"+exchSymbol+"</span> <span class='leverage'>"+(data.positions[currency][exchSymbol].leverage).toFixed(0)+"x</span> <span class='amount'>"+data.positions[currency][exchSymbol].amount+"</span><span>@</span> <span class='price'>"+data.positions[currency][exchSymbol].price+"</span> <span class='profitLoss' "+bgPCol+">"+data.positions[currency][exchSymbol].profitLoss.toFixed(4)+"  &nbsp;"+data.positions[currency][exchSymbol].profitLossPercent+"%</span></div>"
                        
                        $('#balancesList #wallet'+data.walletID+' .positions #position'+exchSymbol+' .exchSymbol').html(exchSymbol)             
                        $('#balancesList #wallet'+data.walletID+' .positions #position'+exchSymbol+' .leverage').html((data.positions[currency][exchSymbol].leverage).toFixed(0))             
                        $('#balancesList #wallet'+data.walletID+' .positions #position'+exchSymbol+' .price').html(data.positions[currency][exchSymbol].price)
                        $('#balancesList #wallet'+data.walletID+' .positions #position'+exchSymbol+' .amount').html(data.positions[currency][exchSymbol].amount)
                        $('#balancesList #wallet'+data.walletID+' .positions #position'+exchSymbol+' .PNLcont').css("background-color",bgPCol)
                        $('#balancesList #wallet'+data.walletID+' .positions #position'+exchSymbol+' .profitLoss').html(data.positions[currency][exchSymbol].profitLoss.toFixed(4))             
                        $('#balancesList #wallet'+data.walletID+' .positions #position'+exchSymbol+' .profitLossPercent').html(data.positions[currency][exchSymbol].profitLossPercent+"%")             
                        

                    }
                }
            }
        }
    }
}

function cleanIndicatorNames(data) {
    
    for(let indicator in data) {
                        
        let newKey = indicator.replace(/[^A-Za-z\s]/g,'');
        if(!data[newKey]) {
            Object.defineProperty(data, newKey,
                Object.getOwnPropertyDescriptor(data, indicator));
            delete data[indicator];            
        }
                        
    }
    return data 
}



//////////////////////////////////
// MARKETS FUNCTIONS
function sortMarketsList() {
    let main = document.getElementById( 'marketsListData' );
    [].map.call( main.children, Object ).sort( function ( a, b ) {
        return +a.id.match( /\d+/ ) - +b.id.match( /\d+/ );
    }).forEach( function ( elem ) {
        main.appendChild( elem );
    });
}

function rebuildDataArray(exchPairID,data,keyNames) {
    
    let dataArray = []
    let len = data.length
    let lenKeys = keyNames.length
    for (let y = 0; y < len; y++) {
        let obj = {}
        for (let z = 0; z < lenKeys; z++) {            
            if(data[y] !== null) {                
                obj[keyNames[z]] = data[y][z]            
            }
        }
        dataArray.push(obj)        
    }
    
    return dataArray
    
    
}


function createNewDataArray(exchPairID,data,keyNames) {
    
    let newArray = {}
    let len = keyNames.length
    for (let y = 0; y < len; y++) {                
        newArray[keyNames[y]] = parseFloat(getDataPoint (data,keyNames[y]))
    }    
    //console.log(newArray)
    return newArray

}

function buildMarketList(data) {
    
    
    let now =  Math.floor(new Date())
    let T =  data.T
    let exchangeID = data.exchangeID
    let keyNames = data.keyNames
    let fullData = data.data

    
    let lenK = keyNames.length
    let len = fullData.length
   //  console.log('full LENGTH',len)
    for (let z = 0; z < len; z++) {     
        
        // MARKET DATA
        let market = fullData[z]
        let exchPairID = 0
        let dataObj = {}
        // ASSIGN MARKET DATA TO SIGNAL DATA OBJECT
        for (let k = 0; k < lenK; k++) {     
        
            dataObj[keyNames[k]] = market[k]
            
            if(keyNames[k] == 'exchPairID') exchPairID = market[k]
        }        
        signalData[exchPairID] = dataObj
        signalData[exchPairID].exchangeID = data.exchangeID
       // console.log('full ',exchPairID,signalData[exchPairID])
    // CHECK IF ELEMENT EXISTS OR NEED TO ADD     
        if(exchPairID != 0 && !document.getElementById('exchPairID'+exchPairID)) {
    // ADD NEW MARKET
            let sourceHTML = $(".marketDataTemplate").html()
            sourceHTML = "<div id='exchPairID" + exchPairID + "' class='marketData' onclick='loadMarket(\""+exchPairID+"\")'>" + sourceHTML + "</div>"
            sourceHTML = sourceHTML.replace('[EXCHPAIRID]',exchPairID)
            // APPEND TO EXISTING MARKET DATA
            let existing = $(".marketsListData").html()
            if(existing === undefined) existing = ''
            sourceHTML = existing + sourceHTML
            // ASSIGN TO THE ELEMENT
            $(".marketsListData").html(sourceHTML)
         //   console.log(sourceHTML)
            // SORT LIST WITH NEW MARKET ADDED
            sortMarketsList()
            let logoURL = 'https://images.koinwatch.com' +  signalData[exchPairID].logo       
            $("#exchPairID"+exchPairID+" .logoURL").attr("src",logoURL)

        }        
    }
}

function updateMarketList(data) {
    
    let now =  Math.floor(new Date())
    let T =  data.T
    let exchangeID = data.exchangeID
    let keyNames = data.keyNames
    let fullData = data.data
    let exchPairIDindex = data.keyNames.indexOf('exchPairID')

    
    let lenK = keyNames.length
    let len = fullData.length
   //  console.log('full LENGTH',len)
    for (let z = 0; z < len; z++) {     
        
        // MARKET DATA
        let market = fullData[z]
        let exchPairID = market[exchPairIDindex]
        //console.log('exchPairID',exchPairIDindex,exchPairID)
        if(signalData[exchPairID] === undefined || signalData[exchPairID].decimalPlaces === undefined) return;
        let decimalPlaces = signalData[exchPairID].decimalPlaces
        let currencySymbol = signalData[exchPairID].currencySymbol
        let dataObj = {}
        // ASSIGN MARKET DATA TO SIGNAL DATA OBJECT
        for (let k = 0; k < lenK; k++) {             
            signalData[exchPairID][keyNames[k]] = market[k]
        } 
        
        for(let key in signalData[exchPairID]) {
                if(key && key !== '') {
                    let update = signalData[exchPairID][key]
                // CHECK IF PRICE AND ADD CURRENCY SYMBOL AND DISPLAY WITH COMMAS    
                    if(key.toLowerCase().indexOf('price') > -1) {
                        update = currencySymbol+numberWithCommas(parseFloat(update).toFixed(decimalPlaces))
                    }
                    if(key.toLowerCase().indexOf('score') > -1) {
                        if(key == 'score'){
                           updateScoreGauge(exchPairID,update)
                        }
                        update = parseFloat(update).toFixed(0)+'%'
                        
                    }
                    $("#exchPairID"+exchPairID+" ."+key).html(update)
                }
        }
        
        if(signalData[exchPairID].marketReady !== true) {
            $("#exchPairID"+exchPairID+" .signal").html('WAIT')                
        } 
    }    
    
    // UPDATE BITCOIN PRICE
    updateBitcoinPrice()
    
}


function updateScoreGauge(exchPairID,score) {

         if(score > 100) score = 100
         if(score < -100) score = -100
        // TURN INTO DEGREES
         let rotateScore = score + 100
         rotateScore = parseInt(rotateScore * (1.8/2))
       //  console.log(score,rotateScore)
        $('#exchPairID'+exchPairID+' .sc-percentage').css({
            "webkitTransform":"rotate("+rotateScore+"deg)",
            "MozTransform":"rotate("+rotateScore+"deg)",
            "msTransform":"rotate("+rotateScore+"deg)",
            "OTransform":"rotate("+rotateScore+"deg)",
            "transform":"rotate("+rotateScore+"deg)"
        });

    
}

function updateBitcoinPrice() {
    
        // DISPLAY THE BTC PRICE IN THE TITLE TAG 
        if(signalData[BTCPairID] !== undefined && pageIdentifcation != 'SIGNALS-HOME-PAGE') {                               
            document.title = 'BTC $'+numberWithCommas((signalData[BTCPairID].lastPrice).toFixed(signalData[BTCPairID].decimalPlaces)) + ' ETH $' +numberWithCommas((signalData[ETHPairID].lastPrice).toFixed(signalData[ETHPairID].decimalPlaces))
            
            
        }

}



function getDataFromPast(data,startIndex,startTime,secondsBefore,timeColumnIndex) {
 //   console.log('GETPAST',data.length,startIndex,startTime,secondsBefore)
    let lenX = data.length    
    for (let x = startIndex; x > -1; x--) {     
    //    console.log(startIndex,x)
        // FIND DATA POINT SECONDS AHEAD IN TIME BUT NO MORE THAN 30 SECONDS FROM TIME SPECIFIED
        if((startTime - data[x][timeColumnIndex])/1000 > secondsBefore && (startTime - data[x][timeColumnIndex])/1000 < (secondsBefore + 30)) {
            return data[x]
        }         
    // END IF TIME IS GONE TOO FAR ALREADY     
        if((startTime - data[x][timeColumnIndex])/1000 > secondsBefore + 30) {
            return false
        }
        
    }
}


let deltaSettings = {
    minutesAhead:[1,2,3,5,8,13],
    minutesBefore:[1,2,3,5,8,13]
}


function calculateDeltaSignals(exchPairID,fullGraph) {
    
    return 
    
    if(!exchPairID || !signalData[exchPairID] || !signalData[exchPairID].score || !signalData[exchPairID].scoreAvg || !signalDataHistory[exchPairID]) {
        return 
    }
    
    let data = signalDataHistory[exchPairID]
    let processData = [].push(signalData[exchPairID])
    if(fullGraph) {
      processData = signalDataHistory[exchPairID]  
    } 
    
    let len = processData.length
    let lenS = deltaSettings.minutesBefore.length
    let avgDelta = 0
   //  console.log('full LENGTH',len)
    for (let i = 0; i < len; i++) {         
    // BUILD INPUT DATA FROM PAST DELTAS            
        let input = []        
        for (let y = 0; y < lenS; y++) { 
            let pastData = getDataFromPast(data,i,processData[i].T,deltaSettings.minutesBefore[y]*60,"T")
            if(pastData) {
                input.push(processData[i]["orderBookLevels.05.val"] - pastData["orderBookLevels.05.val"])
             //   input.push(data[i]["orderBookLevels.1.val"] - pastData["orderBookLevels.1.val"])
             //   input.push(data[i]["orderBookLevels.2.val"] - pastData["orderBookLevels.2.val"])
            }
        }
        if(input.length) {            
            
            let avgTotal = 0
            let avgSum = 0
            for(let key in input) {
                avgSum += parseFloat(input[key])
                avgTotal++
            }
            let avg = avgSum/avgTotal
            data[i].deltaSignal = avg
            
            avgDelta = (avgDelta + avg) / i
            
            if(fullGraph) {
                if(processData[i-1] && processData[i-1].deltaSignal) processData[i].deltaSignalDelta = avgDelta
            } else {
                signalData[exchPairID].deltaSignalDelta = avgDelta
            }
/*
            if(avg > 0) {            
                            
            } else {                                        
                data[i].deltaSignal = -1
            }
*/
         //   console.log(data[i].deltaSignal,avg,input)
        } else {            
        // SET AS ZERO FOR HOLD SINCE NO DATA  
            if(fullGraph) {
                processData[i].deltaSignal = 0
                processData[i].deltaSignalDelta = 0
            } else {
                signalData[exchPairID].deltaSignal = 0
                signalData[exchPairID].deltaSignalDelta = 0
            }
        } 
        
        let avgDeltaSignal = calculateAvg(data,i,'deltaSignalDelta',21)
        if(!isNaN(parseFloat(avgDeltaSignal))) processData[i].deltaSignalDeltaAvg = parseFloat(avgDeltaSignal)        

    }
        
    
   // console.log(data)
    //orderBookLevels.05.avgPrice
    //orderBookLevels.1.price
    //orderBookLevels.2.price
}


function calcAvgs(exchPairID) {
    if(!exchPairID || !signalData[exchPairID] || !signalData[exchPairID].score || !signalData[exchPairID].scoreAvg || !signalDataHistory[exchPairID]) {
        return 
    }
    
    let data = signalDataHistory[exchPairID]    
    let len = data.length    
    let avgDelta = 0
   //  console.log('full LENGTH',len)
    for (let i = 0; i < len; i++) {  
        
        
        data[i]["orderBookLevels.05.valAvg.21"] = calculateAvg(data,i,"orderBookLevels.05.val",21)
        data[i]["orderBookLevels.1.valAvg.21"] = calculateAvg(data,i,"orderBookLevels.1.val",21)
        data[i]["orderBookLevels.2.valAvg.21"] = calculateAvg(data,i,"orderBookLevels.2.val",21)
        data[i]["orderBookLevels.5.valAvg.21"] = calculateAvg(data,i,"orderBookLevels.5.val",21)
        
        data[i]["orderBookLevels.05.valAvg.34"] = calculateAvg(data,i,"orderBookLevels.05.val",34)
        data[i]["orderBookLevels.1.valAvg.34"] = calculateAvg(data,i,"orderBookLevels.1.val",34)
        data[i]["orderBookLevels.2.valAvg.34"] = calculateAvg(data,i,"orderBookLevels.2.val",34)
        data[i]["orderBookLevels.5.valAvg.34"] = calculateAvg(data,i,"orderBookLevels.5.val",34)
        
        data[i]["orderBookLevels.05.valAvg.55"] = calculateAvg(data,i,"orderBookLevels.05.val",55)
        data[i]["orderBookLevels.1.valAvg.55"] = calculateAvg(data,i,"orderBookLevels.1.val",55)
        data[i]["orderBookLevels.2.valAvg.55"] = calculateAvg(data,i,"orderBookLevels.2.val",55)
        data[i]["orderBookLevels.5.valAvg.55"] = calculateAvg(data,i,"orderBookLevels.5.val",55)
        
    }
        
}

function calculateAvg(data,startIndex,keyName,periods) {    
    let avg = 0
    let periodCounter = 0
   //  console.log('full LENGTH',len)
    for (let i = startIndex; i >= 0; i--) {  
        periodCounter++
        avg += data[i][keyName]        
    }
    return (avg/periodCounter).toFixed(3)    
}



function processMarketData(data) {
    //
    // MARKET DATA OR MARKETSLIST
    if(data.marketsList !== undefined) {
        processMarketList(data)
        return
    }

    // IF VERSION IS NOT UP TO DATE, THEN RELOAD TO GET LATEST VERSION FROM SERVER
    if(data.kwVersion !== undefined && data.kwVersion != kwVersion) {
        // RELOAD
        console.log('RELOADING WEBPAGE FOR NEW VERSION',kwVersion,data.kwVersion)
        window.location.reload(true)
        return
    }
    
    //  SELECTED MARKET
    let marketExchPairID = $('#marketExchPairID').val()    

    if(data.signal === true)     {
        //console.log('data.signal',data)   
                
        if(data.full === true) {
            buildMarketList(data)
        }
        
        if(data.update === true) {
            updateMarketList(data)
        }
        
        
    }
    
    
    if(data.signal === true && data.fullMarket === true)     {
        let now = Math.floor(new Date())
         console.log('FULL DATA LOADED',data)
         let exchPairID = data.exchPairID
         signalData[exchPairID] = data.data
         signalData[exchPairID].lastSave = now 
         signalData[exchPairID].lastGraphUpdate = now
         signalData[exchPairID].loadedFull = now
    // CALCULATE MARKET SIGNALS
        calculateMarketSignals(exchPairID,signalData[exchPairID],true)         

    }

// RECEIVED FULL MARKET INFO    
    if(data.marketMakerSignal === true && data.fullMarketInfo === true)     {
        let now = Math.floor(new Date())
      //   console.log('FULL',data)
         let exchPairID = data.exchPairID
         signalData[exchPairID] = data.data
         signalData[exchPairID].lastSave = now 
         signalData[exchPairID].lastGraphUpdate = now
         signalData[exchPairID].loadedFull = now
        
        // CALCULATE MARKET SIGNALS
        calculateMarketSignals(exchPairID,signalData[exchPairID],true)         
        
      // ASSIGN MARKET AND CURRENCY SYMBOLS    
        let displayMarketCurrencySymbol = ''
        let currencySymbol = ''
        if(data.data !== undefined) {
            if(data.data.marketCurrency !== undefined) {
                signalData[data.exchPairID].displayMarketCurrencySymbol = data.data.marketCurrency
                if(data.data.marketCurrency == 'BTC') signalData[data.exchPairID].displayMarketCurrencySymbol = '&#3647;TC'
                if(data.data.marketCurrency == 'ETH') signalData[data.exchPairID].displayMarketCurrencySymbol = '<i class="fab fa-ethereum"></i> ETH'
            }
            if(data.data.baseCurrency !== undefined) {
                signalData[data.exchPairID].currencySymbol = data.data.currencySymbol
                if(!data.data.currencySymbol) {
                    signalData[data.exchPairID].currencySymbol = data.data.baseCurrency
                }
                if(data.data.baseCurrency == 'BTC') signalData[data.exchPairID].currencySymbol = '&#3647;'
                if(data.data.baseCurrency == 'ETH') signalData[data.exchPairID].currencySymbol = '<i class="fab fa-ethereum"></i>'
            }
        }
        
        
                

    }

    if(data.signal !== undefined && data.data !== undefined && signalData[data.exchPairID] !== undefined && data.graphData !== undefined && ($('#marketGraph').is(":visible") && marketExchPairID == data.exchPairID || $('#miniMarketGraph'+data.exchPairID).is(":visible"))) {
        

            let exchPairID = data.exchPairID
            let timePeriod = $('.marketArea #timePeriod').val()
            if(!timePeriod) timePeriod = '10min'
            if(pageIdentifcation == 'SIGNALS-HOME-PAGE') { 
                timePeriod = '30min'
            }
        //    console.log('GRAPH DATA RECEIVED',exchPairID)
            signalData[exchPairID].timePeriod = timePeriod
            let timePeriodConfig = getTimePeriodConfig(signalData[exchPairID].timePeriod)
            signalData[exchPairID].graphSave = timePeriodConfig.graphSave            

            graphData = rebuildDataArray(exchPairID,data.data,data.keyNames)
        
            
            //console.log('graphData',graphData)
            console.log('FULL GRAPH DATA LOADED',exchPairID,graphData)
    // CLEAN DATAPOINTS        
        /*
            let len = graphData.length
            for (let y = 0; y < len; y++) {
                
                for(let percent in graphData[y].orderBookLevels) {
                      //  graphData[y].ohlcv[timePeriod] = cleanIndicatorNames(graphData[y].ohlcv[timePeriod]) 
                    
                    let minMaxAvgBid = getAvgMinMaxValue(graphData[y].orderBookLevels[percent],"price")
                    avg = minMaxAvgBid.avg

                }            
            }
          */  
        // SAVE THE DATA HISTORY
             signalData[exchPairID].keyNames = data.keyNames
             signalDataHistory[exchPairID] = graphData
             signalData[exchPairID].lastSave = Math.floor(new Date())

        // ONLY SET ADD TOP & BOTTOM IF THEY HAVE NOT BEEN DEFINED SO TO KEEP VALUES
            if(signalData[exchPairID].scaleYAddTop === undefined) {            
                 signalData[exchPairID].scaleYAddTop = 0
                 signalData[exchPairID].scaleYAddBottom = 0
            }
 
        
    // SHOW AREA     
        showArea($('#showArea').val(),$('#showAreaBtnKey').val()) 
    
        
                
        // LOAD GRAPH
             loadGraph(exchPairID)
          //   console.log('LOADED HISTORY',exchPairID,signalData[exchPairID].marketSymbol,signalDataHistory[exchPairID].length,signalData[exchPairID].graphSave)
        
       // console.log(signalDataHistory[exchPairID])
        //console.log(signalDataHistory[exchPairID][signalDataHistory[exchPairID].length-1])
        
    }



     if(data.signal === true && data.updateMarket === true && data.data !== undefined && signalData[data.exchPairID] !== undefined && data.graphData === undefined && signalData[data.exchPairID].logo !== undefined && marketExchPairID == data.exchPairID)     {


      //  console.log('PARTIAL',data)
        let now =  Math.floor(new Date())
        let exchPairID = data.exchPairID
        
        let exchangeID = signalData[exchPairID].exchangeID
        let exchSymbol = signalData[exchPairID].exchSymbol
        let marketSymbol = signalData[exchPairID].exchSymbol
        // ASSIGN THE MARKET SYMBOL IF THERE IS ONE
        if(signalData[exchPairID].marketSymbol !== undefined) marketSymbol = signalData[exchPairID].marketSymbol
        let baseCurrency = signalData[exchPairID].baseCurrency
        let marketCurrency = signalData[exchPairID].marketCurrency
        let decimalPlaces = signalData[exchPairID].decimalPlaces
        let currencySymbol = signalData[exchPairID].currencySymbol
            
        
        
    // IF MORE THAN 5 SECONDS AND NO GRAPH DATA THEN SEND REQUEST        
         if(signalData[exchPairID].loadedFull > 0 && ((now - parseFloat(signalData[exchPairID].loadedFull))/1000) > 15) {
             if((marketExchPairID == exchPairID && signalDataHistory[exchPairID] === undefined && $(".marketArea").is(":visible")) || (pageIdentifcation == 'SIGNALS-HOME-PAGE' && signalDataHistory[exchPairID] === undefined)) {             
                 if(signalDataHistory[exchPairID] === undefined) {                     
                    signalDataHistory[exchPairID] = []
                 }
                loadMarket(exchPairID)
             }            
        }
         
         
    //  CHECK SOME DATA POINTS TO ENSURE THEY ARE A NUMBER BEFORE UPDATING              
        Object.keys(data.data).forEach(function(key) {
    // UPDATE LOCAL OBJECT WITH LATEST DATA
            if(signalData[exchPairID][key] !== undefined) {
                
                if(key.toLowerCase().indexOf('price') > -1 || key.toLowerCase().indexOf('score') > -1) {
                    
                    // UPDATE OBJECT
                   // if(typeof signalData[exchPairID][key] == 'object') {                        
                        signalData[exchPairID][key] = data.data[key]
                 //   }
                    // UPDATE STRING IF NOT AN OBJECT
                    if(isNaN(parseFloat(data.data[key])) !== true && typeof signalData[exchPairID][key] != 'object') {
                        //console.log('saved',key,data.data[key])
                    //    signalData[exchPairID][key] = data.data[key]     
                        
                    // UPDATE ELEMENTS FOR LOADED MARKET    
                        if(marketExchPairID == exchPairID) { 
                            
                            $('#marketGraphDetails .'+key).html(numberWithCommas((signalData[exchPairID][key]).toFixed(decimalPlaces)))
                    // UPDATE LAST PRICE ON GRAPH        
                            if(key == 'lastPrice') $('#marketGraph .zerolinetext').html(numberWithCommas((signalData[exchPairID][key]).toFixed(decimalPlaces)))
                    // UPDATE THE BACKGROUND COLOUR FOR THE LAST PRICE ON THE GRAPH        
                            if(key == 'score') {
                                let bgColour = '#2BA84A'
                                if(parseFloat(signalData[exchPairID][key]) < 0) bgColour =  '#ED5565'
                                $('#marketGraph .zeroline-rect').css("fill",bgColour)                                
                            }
                        }
                    } 
                } else {

                        signalData[exchPairID][key] = data.data[key] 
                }
                
            // UPDATE ELEMENTS ON THE PAGE IF NOT AN OBJECT
                if(typeof signalData[exchPairID][key] != 'object') { 
                    if(key.indexOf('Price') == -1 && key != 'last' && key != 'ATR') {
                       
                        if(marketExchPairID == exchPairID) {
                                $('#marketGraphDetails .'+key).html(data.data[key])
                        }
                        if(key == 'score' && marketExchPairID == exchPairID) {                                
                                let bgColour = '#2BA84A'
                                if(parseFloat(data.data[key]) < 0) bgColour =  '#ED5565'
                                $('#marketGraphDetails .'+key).html(data.data[key]+'%').css("background-color",bgColour)
                        }
                        if(key.indexOf('Score') > -1 && key.indexOf('Scores') == -1) {
                            let title = ''
                            let scoreWidth = data.data[key]
                            if(scoreWidth < 0) scoreWidth = 0 - scoreWidth
                            if(scoreWidth > 100) scoreWidth = 100
                            if(scoreWidth < 70) scoreWidth = 70
                            let bgColour = '#2BA84A'
                            if(parseFloat(data.data[key]) < 0) bgColour =  '#ED5565'                                                        
                            if(marketExchPairID == exchPairID) {
                                $('#marketGraphDetails .'+key).html(data.data[key]+'%');
                                if(key != 'volatilityScore') $('#marketGraphDetails .'+key).css("background-color",bgColour);
                            // .css("width",scoreWidth+"%")
                            }
                        }
                    }   
                }
            }
        })


        // CALCULATE DELTA SIGNALS
         //   calculateDeltaSignals(exchPairID)


// UPDATE BID/ASK WALLS IF VISIBLE
         if($("#exchPairID"+exchPairID+" .bidWalls").is(":visible") || $("#exchPairID"+exchPairID+" .askWalls").is(":visible")) {             
                // DISPLAY ORDERBOOK WALLS
               // displayOrderBookWalls(exchPairID,"#exchPairID"+exchPairID)
         }         
         
         
         
    
// UPDATE SELECTED/DISPLAYED MARKET 
            if(marketExchPairID == exchPairID) {


                               // console.log(signalData[exchPairID].priceWAvgs)
               //console.log(signalData[exchPairID].ATR["10min"])
                
                //if(data.data.scoreAvg !== undefined) console.log('scoreAvg',data.data.scoreAvg)
                    // LOAD LOGO ONTO GRAPH     
              let logoURL = 'https://images.koinwatch.com' +  signalData[exchPairID].logo        
              $(".marketArea .marketStats .graphLogoURL").attr("src",logoURL)    
              $(".marketArea .marketCurrency").html(signalData[exchPairID].marketCurrency)
              $(".marketArea .baseCurrency").html(signalData[exchPairID].baseCurrency)                
              //$('.marketArea .bc').html(currencySymbol)
              //$('.marketArea .mc').html(displayMarketCurrencySymbol)
              $('.marketArea .exchangeName').html(getExchangeName(exchangeID))
              $('.marketArea .currencySymbol').html(signalData[exchPairID].currencySymbol)
              $('.marketArea .marketSymbol').html(marketSymbol)

                
              
              $('.marketArea .low').html(currencySymbol+numberWithCommas(parseFloat(signalData[exchPairID].low).toFixed(decimalPlaces)))
              $('.marketArea .high').html(currencySymbol+numberWithCommas(parseFloat(signalData[exchPairID].high).toFixed(decimalPlaces)))
              $('.marketArea .range24h').html(signalData[exchPairID].range24h+'%')
              $('.marketArea .pipAmount').html(currencySymbol+parseFloat(signalData[exchPairID].pipAmount).toFixed(decimalPlaces))
              let pipAmountPercent = ((parseFloat(signalData[exchPairID].pipAmount) / parseFloat(signalData[exchPairID].lastPrice)) * 100).toFixed(3) 
              $('.marketArea .pipAmountPercent').html(pipAmountPercent+'%')
                
              let marketInfo = getMarketInfo(exchPairID)
              $('.marketArea .makerFeePercent').html(marketInfo.makerFee+'%')
              let makerFeePips = parseInt(parseFloat(marketInfo.makerFee)/parseFloat(pipAmountPercent))
              if((parseFloat(marketInfo.makerFee)/parseFloat(pipAmountPercent) - makerFeePips) > 0) {
                  makerFeePips += 1
              }                           
              $('.marketArea .makerFeePips').html(makerFeePips)
              $('.marketArea .makerFeeAmount').html(currencySymbol+(makerFeePips*parseFloat(signalData[exchPairID].pipAmount)).toFixed(decimalPlaces))
              $('.marketArea .takerFeePercent').html(marketInfo.takerFee+'%')
              let takerFeePips = parseInt(parseFloat(marketInfo.takerFee)/parseFloat(pipAmountPercent))
              if((parseFloat(marketInfo.takerFee)/parseFloat(pipAmountPercent) - takerFeePips) > 0) {
                  takerFeePips += 1
              }                  
              $('.marketArea .takerFeeAmount').html(currencySymbol+(takerFeePips*parseFloat(signalData[exchPairID].pipAmount)).toFixed(decimalPlaces))    
              $('.marketArea .takerFeePips').html(takerFeePips)
              let onePercentAmount = parseFloat(signalData[exchPairID].lastPrice)*0.01
               $('.marketArea .onePercentAmount').html(currencySymbol+numberWithCommas((onePercentAmount).toFixed(decimalPlaces)))
               let onePercentAmountPips =  parseInt(onePercentAmount / parseFloat(signalData[exchPairID].pipAmount))  
               if((parseFloat(onePercentAmount / parseFloat(signalData[exchPairID].pipAmount)) - onePercentAmountPips) > 0) {
                   onePercentAmountPips += 1
               }
               $('.marketArea .onePercentAmountPips').html(onePercentAmountPips)
        
                
            // DISPLAY SCORE AVGS
                displayScoreAvgs(exchPairID)
                
            // DISPLAY INDICATOR SCORES
                displayIndicatorScores(exchPairID)
                
            // DISPLAY ORDERBOOK AVGS    
                displayOrderBookAvgs(exchPairID)
                
            // CALCULATE MARKET SIGNALS
                calculateMarketSignals(exchPairID,signalData[exchPairID],true)                 
                
            // UPDATE BARS    
               updateBars()
            // UPDATE PRICE CHANGE    
               if(signalData[exchPairID].priceChange !== undefined) {
                //   console.log(signalData[exchPairID].priceStats)
                   for (var key in signalData[exchPairID].priceChange) {
                       $("#marketGraphDetails .change"+key).html(signalData[exchPairID].priceChange[key]+'%')
                   }

               }             

        // UPDATE ATR                
                if(signalData[exchPairID].ATR !== undefined) {
                   for (var key in signalData[exchPairID].ATR) {
                       let ATR = parseFloat(signalData[exchPairID].ATR[key])
                       $("#marketGraphDetails .ATR"+key).html(currencySymbol+numberWithCommas((ATR).toFixed(decimalPlaces)))
                       let ATRPercent = ((parseFloat(signalData[exchPairID].ATR[key]) / parseFloat(signalData[exchPairID].lastPrice)) * 100).toFixed(2)
                       $("#marketGraphDetails .ATR"+key+"Percent").html(ATRPercent+'%')                   
                       if(key == '24h') $(".marketArea .ATR24hPercent").html(ATRPercent+'%')                       
                   }
               }




                
            }
         
// IF VISIBLE MARKET THEN UPDATE MARKET DETAILS
        if($("#exchPairID"+exchPairID+" .marketDetails").is(":hidden") !== true || $("#marketGraphDetails").is(":hidden") !== true) {

            //console.log(exchPairID,data.data)

            let min1Sentiment = 0
            if(signalData[exchPairID].volumeScores !== undefined) {
                let min1Volume = 0
                for (var key in signalData[exchPairID].volumeScores) {
                    
                    let volume = parseFloat(signalData[exchPairID].volume[key])
                    // IF NOT XBTUSD THEN SET THE VALUE OF VOLUME AS BTC
/*                        if(exchPairID !== BTCPairID && signalData[BTCPairID] !== undefined) {
                            if(signalData[exchPairID].baseCurrency == 'USD') {
                                // GET USD VALUE FIRST
                                volume = parseFloat(volume) * parseFloat(signalData[exchPairID].lastPrice)
                                // NOW MAKE INTO BTC VALUE USING LAST BTCUSD PRICE
                                volume = parseFloat(volume) / parseFloat(signalData[BTCPairID].lastPrice)
                            }
                            if(signalData[exchPairID].baseCurrency == 'BTC') {
                                // MAKE INTO BTC VALUE USING LAST BTCUSD PRICE
                                volume = parseFloat(volume) / parseFloat(signalData[BTCPairID].lastPrice)
                            }
                        }*/
                    
                        if(key == 'T15s' || key == 'T30s' || key == 'T1') {
                            min1Sentiment += parseFloat(signalData[exchPairID].volumeScores[key])
                            min1Volume += parseFloat(volume)
                        } else {                        
                            $("#exchPairID"+exchPairID+" .volumeScore"+key+"").html((parseFloat(signalData[exchPairID].volumeScores[key])).toFixed(0)+'%')
                            if(marketExchPairID == exchPairID) $("#marketGraphDetails .volumeScore"+key+"").html((parseFloat(signalData[exchPairID].volumeScores[key])).toFixed(0)+'%')
                        }
                                                          
                        if(volume <= 1 && volume >= -1) volume = parseFloat(volume).toFixed(2)
                        if(volume == 0) volume = 0
                        if(volume > 1 || volume < -1) volume = parseFloat(volume).toFixed(1).replace('.0','')
                        if(volume >= 10 || volume <= -10) volume = parseFloat(volume).toFixed(0)
                    // DISPLAY 24H VOLUME 
                        if(marketExchPairID == exchPairID && key == 'T24h') {
                            $('.marketArea .vol24h').html(numberWithCommas(parseFloat(volume)))
                        }
                        if(volume >= 10000 || volume <= -10000) volume = parseFloat(volume/1000).toFixed(0) + 'k'
                        $("#exchPairID"+exchPairID+" .volume"+key).html('&#3647; '+volume)
                        if(marketExchPairID == exchPairID && (key != 'T15s' || key != 'T30s' || key != 'T1')) {
                            $("#marketGraphDetails .volume"+key).html('&#3647; '+volume)
                        }
                      //  console.log(exchPairID,key,signalData[exchPairID].volume[key])
                    
                    
                }
                
                if(min1Volume <= 1 && min1Volume >= -1) min1Volume = parseFloat(min1Volume).toFixed(2)
                if(min1Volume == 0) min1Volume = 0
                if(min1Volume > 1 || min1Volume < -1) min1Volume = parseFloat(min1Volume).toFixed(1).replace('.0','')
                if(min1Volume >= 10 || min1Volume <= -10) min1Volume = parseFloat(min1Volume).toFixed(0)
                if(min1Volume >= 10000 || min1Volume <= -10000) min1Volume = parseFloat(min1Volume/1000).toFixed(0) + 'k'                
                $("#exchPairID"+exchPairID+" .volumeScoreT1").html((parseFloat(min1Sentiment/3)).toFixed(0)+'%')
                $("#exchPairID"+exchPairID+" .volumeT1").html('&#3647; '+min1Volume)
                if(marketExchPairID == exchPairID) {                    
                    $("#marketGraphDetails .volumeScoreT1").html((parseFloat(min1Sentiment/3)).toFixed(0)+'%')
                    $("#marketGraphDetails .volumeT1").html('&#3647; '+min1Volume)
                }
            }
            
        // UPDATE VOLUME FACTOR SCORE
                if(signalData[exchPairID].volumeFactorScore !== undefined) {
                    
                    let volumeFactorScore =  signalData[exchPairID].volumeFactorScore
                    let bgColour = '#2BA84A'
                    if(parseFloat(volumeFactorScore) < 0) {
                        bgColour =  '#ED5565'
                        volumeFactorScore = 0 - volumeFactorScore
                    }
                 //   console.log('volumeFactorScore',volumeFactorScore)                    
                    $(".marketArea .volumeFactorScore").html(volumeFactorScore+'x').css("background-color",bgColour)
                    
                }              
        // UPDATE VOLUME FACTOR SCORE AVGS
                if(signalData[exchPairID].volumeFactorScoreAvg !== undefined) {
                   for (var key in signalData[exchPairID].volumeFactorScoreAvg) {         

                        let volumeFactorScore =  signalData[exchPairID].volumeFactorScoreAvg[key]                            
                        let bgColour = '#2BA84A'

                        if(parseFloat(volumeFactorScore) < 0) {
                            bgColour =  '#ED5565'
                            volumeFactorScore = 0 - volumeFactorScore
                        }
                        if(key == 'T1') {                                
                            if(parseFloat(min1Sentiment) < 0) {
                                bgColour =  '#ED5565'                                    
                            } else {
                                bgColour = '#2BA84A'                                    
                            }
                        }

                       $("#marketGraphDetails .volumeFactorScoreAvg"+key).html(volumeFactorScore+'x').css("background-color",bgColour)
                   }
                }

            // DISPLAY DEPTH PERCENTAGES
            if(signalData[exchPairID].orderBookLevels !== undefined && ($("#marketGraphDetails .orderBookStats").is(":visible") || $("#marketGraphDetails .OBscores").is(":visible") || $("#exchPairID"+exchPairID+" .marketDetails").is(":visible"))) {
                
                
            // DISPLAY ORDERBOOK WALLS
                if(marketExchPairID == exchPairID && $("#marketGraphDetails .orderBookStats").is(":visible")) {
                        displayOrderBookWalls(exchPairID,"#marketGraphDetails .orderBookStats")
                    //console.log('walls?')
                }

                
                if(marketExchPairID == exchPairID && signalData[exchPairID].orderBookLevels !== undefined) {
                    
                    for (var key in signalData[exchPairID].orderBookLevels) {
                        
                        if(!$("#marketGraphDetails .OBscores .lvl"+key.replace('.','')).length) {
                            // BUILD HTML AND APPEND
                           let html = $(".OBscoresDepthTemplate").html()
                            html = html.replace('[LEVEL]',key.replace('.',''))
                           if(key.indexOf('.') > -1) {
                            $(html).prependTo($("#marketGraphDetails .OBscores"))   
                           } else {                               
                            $(html).appendTo($("#marketGraphDetails .OBscores"))
                           }
                        }
                        
                    //UPDATE DATA FOR THIS LEVEL
                        if(key == "0.5") {
                            $("#marketGraphDetails .OBscores .lvl"+key.replace('.','')+" .OBscoresDepth").html('&plusmn;&#189;%') 
                        } else {
                            $("#marketGraphDetails .OBscores .lvl"+key.replace('.','')+" .OBscoresDepth").html('&plusmn;'+key+'%') 
                        }
                        
                        $("#marketGraphDetails .OBscores .lvl"+key.replace('.','')+" .OBorderBookScore").html(signalData[exchPairID].orderBookLevels[key].val+'%')  

                        $("#marketGraphDetails .OBscores .lvl"+key.replace('.','')+" .OBorderBookScorePrediction").html(signalData[exchPairID].orderBookLevels[key].percent+'%')  

                        $("#marketGraphDetails .OBscores .lvl"+key.replace('.','')+" .OBorderBookScorePredictionPrice").html(currencySymbol+numberWithCommas((signalData[exchPairID].orderBookLevels[key].price).toFixed(decimalPlaces)))  
                        
                                                
                        
                    }
                    
                 }
                
            }


        }

         
        // CHANGE COLOURS OF UPDATED VALUES
        changeColourOfNumber('bubble')         

// SAVE NEW DATA TO HISTORY ARRAY AND TRUNCATE OLD ONLY IF WE HAVE SOME HISTORY FIRST
         if(signalDataHistory[exchPairID] !== undefined && signalData[exchPairID].keyNames !== undefined && signalDataHistory[exchPairID].length > 0) {             
             
             // EXIT IF WE HAVE ZERO VALUES FOR PRICES 
             if(!signalData[exchPairID].lastPrice || !signalData[exchPairID].askPrice || !signalData[exchPairID].bidPrice) {
               return   
             }
             
             
             let timeSinceSave = (now - signalData[exchPairID].lastSave) / 1000
             let saveGraph = parseFloat(signalData[data.exchPairID].graphSave)             
        // CHECK TIME SINCE LAST SAVE      
             if(parseFloat(timeSinceSave) >= parseFloat(saveGraph)) {
                 
        // CREATE DATA ARRAY FOR GRAPH                
                 let graphDataArray = createNewDataArray(exchPairID,signalData[exchPairID],signalData[exchPairID].keyNames)                 
            // SAVE DATA TO HISTORY FOR GRAPH
                 if(graphDataArray !== undefined) {                     
                     signalDataHistory[exchPairID].push(graphDataArray)
                 } else {                     
                     console.log('graphDataArray.UNDEFINED',graphDataArray)
                 }
                 signalData[exchPairID].lastSave = now
                 // TRUNCATE TO KEEP LAST DATA
                 let timePeriodSeconds = getTimePeriodConfig(signalData[exchPairID].timePeriod).seconds;
                 //signalDataHistory[exchPairID] = getDataCompleteTimePeriod(exchPairID,signalDataHistory[exchPairID],timePeriodSeconds,signalData[exchPairID].keyNames)
                 
                 signalDataHistory[exchPairID] =  getGraphData(exchPairID,signalDataHistory[exchPairID],signalData[exchPairID].timePeriod)
                 
            // CALCULATE DELTA SIGNALS
                // calculateDeltaSignals(exchPairID)

                 
                 //signalDataHistory[exchPairID] = signalDataHistory[exchPairID].slice((0-signalData[exchPairID].graphLength),signalDataHistory[exchPairID].length)

                 // IF VISIBLE THEN UPDATE GRAPH SINCE WE HAVE NEW DATA OR WAS OVER 15 SECONDS AGO
                 let timeSinceGraphUpdate = (now - signalData[exchPairID].lastGraphUpdate) / 1000
                 
                 if((D3_MARKET_CHART[exchPairID].selector.indexOf('mini') > -1 && ($(D3_MARKET_CHART[exchPairID].selector).isInViewport() || timeSinceGraphUpdate > 15)) || (D3_MARKET_CHART[exchPairID].selector.indexOf('mini') == -1 && marketExchPairID == exchPairID && $(".marketArea").is(":visible") === true)) {
                     
                 //  console.log('UPDATING GRAPH',exchPairID)                     
                     updateGraph(exchPairID)
                     signalData[exchPairID].lastGraphUpdate = now                     
                 }
             }
         }

     }
}


function getDataCompleteTimePeriod(exchPairID,data,secondsBefore,keyNames) {
    
    
  let returnData = [];
  let len = data.length;
  if(len == 0) return data;
  let now = data[len-1][keyNames.indexOf('T')];       
  for (let l = 0; l < len; l++) {       
      if(data[l][keyNames.indexOf('T')] !== undefined && ((now - parseFloat(data[l][keyNames.indexOf('T')]))/1000) < secondsBefore) {
          returnData.push(data[l]);
      }      
     // console.log('timeSince',((now - parseFloat(data[l].T))/1000))
  };
  //returnData.sort(common.compareValues('T', 'asc'))
  return returnData;
    
    
}

function checkOrderBookLevel(exchPairID,lvl) {
    
    for(let key in signalData[exchPairID].orderBookLevels) {
        if(signalData[exchPairID].orderBookLevels[key].lvl == lvl) {
            return true
        }        
    }
    return false    
}

function displayIndicatorScores(exchPairID) {
    
        let indicatorScore = parseFloat(signalData[exchPairID].indicatorScore)
        let bgColour = '#2BA84A'
        if(parseFloat(indicatorScore) < 0) bgColour =  '#ED5565'

        $("#marketGraphDetails .indicatorScore").html(((indicatorScore).toFixed(0))+'%').css("background-color",bgColour)
   
    
        let lenO = config.timePeriods.length       
        for (let y = 0; y < lenO; y++) {
            //console.log(signalData[exchPairID].indicatorScoreAvg[config.timePeriods[y].display])
            if(config.timePeriods[y].display != '' && config.timePeriods[y].display.length > 0 && signalData[exchPairID].indicatorScoreAvg !== undefined) {                  
                bgColour = '#2BA84A'
                if(parseFloat(signalData[exchPairID].indicatorScoreAvg[config.timePeriods[y].display]) < 0) bgColour =  '#ED5565';               
                if(signalData[exchPairID].indicatorScoreAvg[config.timePeriods[y].display] !== null) {                    
                    $("#marketGraphDetails .indicatorScoreAvg"+config.timePeriods[y].display).html(((signalData[exchPairID].indicatorScoreAvg[config.timePeriods[y].display]).toFixed(0))+'%').css("background-color",bgColour)
                }
            }

        }
    
}


function displayOrderBookAvgs(exchPairID) {
    
    if(!signalDataHistory[exchPairID] || signalData[exchPairID].orderBookScoreAvg === undefined) return;
    
    for(let key in signalData[exchPairID].orderBookScoreAvg) {
        
        $("#marketGraphDetails .orderBookScoreAvg"+key).html(parseFloat(signalData[exchPairID].orderBookScoreAvg[key]).toFixed(0)+'%');
    }
    
}

function displayScoreAvgs(exchPairID) {
    
    if(!signalDataHistory[exchPairID] || signalData[exchPairID].scoreAvg === undefined) return;
    
    for(let key in signalData[exchPairID].scoreAvg) {        
        $("#marketGraphDetails .scoreAvg"+key).html(parseFloat(signalData[exchPairID].scoreAvg[key]).toFixed(0)+'%');
    }
    
}


function findCorelation() {
    
 let keyName1 = $(".correlationKey1").val();
 let keyName2 = $(".correlationKey2").val();

  const pcorr = (x, y) => {
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
  const minLength = x.length = y.length = Math.min(x.length, y.length),
    reduce = (xi, idx) => {
      const yi = y[idx];
      sumX += xi;
      sumY += yi;
      sumXY += xi * yi;
      sumX2 += xi * xi;
      sumY2 += yi * yi;
    }
  x.forEach(reduce);
  return (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
};
    let arrX = getDataFromKey(keyName1);
    let arrY = getDataFromKey(keyName2);
    let R = pcorr(arrX, arrY);
    // DISPLAY RESULT
    console.log('CORELLATION',keyName1,keyName2,'=',R);
    $(".correlationResult").html('CORELLATION '+keyName1+' '+keyName2+' = '+R)
    
}




function getDataFromKey(keyName) {
  
  let data = []
  let len = signalDataHistory[exchPairID].length
  for (let y = 0; y < len; y++) {
      if(keyName.replace(/[^.]/g, "").length == 0) {
        data.push(signalDataHistory[exchPairID][keyName])  
      }
      if(keyName.replace(/[^.]/g, "").length == 1) {
        data.push(signalDataHistory[exchPairID][keyName.split('.')[0]][keyName.split('.')[1]])
      }
      if(keyName.replace(/[^.]/g, "").length == 2) {
          data.push(signalDataHistory[exchPairID][keyName.split('.')[0]][keyName.split('.')[1]][keyName.split('.')[2]] );
      }
      if(keyName.replace(/[^.]/g, "").length == 3) {
          data.push(signalDataHistory[exchPairID][keyName.split('.')[0]][keyName.split('.')[1]][keyName.split('.')[2]][keyName.split('.')[3]]) ;
      }         
  }
  return data
    
    
}

function checkGraph(exchPairID) {

}

function loadMarket(exchPairID) {

    $(".maCont").hide(); 
    if ($(window).innerWidth() > 754) {        
        $(".marketArea").show(); 
    } else {
        $(".marketArea").hide(); 
    }
       
    
    //console.log('LOAD ->'+exchPairID)
    if(isNaN(parseInt(exchPairID)) === true) {
        exchPairID = $('#marketExchPairID').val()
    } else {
        if(pageIdentifcation != 'SIGNALS-HOME-PAGE') {   
            if(exchPairID == $('#marketExchPairID').val() && $("#exchPairID"+exchPairID+" .marketDetails").is(":hidden") === true) {                
                if ($(window).innerWidth() < 754)  $("#exchPairID"+exchPairID+" .marketDetails").toggle()
            }
            if(exchPairID != $('#marketExchPairID').val() && $("#exchPairID"+exchPairID+" .marketDetails").is(":hidden") === true) {                
                if ($(window).innerWidth() < 754)  $("#exchPairID"+exchPairID+" .marketDetails").toggle()
            }
            $('#marketExchPairID').val(exchPairID)
        }
    }
    // EXIT IF NO PAIR ID DETECTED
    if(isNaN(parseFloat(exchPairID)) === true) {
        console.log('CANNOT LOAD MARKET ->',exchPairID)
        return
    }
    // EXIT IF NO PAIR ID DETECTED
    if(config.timePeriods === undefined) {
        console.log('CANNOT LOAD MARKET ->',exchPairID)
        return
    }    
    if(signalData[exchPairID] === undefined) {
        signalData[exchPairID] = {}
    }

    let timePeriod = $('.marketArea #timePeriod').val()
    if(!timePeriod) timePeriod = '10min'
    if(pageIdentifcation == 'SIGNALS-HOME-PAGE') { 
        timePeriod = '10min'
    }

        // SAVE THE TIME PERIOD CONFIGURATION  FOR ADDING NEW DATA AND HOW MUCH DATA IS STORED LOCALLY
        signalData[exchPairID].timePeriod = timePeriod

        let timePeriodConfig = getTimePeriodConfig(timePeriod)
        if(timePeriodConfig !== undefined) {
            signalData[exchPairID].graphSave = timePeriodConfig.graphSave
            

            // LOAD DATA HISTORY FOR MARKET GRAPH USING THE GRAPH REQUEST AMOUNT FOR THIS TIME PERIOD
          //  if ($('.marketArea').length || $('#exchPairID'+exchPairID+' .miniMarketGraph').length) {
            loadMarketHistory(exchPairID,signalData[exchPairID].exchangeID,timePeriodConfig.graphRequest)
         //   }
            
                    
        // RESET THE GRAPH
        $("#marketArea #marketGraph").html($("#progressLoaderStorage").html()); 
        // RESET DATA AREA    
        $('.marketGraphDetails .detailCont').hide();
        $(".marketGraphDetails .loadingData").html($("#progressLoaderStorage").html()); 
        $('.marketGraphDetails .loadingData').show();
            
            
        }


}



function loadMarketHistory(exchPairID,exchangeID,timePeriod) {

// CREATE THE OBJECTS IF THEY DO NOT EXIST        
    let thisMessage = {
          requestMarketGraph:true,
          customerID:customerID,
          exchangeID:exchangeID,
          exchPairID:exchPairID,
          timePeriod:timePeriod
      }
// SEND REQUEST FOR MARKET HISTORY 
    sendOnWebsocket(thisMessage,"MARKET-DATA")
    //console.log(thisMessage)
}


function calculateOrderBookWalls (exchPairID) {
  if(signalData[exchPairID] === undefined || signalData[exchPairID].bidWalls === undefined || signalData[exchPairID].askWalls === undefined) {
    return
  }
  let askWallsCalculated = [];
  let bidWallsCalculated = []

  let lastPrice = signalData[exchPairID].lastPrice
  let bidWalls = signalData[exchPairID].bidWalls
  let askWalls = signalData[exchPairID].askWalls

  let baseCurrency = signalData[exchPairID].baseCurrency
  let marketCurrency = signalData[exchPairID].marketCurrency
  let decimalPlaces = signalData[exchPairID].decimalPlaces
  let currencySymbol = signalData[exchPairID].currencySymbol


  /*        let askWalls = askWalls
          let bidWalls = bidWalls
          let displayCurrency = 'MARKET'
          let currencySymbol = currencySymbol
          if(marketStats.mc == 'BTC') currencySymbol = '&#3647; '
          if(marketStats.mc == 'ETH') currencySymbol = '<i class="fab fa-ethereum"></i> '
  */

  // $(".currencySymbol").html(currencySymbol)
//        $(".currencySymbol").html(currencySymbol)
//        $(".displayWallDepth").html(currencySymbol+' Vol')
//        $(".displayBookDepth").html('% Depth')

  //console.log(wallDepth)

  let displayMarketCurrency = '&#3647;'

  let maxQty = -Infinity
  let minQty = Infinity
  let len = bidWalls.length
  for (let y = 0; y < len; y++) {

    if(bidWalls[y] !== undefined && bidWalls[y].R !== undefined) {

      let wallQty = bidWalls[y].Q
      let wallPrice = bidWalls[y].R

      let amnt = parseFloat((parseFloat(lastPrice) - parseFloat(wallPrice)).toFixed(decimalPlaces))
      let spread = Number(parseFloat(amnt) / parseFloat(lastPrice) * 100).toFixed(2)

      let qty = parseFloat(wallQty).toFixed(decimalPlaces)
      let mins = parseFloat(bidWalls[y].mins)
      let avg = parseFloat(bidWalls[y].avg)
      let accumulatedQty = parseFloat(bidWalls[y].accum)
      // DISPLAY THE DELTA TO THE AVG FOR THE CURRENT QTY
      let avgDelta =  0
      if(parseFloat(avg) > 0) {
        avgDelta = parseFloat((((parseFloat(qty) / parseFloat(avg)) * 100) - 100).toFixed(0))
      }
      if(avgDelta > 0) {
        avgDelta = '+'+avgDelta
      }
      if(parseFloat(avg) == 0) {
        avgDelta = '--'
      }
      // DISPLAY THE TIME IN THE ORDER BOOK
      let timeInBook = ''
      // OVER 1 HOUR
      if(mins > 60) {
        let hours = parseInt(mins / 60)
        let minsH = parseInt(mins - (hours * 60))
        timeInBook = hours+'h'+minsH+'m'
        // OVER 1 DAY
        if(mins > (24*60)) {
          //1456
          // 1
          // 16
          let days = parseInt(mins / 60 / 24)
          let hours = 0
          if((parseInt(mins) - parseInt(days*24*60)) > 60) {
            hours = parseInt((parseInt(mins) - parseInt(days * 24 * 60)) / 60)
          }

          let minsH = parseInt(mins - (hours * 60) - (days * 60 * 24))
          timeInBook = days+'d'+hours+'h'+minsH+'m'
        }
      } else {
        // LESS THAN 1 HOUR
        timeInBook = mins+'m'
      }
      let marketCurrencyQty = qty
      // IF BTC MARKET CONVERT QTY INTO BASE CURRENCY TO MAKE SMALLER DISPLAY
      if(baseCurrency == 'BTC') {
        marketCurrencyQty =  parseFloat((parseFloat(qty) * parseFloat(wallPrice)).toFixed(8))
        accumulatedQty =  parseFloat((parseFloat(accumulatedQty) * parseFloat(wallPrice)).toFixed(8))
      }
      // IF USD MARKET CONVERT QTY INTO BTC TO MAKE SMALLER DISPLAY
      if(baseCurrency == 'USD') {
        // IF NOT XBTUSD THEN SET THE VALUE OF VOLUME AS USD AND THEN USE BTC
        if(exchPairID !== BTCPairID && signalData[BTCPairID] !== undefined) {
          marketCurrencyQty =  parseFloat((parseFloat(qty)  / parseFloat(signalData[BTCPairID].lastPrice)).toFixed(8))
          accumulatedQty = parseFloat((parseFloat(accumulatedQty)  / parseFloat(signalData[BTCPairID].lastPrice)).toFixed(8))
        } else {
          marketCurrencyQty =  parseFloat((parseFloat(qty) / parseFloat(wallPrice)).toFixed(8))
          accumulatedQty = parseFloat((parseFloat(accumulatedQty) / parseFloat(wallPrice)).toFixed(8))
        }
      }


      if(marketCurrencyQty > 1) marketCurrencyQty = parseFloat(marketCurrencyQty).toFixed(1)
      if(marketCurrencyQty > 10) marketCurrencyQty = parseFloat(marketCurrencyQty).toFixed(0)
      qty = marketCurrencyQty
      if(qty < 1) qty = parseFloat(parseFloat((qty)).toFixed(3))
      if(qty > 1) qty = parseFloat(parseFloat((qty)).toFixed(1))
      if(qty > 10) qty = parseFloat(parseFloat((qty)).toFixed(0))
      if(qty > maxQty) maxQty = qty
      if(qty < minQty) minQty = qty
      if(accumulatedQty < 1) accumulatedQty = parseFloat(accumulatedQty).toFixed(3)
      if(accumulatedQty > 1) accumulatedQty = parseFloat(accumulatedQty).toFixed(1)
      if(accumulatedQty > 10) accumulatedQty = parseFloat(accumulatedQty).toFixed(0)
        
      //if(bidWallsCalculated.length > 0) console.log(bidWallsCalculated[bidWallsCalculated.length-1].accumulatedQty)    
      if(bidWallsCalculated.length == 0 || (bidWallsCalculated.length > 0 && parseFloat(bidWallsCalculated[bidWallsCalculated.length-1].accumulatedQty) < parseFloat(accumulatedQty))) {
          bidWallsCalculated.push({
            type: "bid-wall",
            currencySymbol,
            wallPrice,
            decimalPlaces,
            spread,
            displayMarketCurrency,
            qty,
            avgDelta,
            accumulatedQty,
            timeInBook
          })
          
      }

    }

  }


  len = askWalls.length
  for (let y = 0; y < len; y++) {

    if(askWalls[y] !== undefined && askWalls[y].R !== undefined) {

      let wallQty = askWalls[y].Q
      let wallPrice = askWalls[y].R

      let amnt = parseFloat((parseFloat(wallPrice) - parseFloat(lastPrice)).toFixed(decimalPlaces))
      let spread = Number(parseFloat(amnt) / parseFloat(lastPrice) * 100).toFixed(2)

      let qty = parseFloat(wallQty).toFixed(decimalPlaces)
      let mins = parseFloat(askWalls[y].mins)
      let avg = parseFloat(askWalls[y].avg)
      let accumulatedQty = parseFloat(askWalls[y].accum)
      // DISPLAY THE DELTA TO THE AVG FOR THE CURRENT QTY
      let avgDelta =  0
      if(parseFloat(avg) > 0) {
        avgDelta = parseFloat((((parseFloat(qty) / parseFloat(avg)) * 100) - 100).toFixed(0))
      }
      if(avgDelta > 0) {
        avgDelta = '+'+avgDelta
      }
      if(parseFloat(avg) == 0) {
        avgDelta = '--'
      }
      let timeInBook = ''
      // OVER 1 HOUR
      if(mins > 60) {
        let hours = parseInt(mins / 60)
        let minsH = parseInt(mins - (hours * 60))
        timeInBook = hours+'h'+minsH+'m'
        // OVER 1 DAY
        if(mins > (24*60)) {
          //1456
          // 1
          // 16
          let days = parseInt(mins / 60 / 24)
          let hours = 0
          if((parseInt(mins) - parseInt(days*24*60)) > 60) {
            hours = parseInt((parseInt(mins) - parseInt(days * 24 * 60)) / 60)
          }

          let minsH = parseInt(mins - (hours * 60) - (days * 60 * 24))
          timeInBook = days+'d'+hours+'h'+minsH+'m'
        }
      } else {
        // LESS THAN 1 HOUR
        timeInBook = mins+'m'
      }

      let marketCurrencyQty = qty
      // IF BTC MARKET CONVERT QTY INTO BASE CURRENCY TO MAKE SMALLER DISPLAY
      if(baseCurrency == 'BTC') {
        marketCurrencyQty =  parseFloat((parseFloat(qty) * parseFloat(wallPrice)).toFixed(8))
        accumulatedQty =  parseFloat((parseFloat(accumulatedQty) * parseFloat(wallPrice)).toFixed(8))
      }
      // IF USD MARKET CONVERT QTY INTO BTC TO MAKE SMALLER DISPLAY
      if(baseCurrency == 'USD') {
        if(exchPairID !== BTCPairID && signalData[BTCPairID] !== undefined) {
          marketCurrencyQty =  parseFloat((parseFloat(qty)  / parseFloat(signalData[BTCPairID].lastPrice)).toFixed(8))
          accumulatedQty = parseFloat((parseFloat(accumulatedQty)   / parseFloat(signalData[BTCPairID].lastPrice)).toFixed(8))
        } else {
          marketCurrencyQty =  parseFloat((parseFloat(qty) / parseFloat(wallPrice)).toFixed(8))
          accumulatedQty = parseFloat((parseFloat(accumulatedQty) / parseFloat(signalData[BTCPairID].lastPrice)).toFixed(8))
        }
      }
      
      if(marketCurrencyQty > 1) marketCurrencyQty = parseFloat(marketCurrencyQty).toFixed(1)
      if(marketCurrencyQty > 10) marketCurrencyQty = parseFloat(marketCurrencyQty).toFixed(0)
      qty = marketCurrencyQty
      if(qty < 1) qty = parseFloat(parseFloat((qty)).toFixed(3))
      if(qty > 1) qty = parseFloat(qty).toFixed(1)
      if(qty > 10) qty = parseFloat(qty).toFixed(0)
      if(qty > maxQty) maxQty = qty
      if(qty < minQty) minQty = qty      
      if(accumulatedQty < 1) accumulatedQty = parseFloat(accumulatedQty).toFixed(3)
      if(accumulatedQty > 1) accumulatedQty = parseFloat(accumulatedQty).toFixed(1)
      if(accumulatedQty > 10) accumulatedQty = parseFloat(accumulatedQty).toFixed(0)

      askWallsCalculated.push({
        type: "ask-wall",
        currencySymbol,
        wallPrice,
        decimalPlaces,
        spread,
        displayMarketCurrency,
        qty,
        avgDelta,
        accumulatedQty,
        timeInBook
      });
    }

  }
  return {askWalls: askWallsCalculated, bidWalls: bidWallsCalculated};
}

function displayOrderBookWalls(exchPairID,displayArea) {
  let calculatedWalls = calculateOrderBookWalls(exchPairID);
    
    if(calculatedWalls === undefined) {
        return
    }
  let max = 0
  let min = 0
  let avg = 0
  let stdDev = 0  
  let areaWidth = $(".orderBookStats .orderBooks").innerWidth()
  //console.log(areaWidth)
  if(calculatedWalls.bidWalls.length > 0) {
    // DATA EXSISTS SO WE WILL CLEAR EXISTING AND PUT IN NEW
    $(displayArea+" .bidWalls").html('')
      // CHECK IF FULL WALLS DISPLAY 
      if(displayArea.indexOf('marketGraphDetails') == -1) {
        // ONLY DISPLAY THE FIRST 5 WALLS
          calculatedWalls.bidWalls = calculatedWalls.bidWalls.slice(0,5)          
      }
      let minMaxAvgBid = getAvgMinMaxValue(calculatedWalls.bidWalls,"qty")
      max = minMaxAvgBid.max
   //   min = minMaxAvgBid.min
      avg = minMaxAvgBid.avg
   //   stdDev = minMaxAvgBid.stdDev
      let minMaxAvgAsk = getAvgMinMaxValue(calculatedWalls.askWalls,"qty")
      if(max < minMaxAvgAsk.max) max = minMaxAvgAsk.max
   //   if(min > minMaxAvgAsk.min) min = minMaxAvgAsk.min
      if(avg > minMaxAvgAsk.avg) avg = minMaxAvgAsk.avg
    //  if(stdDev > minMaxAvgAsk.stdDev) stdDev = minMaxAvgAsk.stdDev      
      if(max > (3*avg)) max = ((3*avg)  - ((3*avg) % 10))
      //console.log(max,stdDev,avg)
  }
  let bidHTML =''
  for (let i = 0; i < calculatedWalls.bidWalls.length; i++) {
    let bidWall = calculatedWalls.bidWalls[i]
    let currencySymbol = bidWall.currencySymbol;
    let wallPrice = bidWall.wallPrice;
    let decimalPlaces = bidWall.decimalPlaces;
    let spread = bidWall.spread;
    let displayMarketCurrency = bidWall.displayMarketCurrency;
    let qty = bidWall.qty;
    let avgDelta = bidWall.avgDelta;
    let accumulatedQty = bidWall.accumulatedQty;
    let timeInBook = bidWall.timeInBook;
    let width = parseInt(areaWidth * (bidWall.qty/max)) 
    if(width > areaWidth) width = areaWidth
    bidHTML += "<div class='wallRow'><div class='wall'><div class='wallInfo' style='width:"+width+"px'><div><span class='price'>"+currencySymbol+(wallPrice).toFixed(decimalPlaces)+"</span><div class='wallSpreadCont'><span class='wallSpread'>-"+spread+"%</span></div><span class='accumulatedQty' >"+displayMarketCurrency+numberWithCommas(accumulatedQty)+"</span> <span class='timeInBook' >"+timeInBook+"</span><span class='avgDelta'>"+avgDelta+"%</span><span class='qty'>"+displayMarketCurrency+numberWithCommas(qty)+"</span></div> </div></div></div>"
    // .appendTo(displayArea+" .bidWalls")
      if(i == calculatedWalls.bidWalls.length-1) {
         $(displayArea+" .bidWalls").html(bidHTML)
      }
  }
    
    

  if(calculatedWalls.askWalls.length > 0) {
    // DATA EXSISTS SO WE WILL CLEAR EXISTING AND PUT IN NEW
    $(displayArea+" .askWalls").html('')
      // CHECK IF FULL WALLS DISPLAY 
      if(displayArea.indexOf('marketGraphDetails') == -1) {
        // ONLY DISPLAY THE FIRST 5 WALLS
          calculatedWalls.askWalls = calculatedWalls.askWalls.slice(0,5)
      }
      
  }
  let askHTML =''
  for (let i = 0; i < calculatedWalls.askWalls.length; i++) {
    let askWall = calculatedWalls.askWalls[i]
    let currencySymbol = askWall.currencySymbol;
    let wallPrice = askWall.wallPrice;
    let decimalPlaces = askWall.decimalPlaces;
    let spread = askWall.spread;
    let displayMarketCurrency = askWall.displayMarketCurrency;
    let qty = askWall.qty;
    let avgDelta = askWall.avgDelta;
    let accumulatedQty = askWall.accumulatedQty;
    let timeInBook = askWall.timeInBook;
    let width = parseInt(areaWidth * (askWall.qty/max))     
   if(width > areaWidth) width = areaWidth
    askHTML = "<div class='wallRow'><div class='wall'><div class='wallInfo' style='width:"+width+"px'><div><span class='price'>"+currencySymbol+(wallPrice).toFixed(decimalPlaces)+"</span><div class='wallSpreadCont'><span class='wallSpread'>+"+spread+"%</span></div><span class='accumulatedQty' >"+displayMarketCurrency+numberWithCommas(accumulatedQty)+"</span> <span class='timeInBook' >"+timeInBook+"</span><span class='avgDelta'>"+avgDelta+"%</span><span class='qty' >"+displayMarketCurrency+numberWithCommas(qty)+"</span></div> </div></div></div>" + askHTML
      if(i == calculatedWalls.askWalls.length-1) {
         $(displayArea+" .askWalls").html(askHTML)
      }
  }
    
    // 910 - 350 = 560
    
    //console.log('askHTML')
  //$(displayArea+" .askWalls").html(askHTML)
  /*
          $('#exchPairID'+exchPairID+' .wallRow').each(function(i, obj) {



              let qtyVal = $(this).find(".wallInfo .qty").html()
              qtyVal = qtyVal.replace(/\D/g,'')
              let width = parseInt(100 - parseInt(((parseFloat(maxQty) - parseFloat(qtyVal)) / parseFloat(maxQty)) * 100))
              width += parseInt(width/100*25)

             // width = width + '%'
             // console.log(width,maxQty,qtyVal)
            //  if(width > 50)
               width = 50
               //$(this).find(".wallInfo").width(width+'%')
               $(this).find(".qty").width(width+'px')

               //$(obj2).width((width)+'%')

          })
    */
}

function getAvgMinMaxValue(data,keyName) {
    // IF NO DATA THEN RETURN AS ZERO
    if(!data.length) {
        return {
                min:0,
                max:0
            }
    }
    let min = Infinity
    let max = -Infinity
    let len = data.length;
    let avg = 0
    let stdDev = 0
   // console.log(data)
    for (let i = 0; i < len; i++) { 
            if(typeof keyName == 'string' && keyName != '') {
                if(data[i][keyName] > max) max = parseFloat(data[i][keyName])
                if(parseFloat(data[i][keyName]) < min) min = parseFloat(data[i][keyName])
                avg += parseFloat(data[i][keyName])
                let diff = (avg/(i+1)) - parseFloat(data[i][keyName])
                if(diff < 0) diff = 0
                stdDev += diff
            } else {
                if(data[i] < min) min = parseFloat(data[i])
                if(data[i] > max) max = parseFloat(data[i])
                avg += parseFloat(data[i])
                let diff = (avg/(i+1)) - parseFloat(data[i])
                if(diff < 0) diff = 0
                stdDev += diff
            }  
        if(i == len-1) {
            return {
                avg:(avg/len),
                stdDev:(stdDev/len),
                min:min,
                max:max
            }
        }
    }
    

}

function requestMarketsList() {
        // REQUEST MARKETS LIST
    let thisMessage = JSON.stringify({requestMarketsList:true})
	wsSendMarket(thisMessage)
}
function processMarketList(data) {
    let len = data.data.length;
 //   console.log('MARKETS LIST',data.data,len)
    for (let y = 0; y < len; y++) {
          let lenM = marketsList.length;
          if(lenM == 0) marketsList.push(data.data[y])
          for (let i = 0; i < lenM; i++) {

              if(marketsList[i].exchPairID == data.data[y].exchPairID) {
                  i = lenM+1
              }
              // FINISHED AND COULD NOT FIND SO ADD
              if(i == lenM-1){
                  marketsList.push(data.data[y])
              }
          }
        if(y == len-1) {
            // FINISHED LOOP OF MARKETS DATA
        }
    }
}
function getMarketInfo(exchPairID) {

    let len = marketsList.length;
    for (let y = 0; y < len; y++) {

        if(marketsList[y].exchPairID == exchPairID) {
            return marketsList[y]
        }
        if(y == len - 1) {
            return {}
        }
    }
}
// end of MARKETS FUNCTIONS
//////////////////////////////////    


/// SEND REQUEST DATA ON START OF WEBSOCKET
let requestCounter = 0
function requestAtStart(instanceID,webSocketID) {
setTimeout( function(exchSymbol) {
    if(exchSymbol == '') {
            requestCounter++
            if(requestCounter < 30) {
            // TRY AGAIN IN 1 SECOND
                retryRequestAtStart(instanceID,webSocketID)
                console.log('LOOPING ('+instanceID+') ->'+requestCounter)
            } else {
                console.log('FAILED! TO REQUEST INSTANCE ('+instanceID+') STREAM ->'+requestCounter)
            }
        } else {

        let thisMessage = JSON.stringify({
            requestInstanceStream:true,
            instanceID:instanceID
            })
            sendOnWebsocket(thisMessage,webSocketID)
            console.log('SENT REQUEST AT START',thisMessage)
        }
    },100)
}

function retryRequestAtStart(instanceID,webSocketID) {
  setTimeout( function(exchSymbol) {
      requestAtStart(instanceID,webSocketID)
  },1000)
}
///////////////////////////////////////////


function formatNumber(numbVal,decPlaces) {

if(decPlaces==1){divBy='10'};
if(decPlaces==2){divBy='100'};
if(decPlaces==3){divBy='1000'};
if(decPlaces==4){divBy='10000'};
if(decPlaces==5){divBy='100000'};
if(decPlaces==6){divBy='1000000'};
if(decPlaces==7){divBy='10000000'};
if(decPlaces==8){divBy='100000000'};


    return parseFloat(Math.round(numbVal * divBy) / divBy).toFixed(decPlaces);

}
function normaliseNumber(val, max, min) {
   return (val - min) / (max - min)
}


function changeColourOfNumber(className) {
    if(document.getElementsByClassName(className) === null) return
    let divCont = document.getElementsByClassName(className)
    //console.log(divCont)
    for(let i = 0, l = divCont.length; i < l; i++){
        let val = divCont[i].innerText.replace(/[^0-9.-]/g, '')
        if(val == 'Yes') {
            if(divCont[i].className !== undefined  &&  ((divCont[i].className.indexOf('macdV') > -1 && divCont[i].className.indexOf('macdVs') == -1) || divCont[i].className.indexOf('macdSV') > -1 || divCont[i].className.indexOf('vExpl') > -1 || divCont[i].className.indexOf('vSpike') > -1)) {
                val = $(".volumeScore").html().replace(/[^0-9.-]/g, '')
               // console.log(val)
            }
        }
        if(divCont[i].className.indexOf('orderBookScoreAvg') > -1) {            
        //    console.log(val,divCont[i].className)
        }
        if(isNaN(val) !== true) {
            if(val >= 0) {
                divCont[i].style.backgroundColor = '#2BA84A';
            }   else {
                divCont[i].style.backgroundColor = '#ED5565';
            }
        }   else {

            if(val == 'BUY' || val == 'SELL'|| val == 'HOLD' || val == 'RESTART') {
                divCont[i].style.color = '#FFF';
                if(val == 'BUY')  {
                    divCont[i].style.backgroundColor = '#2BA84A';
                }
                if(val == 'SELL') {
                    divCont[i].style.backgroundColor = '#ED5565';
                }
                if(val == 'HOLD' || val == 'RESTART') {
                    divCont[i].style.color = '#000';
                    divCont[i].style.backgroundColor = '#FFB935';
                }
            } else {
                divCont[i].style.backgroundColor = '';
            }


        }
    }
}
function populateTimePeriods() {
    let timePeriod = $("#timePeriod").val()
    if(!timePeriod || timePeriod == '') timePeriod = '1h'
    let lenO = config.timePeriods.length
   // console.log(lenO)
    let insertData = ''
    for (let y = 0; y < lenO; y++) {
        let slcted = ''
    //     
        if(timePeriod == config.timePeriods[y].display) {
            slcted = ' selected '
        }
        insertData += '<option '+slcted+' value="'+config.timePeriods[y].display+'">Last '+config.timePeriods[y].display+'</option>'
    }
    
// ADDITIONAL TIME PERIODS OUTSIDE OF NORMAL SCOPE    
    let lenT = config.addTimePeriods.length    
    for (let y = 0; y < lenT; y++) {
        let slcted = ''
    //     
        if(timePeriod == config.addTimePeriods[y].display) {
            slcted = ' selected '
        }
        insertData += '<option '+slcted+' value="'+config.addTimePeriods[y].display+'">Last '+config.addTimePeriods[y].display+'</option>'     
    }    
    $("#timePeriod").html(insertData)
    

}  


function updateBars() {

  let exchPairID = $('#marketExchPairID').val() 
    
  if(signalData[exchPairID] === undefined || signalData[exchPairID].orderBookLevels === undefined) return;
   // console.log($('.marketArea .score').text().replace(/[^0-9.-]/g, ''))
  displayBars(exchPairID,'scoreBar',signalData[exchPairID].score,100,'%',100,"<img src='/images/star_13.png' />");
  displayBars(exchPairID,'volumeScoreBar',(signalData[exchPairID].volumeScore),100,'%',100,"<img src='/images/volume_21.png' />");
  displayBars(exchPairID,'indicatorScoreBar',(signalData[exchPairID].indicatorScore),100,'%',100,"<img src='/images/trend_21.png'  />");
  displayBars(exchPairID,'volatilityScoreBar',(signalData[exchPairID].volatilityScore),3,'px',3,"<img src='/images/flame_15w.png'  />");
  displayBars(exchPairID,'orderBookScoreBar',(signalData[exchPairID].orderBookScore),100,'%',100,"<img src='/images/orderbooks_21.png'  />");
    
  //console.log('volumeScores',(signalData[exchPairID].volumeScores.T15s*100))
  displayBars(exchPairID,'orderBookScoreBar05',(signalData[exchPairID].orderBookLevels["0.5"].val),100,'%',100,"<img src='/images/orderbooks_21.png'  />");
  displayBars(exchPairID,'orderBookScoreBar1',(signalData[exchPairID].orderBookLevels["1"].val),100,'%',100,"<img src='/images/orderbooks_21.png'  />");   
  displayBars(exchPairID,'orderBookScoreBar2',(signalData[exchPairID].orderBookLevels["2"].val),100,'%',100,"<img src='/images/orderbooks_21.png'  />");       
  displayBars(exchPairID,'orderBookScoreBar5',(signalData[exchPairID].orderBookLevels["5"].val),100,'%',100,"<img src='/images/orderbooks_21.png'  />");   
  displayBars(exchPairID,'orderBookScoreBar10',(signalData[exchPairID].orderBookLevels["10"].val),100,'%',100,"<img src='/images/orderbooks_21.png'  />"); 
}

function readMoreOrderBooksInfo() {
         
    if($('.orderBooksInfo .readMore:visible').length)
        $('.orderBooksInfo .readMore').hide();
    else
        $('.orderBooksInfo .readMore').show();        
    
}
    
function displayBars(exchPairID,keyName,value,maxValue,pxPcnt,minArrow,imgSrc) {

/*// ONLY SHOW VOLATILITY WHEN IS POSITIVE VALUE     
if(keyName == 'volatilityScoreBar') {
  if(parseFloat(value) < 0) {
      value = 0      
  } else {
// IF THE VOLATILITY IS HIGHER THAN ZERO THEN SHOW IN THE DIRECTION OF VOLUME SCORE TO ENSURE IS GRAPHICALLY CORRECT DIRECTION
      if(parseFloat(signalData[exchPairID].volumeScore) < 0) {          
        value = 0 - value
      }
  }    
}    */
  
  let previousVal = $('.marketBars .'+keyName+'').data('text');    
  $('.marketBars .'+keyName).data('text', value);
  //if(keyName == 'volumeScoreBar') console.log('previousVal',previousVal,'value',value);    
    
  let arrowHtml = '' //'<i class="fas fa-arrow-alt-circle-up fa-sm"></i>'  
  var buyColor = '#2BA84A';
 // if(keyName == 'volatilityScoreBar') $('.volatilityScoreBar .columnBuy').css({background: '#d58a20'});
  let buyPercent = 0
  if(value > 0) buyPercent = value    
  //$('.columnBuy').css({background: buyColor});
  let buyHtml = imgSrc + '&nbsp;'    
  if(buyPercent > minArrow) buyHtml = arrowHtml
  for (let y = 0; y < parseInt(buyPercent/100); y++) {            
        buyHtml =  arrowHtml + buyHtml 
  }
  if(buyPercent > maxValue) buyPercent = maxValue   
    
  $('.'+keyName+' .columnBuy').show().stop(true).animate({
    height: parseInt(buyPercent)+pxPcnt,
  }); // .html(buyHtml)
  if(parseFloat(buyPercent) == 0) {
        $('.'+keyName+' .columnBuy').hide();
  }
  if(previousVal < value) {
      $('.'+keyName+' .columnBuy i').show();
  } else {
      $('.'+keyName+' .columnBuy i').hide();
  }
      
    
  var colorSell = '#ED5565';
//  if(keyName == 'volatilityScoreBar') $('.volatilityScoreBar .columnSell').css({background: '#d58a20'}); 
  let sellPercent = 0
  if(value < 0) sellPercent = 0-value
 // $('.columnSell').css({background: colorSell});
  let sellHtml = imgSrc+ '&nbsp;'    
  if(sellPercent > minArrow) sellHtml = +arrowHtml
  for (let y = 0; y < parseInt(sellPercent/100); y++) {            
        sellHtml =  arrowHtml + sellHtml
  }    
  if(sellPercent > maxValue) sellPercent = maxValue
  $('.'+keyName+' .columnSell').show().stop(true).animate({
    height: parseInt(sellPercent)+pxPcnt,
  });  // .html(sellHtml)
  if(parseFloat(sellPercent) == 0) {
        $('.'+keyName+' .columnSell').hide();
  }
  if(previousVal > value) {
      $('.'+keyName+' .columnSell i').show();
  } else {
      $('.'+keyName+' .columnSell i').hide();
  }    
    
}   

function showArea (areaName,btnKey) {
    
    $('#showArea').val(areaName);
    $('#showAreaBtnKey').val(btnKey);
    if(areaName == '') {
        areaName = 'marketHistory'
        btnKey = 'marketDataBtn'
    }
    $('.marketGraphDetails .detailCont').hide();
    $('.marketGraphDetailsHeader .tab').css({'background-color': 'rgba(34, 95, 97,0.3)'});
    //$('.marketGraphDetailsHeader .tab').css({'background-color': '#0A4E50'});
    $('.marketGraphDetailsHeader .'+btnKey).css({'background-color': '#225F61'});
    $('.marketGraphDetails .'+areaName).show();
    if(areaName == 'algorithm') {        
        displayOptions()
        displayChoice(areaName)
    }
}

