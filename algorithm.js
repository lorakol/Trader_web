




function displayOptions() {
    
    let addOrders = $('#addOrders').val()    
// HIDE ALL     
    $('.addOrdersPercentage').hide()
    $('.addOrdersPips').hide()
    $('.addOrdersATR').hide()        
// SHOW IF ENABLED     
    if(addOrders == 'percentage') {
        $('.addOrdersPercentage').show()
    }
    if(addOrders == 'pips') {
        $('.addOrdersPips').show()
    }    
    if(addOrders == 'ATR') {
        $('.addOrdersATR').show() 
    }
    
    let takeProfit = $('#takeProfit').val()    
// HIDE ALL     
    $('.takeProfitPercentage').hide()
    $('.takeProfitPips').hide()
    $('.takeProfitATR').hide()        
// SHOW IF ENABLED     
    if(takeProfit == 'percentage') {
        $('.takeProfitPercentage').show()
    }
    if(takeProfit == 'pips') {
        $('.takeProfitPips').show()
    }    
    if(takeProfit == 'ATR') {
        $('.takeProfitATR').show() 
    }
        
    let stopLoss = $('#stopLoss').val()
// HIDE ALL 
    $('.stopLossPercentage').hide()
    $('#stopLossMultiplier').hide()
    $('#stopLossTimePeriod').hide()
// SHOW IF ENABLED 
    if(stopLoss == 'percentage') {
        $('.stopLossPercentage').show()
    }
    if(takeProfit == 'pips') {
        $('.stopLossPips').show()
    }        
    if(stopLoss == 'ATR') {
        $('.stopLossATR').show()
    }    
    
}


function displayChoice(area) {    
    let condition = $('#'+area+'Condition').val();    
    $('.'+area+'Conditions .choice').hide();    
    if(condition != '') {
       // console.log('.'+area+'Conditions .'+condition)
        $('.'+area+'Conditions .'+condition).show();        
    }
}


function addCondition(area) {
    let condition = $('.'+area+'Conditions .'+area+'Condition').val()
    let conditionType = condition
    let orderType = $('.'+area+'Conditions .'+area+'OrderType').val() 
    let mathCondition = $('.'+area+'Conditions .'+area+'MathCondition').val() 
    let mathConditionValue = $('.'+area+'Conditions .'+area+'MathValue').val() 
    let mathConditionValue2 = $('.'+area+'Conditions .'+area+'MathValue2').val() 
    let conditionChoice = $('.'+area+'Conditions #'+condition).val()
    let conditionText = $('.'+area+'Conditions #'+condition+' option:selected').text()    
    console.log('ADD CONDITION',area,conditionType,condition,mathCondition,mathConditionValue,mathConditionValue2,conditionChoice,conditionText)
    let addCondition = ''
    if(conditionChoice == '') {
        alert('Please choose -> '+condition+' Condition or choose a different Entry Condition.')
      return;      
    } 
    if(condition == 'Crossovers' || condition == 'Indicator') {        
        if(condition == 'Crossovers') {        
            let CrossoversA = $('.'+area+'Conditions .CrossoversA').val()
            let CrossoversB = $('.'+area+'Conditions .CrossoversB').val()
            if(CrossoversA == '' || CrossoversB == '') return;
            conditionChoice = CrossoversA +' crosses ' + CrossoversB
            addCondition = condition+'.'+CrossoversA +'.crosses.' + CrossoversB
        }
        if(condition == 'Indicator') {        
            let timePeriod = $('.'+area+'Conditions #indicatorTimePeriod').val()
            conditionChoice = 'ohlcv.'+timePeriod+'.'+conditionChoice
            addCondition = condition+'.'+conditionChoice
            conditionText = conditionText + ' ' + $('.'+area+'Conditions #indicatorTimePeriod option:selected').text()
        }
        
       // console.log(area,conditionChoice)
    }   else {
        addCondition = orderType+'.'+condition+'.'+conditionChoice+'.'+mathCondition+':'+mathConditionValue+':'+mathConditionValue2
    } 

    if(mathCondition == "><") {
        mathCondition =   "between"        
        mathConditionValue = mathConditionValue + " and " +mathConditionValue2
    }
    if(mathCondition == "<>") {
        mathCondition =   "above/below &plusmn;"
    }
    if(mathCondition == ">") {
        mathCondition =   "&gt;"
    }
    if(mathCondition == "<") {
        mathCondition =   "&lt;"
    }
    
    
    
    let addChoice = ('<div data-text="'+addCondition+'" class="condition">'+orderType+' '+conditionText+' '+mathCondition+' '+mathConditionValue+' <img src="/images/close12.png" /></div>') // condition+' '+conditionChoice
    if($('#'+area).html().indexOf(addChoice) == -1 || $('#'+area).html().length == 0) {        
        $('#'+area).html($('#'+area).html()+addChoice)
    }
// ADD TO ARRAY IF NOT EXIST ALREADY     
    if(algorithm[area+'Conditions'].indexOf(addCondition) == -1) algorithm[area+'Conditions'].push(addCondition)
    console.log(area+'Conditions',algorithm[area+'Conditions'])
   // console.log(area,addChoice)
}

function adjustMathConditions(area) {    
    
    console.log(area,$('.'+area+'Conditions .'+area+'MathCondition').val())
    
    $('.'+area+'Conditions .'+area+'MathValue').show();
    $('.'+area+'Conditions .'+area+'MathValue2').show();
    $('.'+area+'Conditions .'+area+'MathValue2txt').show()        
    
    if($('.'+area+'Conditions .'+area+'MathCondition').val() != '><') {        
        $('.'+area+'Conditions .'+area+'MathValue2').hide();
        $('.'+area+'Conditions .'+area+'MathValue2txt').hide()          
    }
// IF ABOVE BELOW ZERO THEN HIDE MATH VALUE    
    if($('.'+area+'Conditions .'+area+'MathCondition').val() == "><") { 
        $('.'+area+'Conditions .'+area+'MathValue').val(-5);
        $('.'+area+'Conditions .'+area+'MathValue2').val(5);
    }
}

function checkConditions(conditions,data) {
    
    let policy = 0
    let counter = 0    
    let buyPolicy = 0 
    let buyCounter = 0 
    let sellPolicy = 0 
    let sellCounter = 0    
    let lenI = conditions.length
    for (let i = 0; i < lenI; i++) {
            
        
            let condition = conditions[i]
            //console.log('condition',condition)                      
            
            // CHECK ORDERBOOKS    
                let mathCondition = condition.split('.')[condition.split('.').length-1]  
                let conditionType = condition.split('.')[1]
                let orderType = condition.split('.')[0]
                let dataPoint = condition.replace('.'+conditionType+'.','').replace('.'+mathCondition,'').replace('BUY/SELL','').replace('BUY','').replace('SELL','')
                
                let mathValue = parseFloat(mathCondition.split(':')[1])
                let mathValue2 = parseFloat(mathCondition.split(':')[2])
                mathCondition = mathCondition.replace(':'+mathValue,'').replace(':'+mathValue2,'')
        
                
            // REMOVE MATH CONDITION FOR DATAPOINT LOOKUP                
                if(!mathCondition) mathCondition = 0 // ABOVE/BELOW ZERO

/*                if(mathCondition.indexOf('<') > -1|| mathCondition.indexOf('>') > -1) {                    
                // BETWEEN
                    if(mathCondition.indexOf('><') > -1) {                        
                        mathCondition = '><'
                    }
                // GREATER THAN    
                    if(mathCondition.indexOf('<>') == -1 && mathCondition.indexOf('>') > -1) {
                        mathCondition = '>'
                    }
                // LESS THAN    
                    if(mathCondition.indexOf('<>') == -1 && mathCondition.indexOf('<') > -1) {
                        mathCondition = '<'
                    }
                }*/

        
                
        
        /*
            // CHECK BASELINE    
                if(condition.indexOf('Baseline.') > -1 && getGraphDataPoint(data,dataPoint.replace('Baseline.','')) !== undefined) {            
                    if(parseFloat(getGraphDataPoint(data,dataPoint.replace('Baseline.',''))) < parseFloat(data.lastPrice)) {
                        policy++            
                    } else {
                        policy--
                    }
                    counter++
                }
            // CHECK CROSSOVER
                if(condition.indexOf('Crossovers.') > -1 && getGraphDataPoint(data,dataPoint.replace('Crossovers.','')) !== undefined) {            
                    let crossOverCondition = dataPoint.replace('Crossovers.','')
                    let crossOverA = split(crossOverCondition,'.crosses.')[0]
                    let crossOverB = split(crossOverCondition,'.crosses.')[1]
                    if(parseFloat(getGraphDataPoint(data,crossOverA)) > parseFloat(getGraphDataPoint(data,crossOverB))) {
                        policy++            
                    } else {
                        policy--
                    }
                    counter++
                }     */   
        
                let = conditionTypes = ['Trend','Volume','Volatility','Score','Orderbooks','Indicator']
                let lenCT = conditionTypes.length

                for (let c = 0; c < lenCT; c++) {
                    let conditionType = conditionTypes[c]
                        if(condition.indexOf(conditionType+'.') > -1  && getGraphDataPoint(data,dataPoint.replace(conditionType+'.','')) !== undefined) {           
                            
                            if(orderType.indexOf('BUY') > -1) buyCounter++            
                            if(orderType.indexOf('SELL') > -1) sellCounter++   
                            
                            let value = parseFloat(getGraphDataPoint(data,dataPoint.replace(conditionType+'.','')))

                        // GREATER THAN    
                            if(mathCondition == '>') {                        
                                if(value > mathValue) {
                                    if(orderType.indexOf('BUY') > -1) buyPolicy++            
                                    if(orderType.indexOf('SELL') > -1) sellPolicy++                
                                } 
                            }
                        // LESS THAN     
                            if(mathCondition == '<') {                        
                                if(value < mathValue) {
                                    if(orderType.indexOf('BUY') > -1) buyPolicy++            
                                    if(orderType.indexOf('SELL') > -1) sellPolicy++      
                                }
                            }
                            
                        // BETWEEN    
                            if(mathCondition == '><') {                                                        
                                if(value >= mathValue && value <= mathValue2) {
                                    if(orderType.indexOf('BUY') > -1) buyPolicy++            
                                    if(orderType.indexOf('SELL') > -1) sellPolicy++            
                                }                                 
                            }  
                            counter++
                        }                    
                }
        
            if(i == lenI-1) {
                
            //    console.log(buyCounter,buyPolicy,sellCounter,sellPolicy)
                
               // console.log(buyCounter,buyPolicy,sellCounter,sellPolicy)
            // CHECK POLICY FOR BUY / SELL 
                if(buyCounter && buyCounter == buyPolicy) {
                        return  'BUY'                
                }
                if(sellCounter && sellCounter == sellPolicy) {
                        return 'SELL'
                }                 
                return 'HOLD'            
            }

        }

         
    
}


// DEFINE OBJECTS
let savedAlgorithms = []
let algorithm = {
    entryConditions:[],
    exitConditions:[]
}


function calculateAlgorithm() {     
    
    let exchPairID = $('#marketExchPairID').val()  
    let algorithmName = $('#algorithmName').val()  
    if(!algorithmName) algorithmName = 'New Algorithm'
    let now =  Math.floor(new Date())
// CHECK WE HAVE THE DATA READY     
    let data = signalDataHistory[exchPairID]
    if(data === undefined || !data.length) return;
    
    //console.log(data)
    
// SET MARKET DATA FOR CALCULATIONS AND DISPLAY    
    let decimalPlaces = signalData[exchPairID].decimalPlaces
    let currencySymbol = signalData[exchPairID].currencySymbol 
    let pipAmount = signalData[exchPairID].pipAmount
    if(currencySymbol != '$') currencySymbol = '' // currencySymbol + '&nbsp;'    
    
   // console.log(algorithm)
        
    let entryConditions = algorithm.entryConditions    
    let exitConditions = algorithm.exitConditions
    
    let orderMethodEntry = $('input[name=orderMethodEntry]:checked').val() 
    let orderMethodExit = $('input[name=orderMethodExit]:checked').val()      
    
    //console.log('orderMethodEntry',orderMethodEntry,'orderMethodExit',orderMethodExit)
    
    // RESET BACKTEST
    algorithm.algorithmName = algorithmName
    algorithm.created = now
    algorithm.current = []
    algorithm.pendingLimit = []
    algorithm.history = []
    algorithm.gross = 0
    algorithm.grossPercent = 0
    algorithm.pnl = 0
    algorithm.pnlPercent = 0
    algorithm.fees = 0
    algorithm.feesPercent = 0
    algorithm.trades = 0
    algorithm.successTrades = 0
    algorithm.stopLossTrades = 0
    algorithm.accuracy = 0
    algorithm.maxPnL = 0
    algorithm.avgPnL = 0
    algorithm.maxDrawdown = 0
    algorithm.avgDrawdown = 0
    algorithm.orderMethodEntry = orderMethodEntry
    algorithm.orderMethodExit = orderMethodExit
    algorithm.pipAmount = pipAmount
    algorithm.decimalPlaces = decimalPlaces
// SAVE EXCHANGE FEES
    let marketInfo = getMarketInfo(exchPairID)
    algorithm.makerFee = parseFloat(marketInfo.makerFee)
    algorithm.takerFee = parseFloat(marketInfo.takerFee)

    
    
// UPDATE ALGORITHM SETTINGS        
    algorithm.orderAmount = $('#orderAmount').val()
    if(!algorithm.orderAmount) algorithm.orderAmount = 100
    algorithm.useLeverage = $('#useLeverage').val()
    algorithm.takeProfit = $('#takeProfit').val()
    algorithm.maxOpenOrders = $('#maxOpenOrders').val()
    algorithm.openOrderPips = $('#openOrderPips').val()
    if(!algorithm.openOrderPips) algorithm.openOrderPips = 1
    algorithm.takeProfitPercentage = parseFloat($('#takeProfitPercentage').val())
    algorithm.takeProfitPips = parseFloat($('#takeProfitPips').val())
    algorithm.takeProfitMultiplier = parseFloat($('#takeProfitMultiplier').val())
    algorithm.takeProfitTimePeriod = $('#takeProfitTimePeriod').val()
    algorithm.takeProfitTrailing = $('#trailingTakeProfit').is(':checked')    
    algorithm.stopLoss = $('#stopLoss').val()
    algorithm.stopLossPercentage = parseFloat($('#stopLossPercentage').val())
    algorithm.stopLossPips = parseFloat($('#stopLossPips').val())
    algorithm.stopLossMultiplier = parseFloat($('#stopLossMultiplier').val())
    algorithm.stopLossTimePeriod = $('#stopLossTimePeriod').val()
    algorithm.stopLossTrailing = $('#trailingStopLoss').is(':checked')
    algorithm.useLeverage = $('#useLeverage').val()
    algorithm.addOrders = $('#addOrders').val()
    algorithm.addOrdersPercentage = parseFloat($('#addOrdersPercentage').val())
    algorithm.addOrdersPips = parseFloat($('#addOrdersPips').val())
    algorithm.addOrdersMultiplier = parseFloat($('#addOrdersMultiplier').val())
    algorithm.addOrdersTimePeriod = $('#addOrdersTimePeriod').val()
    
    if(entryConditions.length > 0 && (exitConditions.length > 0 || algorithm.takeProfit != '')) {   
        let len = data.length
        for (let y = 0; y < len; y++) {
            
        // GET ENTRY POLICY    
            let entryPolicy = checkConditions(entryConditions,data[y])
        // GET EXIT POLICY    
            let exitPolicy = checkConditions(exitConditions,data[y])        
        // console.log(entryPolicy,exitPolicy)
        

        // CHECK PENDING EXIT LIMIT ORDERS    
            checkPendingExitLimitOrders(data[y],exitPolicy)
        // CHECK PENDING ENTRY LIMIT ORDERS    
            checkPendingEntryLimitOrders(data[y],algorithm.openOrderPips,entryPolicy)
            
        // ADD NEW ENTRY LIMIT ORDERS SET TO OPEN ORDER PIPS    
            if(entryPolicy != 'HOLD'  && algorithm.maxOpenOrders > algorithm.current.length) {                   
        
        // PLACE ANY MARKET ORDERS                         
                if(orderMethodEntry == 'market') {
                // CREATE NEW TRANSACTION    
                    let orderData = {
                        orderType:entryPolicy,                                            
                        orderAmount:algorithm.orderAmount,
                    }
                    if(entryPolicy == 'BUY') orderData.price = parseFloat(data[y].askPrice)
                    if(entryPolicy == 'SELL') orderData.price = parseFloat(data[y].bidPrice)         
                    let transaction = newTransaction(data,orderData)
                // SAVE NEW ORDER TO THE CURRENT ORDERS    
                    algorithm.current.push(transaction)
                    
                }
                
        // PLACE ANY LIMIT ORDERS         
                if(orderMethodEntry == 'limit') {
                // JUST ADD ONE ORDER IN PLACE AS NO ADDITIONAL ORDERS SPECIFIED     
                    if(!algorithm.addOrders) {
                        let limitPrice = 0
                        if(entryPolicy == 'BUY') limitPrice = (parseFloat(data[y].askPrice) - (parseFloat(algorithm.pipAmount)))
                        if(entryPolicy == 'SELL') limitPrice = (parseFloat(data[y].bidPrice) + (parseFloat(algorithm.pipAmount)))                    
                        // ADD PENDING LIMIT BID ORDER 
                            let pendingLimitOrder = {
                                T:data[y].T,
                                price:limitPrice,
                                currentBidPrice:data[y].bidPrice,
                                currentAskPrice:data[y].askPrice,
                                orderAmount:algorithm.orderAmount,
                                orderType:entryPolicy,
                                entry:true,
                                data:data[y]
                            }
                        // SAVE THE LIMIT ORDER     
                            algorithm.pendingLimit.push(pendingLimitOrder)                                           
                    } else {

                        let lenPips = 1
                        // CALCULATE THE PIPS DISTANCE TO FULFILL THE ADDITIONAL ORDERS 
                        if(algorithm.addOrders == 'pips') lenPips += algorithm.addOrdersPips

                        if(algorithm.addOrders == 'percentage') {
                            lenPips = ((algorithm.addOrdersPercentage / 100 * parseFloat(data[y].askPrice)) / parseFloat(algorithm.pipAmount)) + 1
                            // 0.25 * 10000 
                        }


                        for (let i = 1; i <= lenPips; i++) {
                            let limitPrice = 0
                        // CHECK WE ARE WITHIN OPEN ORDER LIMITS     
                            if(algorithm.maxOpenOrders > (algorithm.current.length + algorithm.pendingLimit.length)) {                        
                        // CALCULATE LIMIT PRICE     
                                if(entryPolicy == 'BUY') limitPrice = (parseFloat(data[y].askPrice) - (parseFloat(algorithm.pipAmount) * i))
                                if(entryPolicy == 'SELL') limitPrice = (parseFloat(data[y].bidPrice) + (parseFloat(algorithm.pipAmount) * i))
                                // ADD PRENDING LIMIT BID ORDER 
                                    let pendingLimitOrder = {
                                        T:data[y].T,
                                        price:limitPrice,
                                        currentBidPrice:data[y].bidPrice,
                                        currentAskPrice:data[y].askPrice,
                                        orderAmount:algorithm.orderAmount,
                                        orderType:entryPolicy,
                                        entry:true,
                                        data:data[y]
                                    }
                                // SAVE THE LIMIT ORDER     
                                    algorithm.pendingLimit.push(pendingLimitOrder)                                            
                            } 
                        }


                    }                
                }    
                
            }                        
        }
    // COMPLETED DATA 
        console.log('COMPLETED ALGORITHM ON',len,'ROWS OF DATA')
    // FINALISE ANY PENDING ORDERS
    
        console.log('pendingLimit',algorithm.pendingLimit)
        console.log('history',algorithm.history)
        console.log('current',algorithm.current)
        
    // DELETE ANY PENDING LIMIT ORDERS    
        algorithm.pendingLimit = []
    // CALCULATE PNL RESULTS AND SAVE 
        let avgDrawDown = 0
        let avgPnLPercent = 0
        let avgTimeTaken = 0
        let lenh = algorithm.history.length 
        for (let i = 0; i < lenh; i++) {            
            algorithm.pnl += algorithm.history[i].pnl 
            algorithm.pnlPercent += algorithm.history[i].pnlPercent
            algorithm.gross += algorithm.history[i].gross 
            algorithm.grossPercent += algorithm.history[i].grossPercent            
            algorithm.fees += algorithm.history[i].fees
            algorithm.feesPercent += algorithm.history[i].feesPercent
        // COUNT SUCCESSFUL TRADES    
            if(algorithm.history[i].pnlPercent >= 0) algorithm.successTrades++
        // SET MAX PNL
            if(algorithm.history[i].pnlPercent > algorithm.maxPnL) algorithm.maxPnL = algorithm.history[i].pnlPercent
        // SET MAX DRAWDOWN    
            if(algorithm.history[i].drawdown < algorithm.maxDrawdown) algorithm.maxDrawdown = algorithm.history[i].drawdown
        // COUNT PNL FOR CALCULATION OF AVG    
            avgPnLPercent += algorithm.history[i].pnlPercent
        // COUNT DRAWDOWN FOR CALCULATION OF AVG    
            avgDrawDown += algorithm.history[i].drawdown
        // COUNT TIME TAKEN FOR CALCULATION OF AVG
            avgTimeTaken += algorithm.history[i].timeTaken
        // COUNT STOP LOSSES HIT    
            if(algorithm.history[i].stopLoss) algorithm.stopLossTrades++
            
        }
    // CALCULATE TOTAL TRADES INCLUDING CURRENT     
        algorithm.trades = algorithm.history.length + algorithm.current.length 
    // CALCULATE ACCURACY    
        algorithm.accuracy = 0
        if(algorithm.trades) algorithm.accuracy = (algorithm.successTrades / algorithm.trades * 100).toFixed(0)
    // CALCULATE AVG PNL
        algorithm.avgPnL = parseFloat((avgPnLPercent / algorithm.history.length).toFixed(4))
    // CALCULATE AVG DRAWDOWN 
        algorithm.avgDrawdown = parseFloat((avgDrawDown / algorithm.history.length).toFixed(4))
    // CALCULATE AVG TIME TAKEN  // DIVIDE BY 60 TO FIND MINS AVG
        algorithm.avgTimeTaken = parseFloat((avgTimeTaken / algorithm.history.length / 60).toFixed(0))
        
    // DISPLAY RESULTS ON PAGE    
        $('.algorithmResults .pnl').html(algorithm.pnl.toFixed(8))     
        $('.algorithmResults .pnlPercent').html(parseFloat(algorithm.pnlPercent.toFixed(3))+'%') 
        $('.algorithmResults .gross').html(algorithm.gross.toFixed(8)) 
        $('.algorithmResults .grossPercent').html(parseFloat(algorithm.grossPercent.toFixed(3))+'%') 
        $('.algorithmResults .fees').html(algorithm.fees.toFixed(8)) 
        $('.algorithmResults .feesPercent').html(parseFloat(algorithm.feesPercent.toFixed(3))+'%') 
        $('.algorithmResults .trades').html(algorithm.trades) 
        $('.algorithmResults .successTrades').html(algorithm.successTrades) 
        $('.algorithmResults .openTrades').html(algorithm.current.length) 
        $('.algorithmResults .stopLossTrades').html(algorithm.stopLossTrades)     
        $('.algorithmResults .accuracy').html(algorithm.accuracy+'%') 
        $('.algorithmResults .maxDrawdown').html(parseFloat(algorithm.maxDrawdown.toFixed(3))+'%') 
        $('.algorithmResults .avgDrawdown').html(parseFloat(algorithm.avgDrawdown.toFixed(3))+'%') 
        $('.algorithmResults .maxPnL').html(parseFloat(algorithm.maxPnL.toFixed(3))+'%') 
        $('.algorithmResults .avgPnL').html(parseFloat(algorithm.avgPnL.toFixed(3))+'%')     
        $('.algorithmResults .avgTimeTaken').html(algorithm.avgTimeTaken)             
        
    // DISPLAY LOG OF ALGORITHM TRADES    
    if($('#showAlgorithmOrderLog').is(':checked')) {        
        displayAlgorithmLog(currencySymbol,decimalPlaces)
    // CHANGE COLOURS OF UPDATED VALUES
        changeColourOfNumber('bubbleAlgorithm')  
    }    
    // LOAD GRAPH WITH ENTRY AND EXIT POINTS    
     //   loadGraph(exchPairID)            

        
    }
}


function calculateStopLossPrice(data,entryPrice,entryPolicy) {
    
// CALCULATE STOP LOSS PRICE    
    let stopLossPrice = 0    
    let stopLossTrailingResetPrice = 0 
    if(algorithm.stopLoss != '') {                
        let stopLossAmount = 0
        if(algorithm.stopLoss == 'percentage') {                    
            stopLossAmount = parseFloat(((algorithm.stopLossPercentage/100) * entryPrice).toFixed(algorithm.decimalPlaces))
        }
        if(algorithm.stopLoss == 'pips') {                    
            stopLossAmount = parseFloat((algorithm.pipAmount * algorithm.stopLossPips).toFixed(algorithm.decimalPlaces))
        }
        if(algorithm.stopLoss == 'ATR') {     
            let ATRHandle = algorithm.stopLossTimePeriod                    
            let ATR = data.ohlcv.ATR[ATRHandle]
            stopLossAmount = parseFloat((ATR*algorithm.stopLossMultiplier).toFixed(algorithm.decimalPlaces))
        }
    // APPLY MODULUS/REMAINDER TO PRICE TO GET CORRECT PIP AMOUNT FOR EXCHANGE 
    // SINCE IS STOP LOSS WE WILL REMOVE THIS REMAINER AMOUNT TO ENSURE WE ARE UNDER THE SPECIFIED STOP LOSS AMOUNT
        let remainder = (stopLossAmount % algorithm.pipAmount).toFixed(algorithm.decimalPlaces)
        if(remainder) {
            let orig = stopLossAmount                        
                stopLossAmount = stopLossAmount - remainder            
         //   console.log(orig,remainder,stopLossAmount)
        }
    // SET STOP LOSS PRICE FROM CALCULATED STOP LOSS AMOUNT     
        if(entryPolicy == 'BUY') {
            stopLossPrice =  parseFloat(parseFloat(entryPrice - stopLossAmount).toFixed(algorithm.decimalPlaces))
        } else {
            stopLossPrice =  parseFloat(parseFloat(entryPrice + stopLossAmount).toFixed(algorithm.decimalPlaces))
        }        
        
    // CALCULATE REST PRICE IF TRAILING IS ENABLED     
        if(algorithm.stopLossTrailing) {            
            if(entryPolicy == 'BUY') {
                stopLossTrailingResetPrice = parseFloat(parseFloat(entryPrice + stopLossAmount).toFixed(algorithm.decimalPlaces))
            } else {
                stopLossTrailingResetPrice = parseFloat(parseFloat(entryPrice - stopLossAmount).toFixed(algorithm.decimalPlaces))
            }
        }
    }
// RETURN CALCULATED VALUES     
    return({
        stopLossPrice:stopLossPrice,
        stopLossTrailingResetPrice:stopLossTrailingResetPrice
           })
}



function newTransaction(data,orderData) {    

    // SET TAKE PROFIT PRICE IF SPECIFIED
        let takeProfitPrice = 0                    
        let takeProfitAmount = 0    
        if(algorithm.takeProfit != '') {                    
            if(algorithm.takeProfit == 'percentage') {                    
                takeProfitAmount = parseFloat(((parseFloat(orderData.price) * parseFloat(algorithm.takeProfitPercentage)/100)).toFixed(algorithm.decimalPlaces))
            // APPLY MODULUS/REMAINDER TO PRICE TO GET CORRECT PIP AMOUNT FOR EXCHANGE                 
               // let orig = takeProfitAmount
                let remainder = (takeProfitAmount % algorithm.pipAmount).toFixed(algorithm.decimalPlaces)
                if(remainder) {
                    takeProfitAmount = takeProfitAmount - remainder
                    if(remainder > algorithm.pipAmount / 2) takeProfitAmount = takeProfitAmount + algorithm.pipAmount     
                }
               //console.log(orig,remainder,takeProfitAmount)
            }
            if(algorithm.takeProfit == 'pips') {                    
                takeProfitAmount = algorithm.pipAmount * algorithm.takeProfitPips
            }

            if(orderData.orderType == 'BUY') {
                takeProfitPrice = parseFloat(orderData.price) + takeProfitAmount
            }
            if(orderData.orderType == 'SELL') {
                takeProfitPrice = parseFloat(orderData.price) - takeProfitAmount
            }                          
        }
            
    if(takeProfitAmount == 0 || takeProfitPrice == 0) {
        console.log('orderData',orderData)
    }
    let stopLoss = calculateStopLossPrice(data,orderData.price,orderData.orderType)
                                
    // CREATE RANDOM ID
    let newTransactionID = getRndInteger(1000000, Math.floor(new Date()))        
    let transaction = {
            orderID:newTransactionID,
            orderType:orderData.orderType,
            entryTime:orderData.data.T,            
            exitTime:data.T,
            orderAmount:orderData.orderAmount,
            entryPrice:orderData.price,
            exitPrice:0,            
            exitMethod:0,            
            takeProfitPrice:takeProfitPrice,
            stopLossPrice:stopLoss.stopLossPrice,
            stopLossTrailing:algorithm.stopLossTrailing,
            stopLossTrailingResetPrice:stopLoss.stopLossTrailingResetPrice,
            gross:0,
            grossPercent:0,
            pnl:0,
            pnlPercent:0,
            fees:0,
            drawdown:0,
            stopLoss:false,
            timeTaken:0,
            entryData:[],
            exitData:[],
            entryLimitWaitTime:0,
            exitLimitWaitTime:0,
            exitLimitPending:0
        }
// SAVE ENTRY DATA THAT TRIGGERED ORDER     
    if(!orderData.data) {
// IF LIMIT ORDER THEN SAVE DETAILS OF ENTRY DATA AND TIME LIMIT ORDER WAS PLACED 
        transaction.entryData = orderData.data
        transaction.entryLimitWaitTime = parseFloat(((data.T - orderData.data.T) / 1000).toFixed(0))
    } else {        
        transaction.entryData = data
        transaction.entryTime = data.T
    }
    return transaction
}
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}
function checkPendingEntryLimitOrders(data,openOrderPips,entryPolicy) {        
    let pendingOrders = algorithm.pendingLimit
    let len = pendingOrders.length    
    for (let i = 0; i < len; i++) {
        if(pendingOrders[i]) {            
            if((pendingOrders[i].price > data.bidPrice && pendingOrders[i].orderType == 'BUY') || (pendingOrders[i].price < data.askPrice && pendingOrders[i].orderType == 'SELL')) {
        //  ENTRY LIMIT ORDER WAS TAKEN                  
            // CREATE NEW TRANSACTION    
                let transaction = newTransaction(data,pendingOrders[i])
            // SAVE NEW ORDER TO THE CURRENT ORDERS    
                algorithm.current.push(transaction)
            // REMOVE THE ORDER SINCE IT WAS TAKEN    
                pendingOrders.splice(i,1)
                
            }  else {
        // REMOVE THE LIMIT ORDER AND LET THE MAIN FUNCTION ADD NEW LIMIT ORDERS AS NEEDED
                pendingOrders.splice(i,1)                
            }                  
        }        
    }
}
function checkPendingLimitOrderAtPrice(price,orderType) {
    
    let pendingOrders = algorithm.pendingLimit
    let len = pendingOrders.length
    for (let i = 0; i < len; i++) {
        if(pendingOrders[i].price == price && pendingOrders[i].orderType == orderType) {
            return true 
        }
    }
}


function finaliseTransaction(transaction,data,exitPrice,stopLossHit) {    
    
    if(exitPrice == 0) {
        console.log(exitPrice,transaction.takeProfitPrice,transaction.stopLossPrice)
    }
    // APPLY EXIT PRICE
        transaction.exitPrice = exitPrice    
    //  STOP LOSS ORDER WAS HIT        
        transaction.stopLoss = stopLossHit
    // SAVE EXIT DATA    
        transaction.exitData = data
    
    // CALCULATE PNL PERCENT    
        let pnlPercent = 0
        if(transaction.orderType == 'BUY') {
           pnlPercent = parseFloat((((parseFloat(transaction.exitPrice) - parseFloat(transaction.entryPrice)) / parseFloat(transaction.entryPrice)) * 100).toFixed(6))
        }
        if(transaction.orderType == 'SELL') {
           pnlPercent = parseFloat((((parseFloat(transaction.entryPrice) - parseFloat(transaction.exitPrice)) / parseFloat(transaction.entryPrice)) * 100).toFixed(6))
        }                
    // SAVE PNL DRAW DOWN IF STOP LOOS HIT        
        if(stopLossHit) transaction.drawdown =  pnlPercent      
    // OPEN TRANSACTION FEES    
        if(algorithm.orderMethodEntry == 'limit') {                    
            transaction.feesPercent = 0 - parseFloat(algorithm.makerFee)
        } else {
            transaction.feesPercent = 0 - parseFloat(algorithm.takerFee)
        }
    // CLOSE TRANSACTION FEES ADDED TO OPEN FEES    
        if(algorithm.orderMethodExit == 'limit' && !stopLossHit) {                    
            transaction.feesPercent += 0 - parseFloat(algorithm.makerFee)
        } else {
            transaction.feesPercent += 0 - parseFloat(algorithm.takerFee)
        }
    // CALCULATE FEES AMOUNT BASED ON FEE PERCENT
        transaction.fees = 0 - parseFloat(transaction.orderAmount) * parseFloat(transaction.feesPercent / 100)

        transaction.grossPercent = pnlPercent
        transaction.gross = parseFloat(transaction.orderAmount) * parseFloat(pnlPercent)

    // CALCULATE NETT PERCENTAGE BY REMOVING FEES PERCENT FROM PNL PERCENT    
        pnlPercent = parseFloat((pnlPercent + transaction.feesPercent).toFixed(4))
    // CALCULATE AND SAVE PNL     
        transaction.pnl = parseFloat(transaction.orderAmount) * parseFloat(pnlPercent)
        transaction.pnlPercent = pnlPercent
    
    // CALCULATE TIME TAKEN
        transaction.timeTaken = parseFloat(((data.T - transaction.entryData.T) / 1000).toFixed(0))
        transaction.exitLimitWaitTime = parseFloat(((data.T - transaction.exitTime) / 1000).toFixed(0))
        transaction.exitTime = data.T
    
    // SAVE TO ORDER HISTORY SINCE TRANSACTION IS COMPLETED    
        algorithm.history.push(transaction)

}


function checkPendingExitLimitOrders(data,exitPolicy) {
    let pendingTransactions = algorithm.current
    let len = pendingTransactions.length
    for (let i = 0; i < len; i++) {
        if(pendingTransactions[i]) {
            if((pendingTransactions[i].takeProfitPrice > data.bidPrice && pendingTransactions[i].orderType == 'SELL') || (pendingTransactions[i].takeProfitPrice < data.askPrice && pendingTransactions[i].orderType == 'BUY')) {
        // EXIT LIMIT ORDER WAS TAKEN       

            // FINALISE TRANSACTION 
                let transaction = JSON.parse(JSON.stringify(pendingTransactions[i]))
                finaliseTransaction(transaction,data,transaction.takeProfitPrice,false)
                                
            // REMOVE TRANSACTION FROM THE CURRENT ORDERS     
                pendingTransactions.splice(i,1)

            }  else {
            // CALCULATE PNL PERCENT TO CHECK DRAWDOWN     
                let pnlPercent = 0
                if(pendingTransactions[i].orderType == 'BUY') {
                   pnlPercent = parseFloat((((parseFloat(data.bidPrice) - parseFloat(pendingTransactions[i].entryPrice)) / parseFloat(pendingTransactions[i].entryPrice)) * 100).toFixed(6))
                }
                if(pendingTransactions[i].orderType == 'SELL') {
                   pnlPercent = parseFloat((((parseFloat(pendingTransactions[i].entryPrice) - parseFloat(data.askPrice)) / parseFloat(pendingTransactions[i].entryPrice)) * 100).toFixed(6))
                }                
            // SAVE DRAW DOWN IF LOWER THAN CURRENT     
                if(pnlPercent < pendingTransactions[i].drawdown) {
                        pendingTransactions[i].drawdown =  pnlPercent      
                } 

                if(algorithm.stopLoss != '') {  
                    if((pendingTransactions[i].stopLossPrice <= data.bidPrice && pendingTransactions[i].orderType == 'SELL') || (pendingTransactions[i].stopLossPrice >= data.askPrice && pendingTransactions[i].orderType == 'BUY')) {

                    // FINALISE TRANSACTION   
                        let transaction = JSON.parse(JSON.stringify(pendingTransactions[i]))
                        finaliseTransaction(transaction,data,transaction.stopLossPrice,true)

                    // REMOVE TRANSACTION FROM THE CURRENT ORDERS     
                        pendingTransactions.splice(i,1)

                    } else {

                    // ADJUST STOP LOSS TRAILING IF RESET PRICE HAS BEEN REACHED     
                        if(algorithm.stopLossTrailing) { 
                            if((pendingTransactions[i].stopLossTrailingResetPrice > data.bidPrice && pendingTransactions[i].orderType == 'SELL') || (pendingTransactions[i].stopLossTrailingResetPrice < data.askPrice && pendingTransactions[i].orderType == 'BUY')) {
                            // CALCULATE STOP LOSS PRICE     
                                let stopLoss = calculateStopLossPrice(data,data.bidPrice,pendingTransactions[i].orderType,pendingTransactions[i].stopLossPrice)
                                pendingTransactions[i].stopLossPrice = stopLoss.stopLossPrice
                                pendingTransactions[i].stopLossTrailingResetPrice = stopLoss.stopLossTrailingResetPrice
                            }
                        }              
                    }
                }
            } 
        }        
    }    
}


function displayAlgorithmLog(currencySymbol,decimalPlaces) {
    
    // REMOVE ALL PREVIOUS ELEMENTS ADDED FOR FRESH LOG
       $('.orderLog .orderLogRow').remove();
        let lenorderLog = algorithm.history.length
      //  if(lenorderLog > 25) lenorderLog = 25
        if(lenorderLog == 0) {
            $('.orderLog').html($('.orderLog').html()+'<div class="orderLogRow">No Backtest Trades</div>')
        }
       // console.log(traderBot.orderLog)
        for (let l = 0; l < lenorderLog; l++) { 
            // APPEND TO LOG IF DOES NOT EXIST        
            // document.getElementById("log"+l) === null || 
            if($(".orderLog #order"+l).length < 1) {
                
                let rowData = algorithm.history[l]
               // console.log(l,'ADD ROW',rowData.entryPrice)
                displayOrderRow(l,rowData,currencySymbol,decimalPlaces)
                
            } 
            
        }   

        $( ".orderLog .orderLogRow:odd" ).css( "background-color", "#4D837F" );
        changeColourOfNumber('bubble')
    
}  
function displayOrderRow(rowID,rowData,currencySymbol,decimalPlaces) {
    
    
                $(".orderLogRowMaster").clone().insertAfter(".orderLog .orderLogHeader").attr("id","order"+rowID);
                
                // DISPLAY THE ORDER DETAILS
                $(".orderLog #order"+rowID+" .orderType").html(rowData.orderType)
                $(".orderLog #order"+rowID+" .entryPrice").html(currencySymbol+numberWithCommas((rowData.entryPrice).toFixed(decimalPlaces)))
                let timeTaken = rowData.timeTaken
                if(timeTaken > 60) {
                    timeTaken = parseInt(timeTaken/60) +'min ' + parseInt((timeTaken % 60)) + 'sec'
                } else {
                    if(timeTaken == 0) {
                        timeTaken = 'Open Trade'
                    } else {                        
                        timeTaken = timeTaken + 'sec'
                    }                    
                }    
                $(".orderLog #order"+rowID+" .timeTaken").html(timeTaken)
                $(".orderLog #order"+rowID+" .entryTime").html(formatDateTime(rowData.entryTime).split(' ')[1])
                $(".orderLog #order"+rowID+" .exitTime").html(formatDateTime(rowData.exitTime).split(' ')[1])
                
                $(".orderLog #order"+rowID+" .exitPrice").html(currencySymbol+numberWithCommas((rowData.exitPrice).toFixed(decimalPlaces)))
                if(rowData.stopLossPrice != 0 && rowData.stopLoss === true) {            
                // DEBUG if(rowData.stopLossPrice != 0) {
                    $(".orderLog #order"+rowID+" .stopLossPrice").html('<img style="height:14px;vertical-align: middle" src="/images/stop_sign_21.png" /> '+currencySymbol+numberWithCommas((rowData.stopLossPrice).toFixed(decimalPlaces)))
                } else {
                    $(".orderLog #order"+rowID+" .stopLossPrice").html('--')
                }
               // $(".orderLog #order"+rowID+" .exitTime").html(formatDateTime(rowData.exitTime).split(' ')[1])
                $(".orderLog #order"+rowID+" .grossPercent").html(rowData.grossPercent.toFixed(3)+'%')
                $(".orderLog #order"+rowID+" .feesPercent").html(rowData.feesPercent.toFixed(3)+'%')
                $(".orderLog #order"+rowID+" .pnlPercent").html(rowData.pnlPercent.toFixed(3)+'%')
                $(".orderLog #order"+rowID+" .drawdown").html(rowData.drawdown.toFixed(3)+'%')
             //   $(".orderLog #order"+rowID+" .entryData").html('LIMIT -> '+rowData.takeProfitPrice+'ASK -> '+rowData.entryData.askPrice+' BID -> '+rowData.entryData.bidPrice)
               // $(".orderLog #order"+rowID+" .entryData").html(JSON.stringify(rowData.entryData))
                //$(".orderLog #order"+rowID+" .exitData").html('ASK -> '+rowData.exitData.askPrice+' BID -> '+rowData.exitData.bidPrice)
    
    
    
                $(".orderLog #order"+rowID).addClass("orderLogRow").removeClass("hideThis orderLogRowMaster");
                //console.log('trailing',rowData.stopLossTrailingResetPrice)
    
    
}

/*

function oldCalculateAlgorithm(algoType) {     
    
    let exchPairID = $('#marketExchPairID').val()  
// CHECK WE HAVE THE DATA READY     
    let data = signalDataHistory[exchPairID]
    if(data === undefined || !data.length) return;
    
    //console.log(data)
    
// SET MARKET DATA FOR CALCULATIONS AND DISPLAY    
    let decimalPlaces = signalData[exchPairID].decimalPlaces
    let currencySymbol = signalData[exchPairID].currencySymbol 
    let pipAmount = signalData[exchPairID].pipAmount
    if(currencySymbol != '$') currencySymbol = '' // currencySymbol + '&nbsp;'    
    
   // console.log(algorithm)
        
    let entryConditions = algorithm.entryConditions    
    let exitConditions = algorithm.exitConditions
    
    let orderMethodEntry = $('input[name=orderMethodEntry]:checked').val() 
    let orderMethodExit = $('input[name=orderMethodExit]:checked').val()  
    
    console.log('orderMethodEntry',orderMethodEntry,'orderMethodExit',orderMethodExit)
    
    // RESET BACKTEST
    algorithm.current = []
    algorithm.history = []
    algorithm.gross = 0
    algorithm.pnl = 0
    algorithm.fees = 0
    algorithm.trades = 0
    algorithm.successTrades = 0
    algorithm.stopLossTrades = 0
    algorithm.accuracy = 0
    algorithm.maxPnL = 0
    algorithm.avgPnL = 0
    algorithm.maxDrawdown = 0
    algorithm.avgDrawdown = 0
    algorithm.maxOpenOrders = 0

    
    
// UPDATE ALGORITHM SETTINGS    
    algorithm.takeProfit = $('#useLeverage').val()
    algorithm.takeProfit = $('#takeProfit').val()
    algorithm.takeProfitPercentage = parseFloat($('#takeProfitPercentage').val())
    algorithm.takeProfitMultiplier = parseFloat($('#takeProfitMultiplier').val())
    algorithm.takeProfitTimePeriod = $('#takeProfitTimePeriod').val()
    algorithm.takeProfitTrailing = $('#trailingTakeProfit').is(':checked')    
    algorithm.stopLoss = $('#stopLoss').val()
    algorithm.stopLossPercentage = parseFloat($('#stopLossPercentage').val())
    algorithm.stopLossMultiplier = parseFloat($('#stopLossMultiplier').val())
    algorithm.stopLossTimePeriod = $('#stopLossTimePeriod').val()
    algorithm.stopLossTrailing = $('#trailingStopLoss').is(':checked')    
    
    if(entryConditions.length > 0 && (exitConditions.length > 0 || algorithm.takeProfit != '' || algorithm.stopLoss != '')) {   
        let len = data.length
        for (let y = 0; y < len; y++) {

        // CHECK IF WE NEED TO DO ENTRY OR EXIT OR IF PENDING ENTRY LIMIT ORDER         
            let check = ''
            if(algorithm.current.currentPolicy === undefined || parseFloat(algorithm.current.entryLimitPending) > 0) {
                check = 'entry'
            } else {
                check = 'exit'
            }
            console.log(check,algorithm.current.currentPolicy,algorithm.current.entryLimitPending)
            //if(y < 10) console.log(check,algorithm.current)
            
            // CLEAN ANY PREVIOUSLY ADDED HTML FROM THE GRAPH
            data[y].html = ''

            //console.log('check',check,algorithm)
        // IF WE DONT HAVE A OPEN POSITION, THEN RUN ENTRY CHECKS        
            if(check == 'entry') {

               // console.log('entryConditions',entryConditions)
            // LOOP THROUGH ALL AND CHECK ENTRY CONDITIONS TO GET AN ENTRY POLICY RESULT            
                let entryPolicy = checkConditions(entryConditions,data[y])
                
                if(entryPolicy != 0) {
                    
                    if(algorithm.current.currentPolicy === undefined) {                        
                        algorithm.current = {
                            currentPolicy:'HOLD',
                            entryTime:data[y].T,
                            entryPrice:0,
                            stopLossPrice:0,        
                            stopLossTrailing:0,
                            stopLossTrailingResetPrice:0,
                            takeProfitPrice:0,
                            exitTime:0,
                            exitPrice:0,
                            gross:0,
                            pnl:0,
                            fees:0,
                            drawdown:0,
                            stopLoss:false,
                            time:0,
                            entryData:[],
                            exitData:[],
                            entryLimitPending:0,
                            exitLimitPending:0
                        }                    
                    }
                   // if(y < 10) console.log(check,entryPolicy,algorithm.current)
                    
                // CHECK IF WE HAVE PENDING LIMIT ORDER AND WAS COMPLETED, OR CANCEL PENDING IF PRICE HAS MOVED AND RESET AS LAST BID/ASK PRICE 
                    let entryLimitPendingSuccess = false
                    if(orderMethodEntry == 'limit') {
                        let policy = algorithm.currentPolicy                        
                        let limitPrice = algorithm.current.entryLimitPending
                    // CHECK IF PENDING LIMIT ORDER     
                        if(limitPrice > 0) {
                     // WE HAVE PENDING LIMIT ORDER SO CHECK IT 
                        // CHECK IF ORDER WAS TAKEN    
                            if(policy == 'BUY') {
                                 if(limitPrice > data[y].bidPrice) {
                                    // ORDER WAS TAKEN SO SET AS LIVE       
                                     entryLimitPendingSuccess = true                                     
                                      algorithm.current.entryPrice = limitPrice
                                     algorithm.current.entryLimitPending = 0
                                 } else {
                                     // ORDER NOT TAKEN, SO CHECK IF PRICE HAS MOVED FURTHER AWAY AND RESET NEW LIMIT ORDER AT THE BID PRICE
                                     algorithm.current.entryLimitPending = data[y].bidPrice                                     
                                 }
                            }
                            if(policy == 'SELL') {
                                 if(limitPrice < data[y].askPrice) {
                                    // ORDER WAS TAKEN SO SET AS LIVE 
                                     entryLimitPendingSuccess = true                                     
                                     algorithm.current.entryPrice = limitPrice
                                     algorithm.current.entryLimitPending = 0
                                 } else {
                                     // ORDER NOT TAKEN, SO CHECK IF PRICE HAS MOVED FURTHER AWAY AND RESET NEW LIMIT ORDER AT THE BID PRICE
                                     algorithm.current.entryLimitPending = data[y].askPrice                                     
                                 }
                            }
                                
                        } 
                        let placed = false
                        if(entryLimitPendingSuccess !== true) {
                    // PLACE PENDING LIMIT ORDER AT CURRENT BID/ASK PRICE         
                            if(entryPolicy == 1) {
                                algorithm.current.entryLimitPending = data[y].bidPrice
                                algorithm.currentPolicy = 'BUY'
                                limitPrice = data[y].bidPrice
                                policy = 'BUY'
                                placed = true
                            } 
                            if(entryPolicy == -1) {
                                algorithm.current.entryLimitPending = data[y].askPrice
                                algorithm.currentPolicy = 'SELL'
                                limitPrice = data[y].askPrice
                                policy = 'SELL'
                                placed = true
                            }                            
                        }                    
                        
                            console.log('ENTRY',entryPolicy,algorithm.currentPolicy,algorithm.current.entryLimitPending,data[y].bidPrice,data[y].askPrice,placed,entryLimitPendingSuccess)
                        
                    }
               
                   // console.log('entryPolicy',entryPolicy,algorithm.current.currentPolicy)
                    
                // SETUP ORDER IF MARKET ORDER OR LIMIT ORDER WAS PLACED 
                    if(algorithm.current.entryLimitPending == 0) {
                        
                        // SAVE THIS DATA POINT FOR REFERENCE
                        algorithm.current.entryData.push(data[y])

                    // SAVE THE BUY / SELL SIGNAL    
                        if(entryPolicy > 0) {
                        // IF NO ENTRY ORDER YET, THEN IS MARKET ORDER SET BUY ENTRY AS ASK APRICE
                            if(algorithm.current.entryPrice == 0) algorithm.current.entryPrice = data[y].askPrice
                        // IF NO POLICY IN PLACE THEN MARKET ORDER SO SET POLICY                                
                            if(algorithm.current.currentPolicy == 'HOLD') algorithm.current.currentPolicy = 'BUY'                                                        
                        // ADD TO CURRENT DATA POINT IF MARKET ORDER OR PREVIOUS DATA POINT IF LIMIT ORDER
                            let htmlIndex = y
                            if(entryLimitPendingSuccess === true && data[y-1] !== undefined) htmlIndex = y-1                            
                            data[htmlIndex].html = {
                                below:'<span style="font-size: 12px; color: #2BA84A;"><i class="fas fa-chevron-circle-up"></i></span>'   
                            }

                        } else {
                        // IF NO ENTRY ORDER YET, THEN IS MARKET ORDER SET SELL ENTRY AS BID APRICE
                            if(algorithm.current.entryPrice == 0) algorithm.current.entryPrice = data[y].askPrice
                        // IF NO POLICY IN PLACE THEN MARKET ORDER SO SET POLICY    
                            if(algorithm.current.currentPolicy == 'HOLD')  algorithm.current.currentPolicy = 'SELL'
                        // ADD TO CURRENT DATA POINT IF MARKET ORDER OR PREVIOUS DATA POINT IF LIMIT ORDER
                            let htmlIndex = y
                            if(entryLimitPendingSuccess === true && data[y-1] !== undefined) htmlIndex = y-1                            
                            data[htmlIndex].html = {
                                above:'<span style="font-size: 12px; color: #ED5565;"><i class="fas fa-chevron-circle-down"></i><span>'
                            }

                        }                             
                        
                        let pipFactor = 5
                    // CALCULATE TAKE PROFIT PRICE AND SET LIMIT ORDER 
                        if(algorithm.takeProfit != '') {
                            
                            if(algorithm.current.currentPolicy == 'BUY') {                                
                                algorithm.current.takeProfitPrice = parseFloat(algorithm.current.entryPrice) + (parseFloat(pipAmount) * pipFactor)
                            }
                            if(algorithm.current.currentPolicy == 'SELL') {                                
                                algorithm.current.takeProfitPrice = parseFloat(algorithm.current.entryPrice) -(parseFloat(pipAmount) * pipFactor)
                            }
                            
                        }

                    // CALCULATE STOP LOSS PRICE    
                        if(algorithm.stopLoss != '') {                
                            let stopLossAmount = 0
                            if(algorithm.stopLoss == 'percentage') {                    
                                stopLossAmount = (algorithm.stopLossPercentage/100) * data[y].askPrice
                                if(entryPolicy > 0) {
                                    algorithm.current.stopLossPrice =  parseFloat(parseFloat(data[y].askPrice - stopLossAmount).toFixed(decimalPlaces))
                                } else {
                                    algorithm.current.stopLossPrice =  parseFloat(parseFloat(data[y].askPrice + stopLossAmount).toFixed(decimalPlaces))
                                }
                            }
                            if(algorithm.stopLoss == 'ATR') {     
                                let ATRHandle = algorithm.stopLossTimePeriod                    
                                let ATR = data[y].ohlcv.ATR[ATRHandle]
                                stopLossAmount = (ATR*algorithm.stopLossMultiplier)
                                if(entryPolicy > 0) {
                                    algorithm.current.stopLossPrice =  parseFloat(parseFloat(data[y].askPrice - stopLossAmount).toFixed(decimalPlaces))
                                } else {
                                    algorithm.current.stopLossPrice =  parseFloat(parseFloat(data[y].askPrice + stopLossAmount).toFixed(decimalPlaces))
                                }
                            }
                            if(algorithm.stopLossTrailing === true) {
                                algorithm.current.stopLossTrailing = stopLossAmount
                                if(entryPolicy > 0) {
                                    algorithm.current.stopLossTrailingResetPrice = parseFloat(parseFloat(data[y].askPrice + stopLossAmount).toFixed(decimalPlaces))
                                } else {
                                    algorithm.current.stopLossTrailingResetPrice = parseFloat(parseFloat(data[y].askPrice - stopLossAmount).toFixed(decimalPlaces))
                                }
                            }
                        }
                        
                    }
                    
                    
                }


            }


        // IF WE HAVE AN OPEN POSITION, THEN RUN EXIT CHECKS        
            if(check == 'exit') {
                
                


            // LOOP THROUGH ALL AND CHECK ENTRY CONDITIONS TO GET AN ENTRY POLICY RESULT            
               // console.log('exitConditions',exitConditions)
                let exitPolicy = checkConditions(exitConditions,data[y])
                let checkStopLoss = false
                if(algorithm.current.stopLossPrice > 0 && algorithm.current.currentPolicy == 'BUY' && data[y].askPrice <= algorithm.current.stopLossPrice) {
                    checkStopLoss = true 
                }
                if(algorithm.current.stopLossPrice > 0 && algorithm.current.currentPolicy == 'SELL' && data[y].bidPrice >= algorithm.current.stopLossPrice) {
                    checkStopLoss = true 
                }
                
               // console.log('exitPolicy',exitPolicy,algorithm.current,checkStopLoss)
                
            // SET MAX DRAWDOWN
                 
                if(algorithm.current.currentPolicy == 'SELL') {                    
                    let exitPrice = data[y].bidPrice
                    if(checkStopLoss === true) exitPrice = algorithm.current.stopLossPrice
                    let pnl = parseFloat(algorithm.current.entryPrice) - parseFloat(exitPrice)
                    pnl =  parseFloat((pnl / exitPrice) * 100)                     
                    if(pnl < algorithm.current.drawdown) {
                        algorithm.current.drawdown = pnl
                    }
                }
                if(algorithm.current.currentPolicy == 'BUY') {                    
                    let exitPrice = data[y].askPrice
                    if(checkStopLoss === true) exitPrice = algorithm.current.stopLossPrice
                    let pnl = parseFloat(exitPrice) - parseFloat(algorithm.current.entryPrice)
                    pnl =  parseFloat((pnl / exitPrice) * 100)
                    if(pnl < algorithm.current.drawdown) {
                        algorithm.current.drawdown = pnl
                    }                    
                }
                if(parseFloat(algorithm.current.drawdown) < parseFloat(algorithm.maxDrawdown)) {
                   // console.log(algorithm.maxDrawdown, parseFloat(algorithm.current.drawdown))
                    algorithm.maxDrawdown = parseFloat(algorithm.current.drawdown)
                }                

            // LIMIT ORDER EXIT OR TAKE PROFIT EXIT USING LIMIT 
                let exitLimitPendingSuccess = false                
                if((orderMethodExit == 'limit' && parseFloat(algorithm.current.exitLimitPending) == 0) || parseFloat(algorithm.current.exitLimitPending) > 0 || algorithm.current.takeProfitPrice > 0) {                      
                    // CHECK TAKE PROFIT ORDER ALREADY IN PLACE     
                        if(algorithm.current.takeProfitPrice > 0) {
                            if((algorithm.current.currentPolicy == 'BUY' && algorithm.current.takeProfitPrice < data[y].askPrice) || (algorithm.current.currentPolicy == 'SELL' && algorithm.current.takeProfitPrice > data[y].bidPrice)) {
                        // CHECK EXISTING LIMIT ORDER AND SET EXIT PRICE IF TAKEN 
                                algorithm.current.exitPrice = algorithm.current.takeProfitPrice
                                exitLimitPendingSuccess = true
                                algorithm.current.takeProfitPrice = 0
                            }
                        }
                    // CHECK EXIT LIMIT ORDER ALREADY IN PLACE     
                        if(algorithm.current.exitLimitPending > 0) {
                            
                            let limitPrice = algorithm.current.exitLimitPending
                            
                            if((algorithm.current.currentPolicy == 'BUY' && algorithm.current.exitLimitPending < data[y].askPrice) || (algorithm.current.currentPolicy == 'SELL' && algorithm.current.exitLimitPending > data[y].bidPrice)) {
                        // CHECK EXISTING LIMIT ORDER AND SET EXIT PRICE IF TAKEN 
                                algorithm.current.exitPrice = algorithm.current.exitLimitPending
                                exitLimitPendingSuccess = true
                                algorithm.current.exitLimitPending = 0
                            }                             
                        }
                    
                    // NEW EXIT LIMIT ORDER TO PLACE 
                        if(exitLimitPendingSuccess !== true  &&  algorithm.current.takeProfitPrice == 0) {
                           
                            // RESET EXIT LIMIT ORDER TO LATEST BID/ASK PRICE IF PRICE HAS MOVED    
                            if(exitPolicy == -1 && algorithm.current.currentPolicy == 'BUY') {
                                algorithm.current.exitLimitPending = data[y].askPrice
                            }
                            if(exitPolicy == 1 && algorithm.current.currentPolicy == 'BUY') {
                                algorithm.current.exitLimitPending = 0
                            }
                            if(exitPolicy == 1 && algorithm.current.currentPolicy == 'SELL') {
                                algorithm.current.exitLimitPending = data[y].bidPrice
                            }
                            if(exitPolicy == -1 && algorithm.current.currentPolicy == 'SELL') {
                                algorithm.current.exitLimitPending = 0
                            }
                        }
                           
                    
                        console.log('EXIT', exitPolicy,algorithm.current.currentPolicy, algorithm.current.exitLimitPending,data[y].bidPrice,data[y].askPrice,exitLimitPendingSuccess)
                    
                }
                
                
                    
            // CHECK IF POLICY IS AN EXIT POINT
                if((orderMethodExit != 'limit' && algorithm.current.takeProfitPrice == 0 && ((exitPolicy == -1 && algorithm.current.currentPolicy == 'BUY') || (exitPolicy == 1 && algorithm.current.currentPolicy == 'SELL'))) || checkStopLoss === true || exitLimitPendingSuccess === true) {

                    let dataIndex = y
                    if(exitLimitPendingSuccess === true && data[y] !== undefined) dataIndex = y-1
                // SAVE TIME AND EXIT PRICE     
                    algorithm.current.exitTime = data[dataIndex].T
                    algorithm.current.time = parseInt((data[dataIndex].T - algorithm.current.entryTime) / 1000)
                // IF MARKET ORDER THEN SET EXIT PRICE     
                    if(algorithm.current.exitPrice == 0) {                        
                        if(algorithm.current.currentPolicy == 'BUY') {                    
                            algorithm.current.exitPrice = data[y].askPrice
                        } else {
                            algorithm.current.exitPrice = data[y].bidPrice
                            // REVERSE PNL FOR SHORT TO CALCULATE 
                        }
                    }
                // IF STOP LOSS ORDER THEN SET EXIT PRICE     
                    if(checkStopLoss === true) {
                        algorithm.current.exitPrice = algorithm.current.stopLossPrice
                        algorithm.current.stopLoss = true
                    }
                // CALCULATE PNL     
                    let pnl = algorithm.current.exitPrice - algorithm.current.entryPrice
                    pnl =  parseFloat((pnl / data[y].askPrice) * 100) 
                    if(algorithm.current.currentPolicy == 'SELL') {                    
                     pnl = 0 - pnl
                    }
                // SAVE EXCHANGE FEES
                    let marketInfo = getMarketInfo(exchPairID)
                // CALCULATE LIMIT OR MARKET ORDER FEES    
                    let fee = 0
                    if(orderMethodEntry == 'limit') {                        
                        fee += parseFloat(marketInfo.makerFee)
                    } else {
                        fee += parseFloat(marketInfo.takerFee)
                    }
                    if(orderMethodExit == 'limit' && checkStopLoss !== true ) {                        
                        fee += parseFloat(marketInfo.makerFee)
                    } else {
                        fee += parseFloat(marketInfo.takerFee)
                    }
                    //console.log('fee',marketInfo,fee)
                    if(isNaN(fee) !== true) {                    
                        algorithm.current.fees = 0-((fee))
                    }
                    
                // CALCULATE FINAL PNL WITH FEES REMOVED   
                    algorithm.current.pnl = parseFloat(pnl + algorithm.current.fees)
                   // console.log(algorithm.current.currentPolicy,algorithm.current.pnl,pnl,algorithm.current.fees,algorithm.current.exitPrice - algorithm.current.entryPrice)
                    algorithm.current.gross = parseFloat(pnl)
                // ADD PNL TO ALGORITHM TOTAL PNL    
                    algorithm.pnl += algorithm.current.pnl
                    algorithm.gross += parseFloat(pnl)
                    algorithm.fees += algorithm.current.fees
                    //console.log('PNL',algorithm.current.pnl)

                // SAVE THIS DATA POINT FOR REFERENCE                    
                    algorithm.current.exitData.push(data[y])

                // COUNT SUCCESS AND STOP LOSS TRADES    
                    algorithm.trades ++;
                    if(algorithm.current.pnl > 0) algorithm.successTrades ++;        
                    if(algorithm.current.pnl < 0 && checkStopLoss === true) {            
                        algorithm.stopLossTrades ++;
                    }        
                // CALCULATE ACCURACY         
                    algorithm.accuracy = parseInt(parseFloat(algorithm.successTrades / algorithm.trades * 100).toFixed(0))
                    
                    if(algorithm.avgDrawdown != 0) {                        
                        algorithm.avgDrawdown = (parseFloat(algorithm.avgDrawdown) + parseFloat(algorithm.current.drawdown)) / 2    
                    } else {
                        algorithm.avgDrawdown =  parseFloat(algorithm.current.drawdown)
                    }

                // ADD DATA TO HTML     
                    if(algorithm.current.currentPolicy == 'BUY') {
                        data[y].html = {
                            above:'<span style="font-size: 12px; color: #ED5565;"><i class="fas fa-chevron-circle-down"></i><span>'
                        }
                    } else {

                        data[y].html = {
                            below:'<span style="font-size: 12px; color: #2BA84A;"><i class="fas fa-chevron-circle-up"></i></span>'   
                        }
                    }



                // SAVE FINISHED TRADE TO HISTORY
                    algorithm.history.push(algorithm.current)
                // RESET CURRENT READY FOR NEW ENTRY  
                    algorithm.current = {}


                }

            }

        }
    }
    //if(entryConditions.length > 0 && (exitConditions.length > 0 || algorithm.stopLoss != '')) {        
    // DISPLAY RESULTS ON PAGE    
        $('.algorithmResults .pnl').html(algorithm.pnl.toFixed(2)+'%')     
        $('.algorithmResults .gross').html(algorithm.gross.toFixed(2)+'%') 
        $('.algorithmResults .fees').html(algorithm.fees.toFixed(2)+'%') 
        $('.algorithmResults .trades').html(algorithm.trades) 
        $('.algorithmResults .successTrades').html(algorithm.successTrades) 
        $('.algorithmResults .stopLossTrades').html(algorithm.stopLossTrades)     
        $('.algorithmResults .accuracy').html(algorithm.accuracy+'%') 
        $('.algorithmResults .maxDrawdown').html(algorithm.maxDrawdown.toFixed(2)+'%') 
        $('.algorithmResults .avgDrawdown').html(algorithm.avgDrawdown.toFixed(2)+'%') 
    
        
    // DISPLAY LOG OF ALGORITHM TRADES    
        displayAlgorithmLog(currencySymbol,decimalPlaces)
    // LOAD GRAPH WITH ENTRY AND EXIT POINTS    
        loadGraph(exchPairID)    
    //}
        
}
*/
