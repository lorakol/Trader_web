
function calculateMarketSignalsFull(exchPairID) {

    let len = signalDataHistory[exchPairID].length
    for (let i = 0; i < len; i++) {         
        calculateMarketSignals(exchPairID,signalDataHistory[exchPairID][i])
    }
}



function calculateMarketSignals(exchPairID,data,updateDisplay) {
    
    if(!exchPairID || !signalData[exchPairID] || signalData[exchPairID].score === undefined || signalData[exchPairID].scoreAvg === undefined) {
        //console.log('NO DATA',data)
        return 
    }
   
/*        
        
        let scoreAvg2min = signalData[exchPairID].scoreAvg["2min"]
        let scoreAvg5min = signalData[exchPairID].scoreAvg["5min"]    
        let scoreAvg10min = signalData[exchPairID].scoreAvg["10min"]
        let scoreAvg30min = signalData[exchPairID].scoreAvg["30min"]    
        let scoreAvg1h = signalData[exchPairID].scoreAvg["1h"]
        let scoreAvg2h = signalData[exchPairID].scoreAvg["2h"]
        let scoreAvg4h = signalData[exchPairID].scoreAvg["4h"]*/
//        let volumeFactor1min = signalData[exchPairID].volumeFactor.T1
//        let trendAvg2min = signalData[exchPairID].indicatorScoreAvg["2min"]
//        let trendAvg5min = signalData[exchPairID].indicatorScoreAvg["5min"]
//        let trendAvg10min = signalData[exchPairID].indicatorScoreAvg["10min"]
//        let volumeScore = signalData[exchPairID].volumeScore
//        let volumeScoreAvg1min = signalData[exchPairID].volumeScoreAvg["1min"]
    let score = signalData[exchPairID].score
    let scoreAvg1min = signalData[exchPairID].scoreAvg["1min"]
    let scoreAvg5min = signalData[exchPairID].scoreAvg["5min"]
    let scoreAvg1h = signalData[exchPairID].scoreAvg["1h"]
    let orderBookScore = signalData[exchPairID].orderBookScore
    let orderBookScore1minAvg = signalData[exchPairID].orderBookScoreAvg["1min"]
    let orderBookScore5minAvg = signalData[exchPairID].orderBookScoreAvg["5min"]
    let orderBookScore1hAvg = signalData[exchPairID].orderBookScoreAvg["1h"]

    let orderBook05Price = signalData[exchPairID].orderBookLevels["0.5"].price
    let orderBook1Price = signalData[exchPairID].orderBookLevels["1"].price

    let trend = signalData[exchPairID].indicatorScore
    let trendAvg1min = signalData[exchPairID].indicatorScoreAvg["1min"]
    let trendAvg5min = signalData[exchPairID].indicatorScoreAvg["5min"]
    let trendAvg1h = signalData[exchPairID].indicatorScoreAvg["1h"]
    let trendAvg2h = signalData[exchPairID].indicatorScoreAvg["2h"]
    let volumeFactorScore = signalData[exchPairID].volumeFactorScore

    let ATR = signalData[exchPairID].ATR["5min"]


    let entryIndicator = 'HOLD'
    let exitIndicator = 'HOLD'
    let stopIndicator = 'HOLD'
    let takeProfitIndicator = 'HOLD'

    //ATR - For Money and trade management
    //Baseline - 21 Period exponential moving average
    //1st Confirmation - absolute strength oscillator
    //2nd Confirmation - Wadda Attar Explosion
    //Volume - Wadda Attar Explosion
    //Exit - Absolute strength & moving average

    // VOLUME BASELINE 
    let volumeBaselineIndicator = 'HOLD'
    let baseLineSlowIndicator = 'HOLD'
    let baseLineIndicator = 'HOLD'


    if(signalData[exchPairID].askPrice >= signalData[exchPairID].lastPriceAvg["24h"]) {            
        baseLineSlowIndicator = 'BUY'
    } else {
        baseLineSlowIndicator = 'SELL'
    }    
    if(signalData[exchPairID].askPrice >= signalData[exchPairID].lastPriceAvg["2h"]) {                        
    //  if(signalData[exchPairID].askPrice >=  signalData[exchPairID].lastPriceAvg["5min"]) {
        baseLineIndicator = 'BUY'
    //   }             
    } else {
    //   if(signalData[exchPairID].askPrice <=  signalData[exchPairID].lastPriceAvg["5min"]) {
        baseLineIndicator = 'SELL'
    //   }
    } 
    let baseLineFastIndicator = 'HOLD'
    if(signalData[exchPairID].askPrice >= signalData[exchPairID].lastPriceAvg["10min"]) {            
        baseLineFastIndicator = 'BUY'
    } else {
        baseLineFastIndicator = 'SELL'
    }     
    if(signalData[exchPairID].volumeFactorScoreAvg["1min"] > 0) {                        
        takeProfitIndicator = 'BUY'
    } else {
        takeProfitIndicator = 'SELL'
    }    
    let trendIndicator = 'HOLD'
    if(trend >= trendAvg1min) {
    if(trend >= 0) {
        trendIndicator = 'BUY'
    }            
    } else {
        if(trend <= 0) {
        trendIndicator = 'SELL'
        }
    }
    let trendSlowIndicator = 'HOLD'
    if(trendAvg1min >= trendAvg1h) {
    if(trend >= 0) {
        trendSlowIndicator = 'BUY'
        }            
    } else {
    if(trend <= 0) {
        trendSlowIndicator = 'SELL'
    }
    }
    
    let orderBookIndicator = 'HOLD'        
    if(signalData[exchPairID].orderBookScoreAvg["15s"] >= 15 && signalData[exchPairID].orderBookScoreAvg["1min"] >= 20 && signalData[exchPairID].orderBookScoreAvg["2min"] >= 20) {
        orderBookIndicator = 'BUY'
    }
    if(signalData[exchPairID].orderBookScoreAvg["15s"] <= -15 && signalData[exchPairID].orderBookScoreAvg["1min"] <= -20 && signalData[exchPairID].orderBookScoreAvg["2min"] <= -20) {
        orderBookIndicator = 'SELL'
    }
    let orderBookSlowIndicator = 'HOLD'
    //if(signalData[exchPairID].orderBookScoreAvg["1min"] >= signalData[exchPairID].orderBookScoreAvg["10min"]) {
    if(signalData[exchPairID].orderBookScoreAvg["10min"] > 0 || signalData[exchPairID].orderBookScoreAvg["15s"] > 35) {
        orderBookSlowIndicator = 'BUY'
    }
//} else {
    if(signalData[exchPairID].orderBookScoreAvg["10min"] < 0 || signalData[exchPairID].orderBookScoreAvg["15s"] < -35) {
        orderBookSlowIndicator = 'SELL'
    }
    //}                    
    let volumeIndicator = 'HOLD'
    if(signalData[exchPairID].volumeFactorScoreAvg["15s"] >= -0.15 && signalData[exchPairID].volumeFactorScoreAvg["30s"] >= 0 && signalData[exchPairID].volumeFactorScoreAvg["1min"] >= 0) {    
            volumeIndicator = 'BUY'               
    } 
    if(signalData[exchPairID].volumeFactorScoreAvg["15s"] <= 0.15 &&  signalData[exchPairID].volumeFactorScoreAvg["30s"] <= 0 &&  signalData[exchPairID].volumeFactorScoreAvg["1min"] <= 0) {    
            volumeIndicator = 'SELL'    
    }
    if(signalData[exchPairID].volumeFactorScoreAvg["15s"] > -0.15 && signalData[exchPairID].orderBookScoreAvg["15s"] > 40) {
        volumeIndicator = 'BUY'
    }
//} else {
    if(signalData[exchPairID].volumeFactorScoreAvg["15s"] < 0.15 && signalData[exchPairID].orderBookScoreAvg["15s"] < -40) {
        volumeIndicator = 'SELL'
    }  

    //if(signalData[exchPairID].volumeFactorScoreAvg["1min"] >= 0 && signalData[exchPairID].volumeFactorScoreAvg["2min"] >= 0) {                
    if(signalData[exchPairID].volumeFactorScoreAvg["15s"] >= signalData[exchPairID].volumeFactorScoreAvg["1h"]) {
        volumeBaselineIndicator = 'BUY'
    } else {
        volumeBaselineIndicator = 'SELL'
    }                    
    //}  
//    if(signalData[exchPairID].volumeFactorScoreAvg["1min"] <= 0 && signalData[exchPairID].volumeFactorScoreAvg["2min"] <= 0 && signalData[exchPairID].volumeFactorScoreAvg["1min"] <= signalData[exchPairID].volumeFactorScoreAvg["10min"]) {            
                        
//    }
                    
    let scoreIndicator = 'HOLD'
    if(signalData[exchPairID].scoreAvg["15s"] >= 0 && signalData[exchPairID].scoreAvg["1min"] >= 0 && signalData[exchPairID].scoreAvg["15s"] >= signalData[exchPairID].scoreAvg["1min"]) {
        if(score >= 0) {
            scoreIndicator = 'BUY'            
        }
    } 
    if(signalData[exchPairID].scoreAvg["15s"] <= 0 && signalData[exchPairID].scoreAvg["1min"] <= 0 && signalData[exchPairID].scoreAvg["15s"] <= signalData[exchPairID].scoreAvg["1min"]) {
        if(score <= 0) {
            scoreIndicator = 'SELL'
        }
    }
    let scoreSlowIndicator = 'HOLD'
    if(signalData[exchPairID].scoreAvg["1min"] >= scoreAvg1h) {
        if(score >= 0) {
            scoreSlowIndicator = 'BUY'            
        }
    } else {
        if(score <= 0) {
            scoreSlowIndicator = 'SELL'
        }
    }        
    let orderBookPriceIndicator = 'HOLD'
    if(signalData[exchPairID].askPrice <= orderBook05Price && signalData[exchPairID].askPrice <= orderBook1Price) {
        orderBookPriceIndicator = 'BUY'
    } 
    if(signalData[exchPairID].askPrice >= orderBook05Price && signalData[exchPairID].askPrice >= orderBook1Price) { 
        orderBookPriceIndicator = 'SELL'
    }
    // CALCULATE THAT PRICE IS WITHIN ATR RANGE TO SIGNAL AN ENTRY 
    let inATRRange = checkInATRRange(exchPairID,"5min","5min",volumeIndicator)       

    // IF ALL INDICATORS MATCH THEN ENTRY SIGNAL IS ACTIVE 
    /* if(inATRRange && orderBookSlowIndicator == volumeIndicator && volumeIndicator == volumeBaselineIndicator && volumeBaselineIndicator == baseLineSlowIndicator && volumeBaselineIndicator == baseLineIndicator && trendIndicator == volumeBaselineIndicator) {
    entryIndicator = baseLineIndicator
    }         */
    /* 
    if(inATRRange && orderBookIndicator == orderBookSlowIndicator && volumeIndicator == orderBookIndicator && orderBookPriceIndicator == orderBookIndicator) {
        entryIndicator = orderBookIndicator
    }       */

    if(inATRRange && volumeBaselineIndicator == volumeIndicator && volumeIndicator == orderBookPriceIndicator && orderBookIndicator == orderBookPriceIndicator && orderBookSlowIndicator == orderBookPriceIndicator) {
        entryIndicator = orderBookPriceIndicator
    }      
        
    // VOLATILITY OVERRIDE    
    let volatilityIndicator = 'HOLD'
    if(signalData[exchPairID].volumeFactorScoreAvg["15s"] < -2 || signalData[exchPairID].volumeFactorScoreAvg["15s"] > 2) {
    if(signalData[exchPairID].volumeFactorScoreAvg["15s"] > 2 && signalData[exchPairID].volumeFactorScoreAvg["15s"] >= signalData[exchPairID].volumeFactorScoreAvg["1min"]*3) {
      //  entryIndicator = 'HOLD'
        volatilityIndicator = 'BUY'
    }
    if(signalData[exchPairID].volumeFactorScoreAvg["15s"] < -2 && signalData[exchPairID].volumeFactorScoreAvg["15s"] <= signalData[exchPairID].volumeFactorScoreAvg["1min"]*3) {
     //   entryIndicator = 'HOLD'
        volatilityIndicator = 'SELL'
    }
    }
    // TAKE PROFIT IS VOLUME INDICATOR 
    if(signalData[exchPairID].volumeFactorScoreAvg["15s"] < 0) takeProfitIndicator = 'SELL'
    if(signalData[exchPairID].volumeFactorScoreAvg["15s"] > 0) takeProfitIndicator = 'BUY'


// EXIT INDICATOR IS TREND INDICATOR 
        exitIndicator = volumeIndicator

/*     if(signalData[exchPairID].askPrice >= signalData[exchPairID].lastPriceAvg["24h"]) {
    if(entryIndicator == 'BUY') stopIndicator = 'BUY'
} else {    
    if(entryIndicator == 'SELL') stopIndicator = 'SELL'
} */
    



        signalData[exchPairID].scoreIndicator = scoreIndicator
        signalData[exchPairID].scoreSlowIndicator = scoreSlowIndicator
        signalData[exchPairID].volatilityIndicator = volatilityIndicator
        signalData[exchPairID].trendSlowIndicator = trendSlowIndicator
        signalData[exchPairID].orderBookIndicator = orderBookIndicator
        signalData[exchPairID].orderBookSlowIndicator = orderBookSlowIndicator
        signalData[exchPairID].volumeIndicator = volumeIndicator
        signalData[exchPairID].volumeBaselineIndicator = volumeBaselineIndicator
        signalData[exchPairID].baseLineIndicator = baseLineIndicator
        signalData[exchPairID].baseLineFastIndicator = baseLineFastIndicator
        signalData[exchPairID].baseLineSlowIndicator = baseLineSlowIndicator
        signalData[exchPairID].orderBookPriceIndicator = orderBookPriceIndicator
        signalData[exchPairID].inATRRange = inATRRange
        signalData[exchPairID].orderBookPriceIndicator = orderBookPriceIndicator
    
        signalData[exchPairID].entryIndicator = entryIndicator
        signalData[exchPairID].takeProfitIndicator = takeProfitIndicator
        signalData[exchPairID].exitIndicator = exitIndicator
        signalData[exchPairID].stopIndicator = stopIndicator
    
    if(!updateDisplay) console.log('updating Full',entryIndicator)
    if(updateDisplay) {
        
        //console.log('UPDATED DISPLAY',data.entryIndicator)
        
        let col = '#2BA84A'
        if(entryIndicator == 'HOLD') col = '#000'
        if(entryIndicator == 'SELL') col = '#ED5565'
        $('.entryIndicator span').html(entryIndicator).css("background-color",col)
        col = '#2BA84A'
        if(takeProfitIndicator == 'HOLD') col = '#000'
        if(takeProfitIndicator == 'SELL') col = '#ED5565'    
        $('.takeProfitIndicator span').html(takeProfitIndicator).css("background-color",col)
        col = '#2BA84A'
        if(exitIndicator == 'HOLD') col = '#000'
        if(exitIndicator == 'SELL') col = '#ED5565'    
        $('.exitIndicator span').html(exitIndicator).css("background-color",col)
        col = '#2BA84A'
        if(stopIndicator == 'HOLD') col = '#000'
        if(stopIndicator == 'SELL') col = '#ED5565'    
        $('.stopIndicator span').html(stopIndicator).css("background-color",col)    
    
        col = '#2BA84A'
        if(scoreIndicator == 'HOLD') col = '#000'
        if(scoreIndicator == 'SELL') col = '#ED5565'
        $('.scoreIndicator span').html(scoreIndicator).css("background-color",col)
        col = '#2BA84A' 
        if(scoreSlowIndicator == 'HOLD') col = '#000'
        if(scoreSlowIndicator == 'SELL') col = '#ED5565'
        $('.scoreSlowIndicator span').html(scoreSlowIndicator).css("background-color",col)  
        col = '#2BA84A' 
        if(volatilityIndicator == 'HOLD') col = '#000'    
        if(volatilityIndicator == 'SELL') col = '#ED5565'
        $('.volatilityIndicator span').html(volatilityIndicator).css("background-color",col)  
        col = '#2BA84A' 
        if(trendIndicator == 'HOLD') col = '#000'    
        if(trendIndicator == 'SELL') col = '#ED5565'
        $('.trendIndicator span').html(trendIndicator).css("background-color",col)  
        col = '#2BA84A' 
        if(trendSlowIndicator == 'HOLD') col = '#000'    
        if(trendSlowIndicator == 'SELL') col = '#ED5565'
        $('.trendSlowIndicator span').html(trendSlowIndicator).css("background-color",col)  
        col = '#2BA84A' 
        if(orderBookIndicator == 'HOLD') col = '#000'    
        if(orderBookIndicator == 'SELL') col = '#ED5565'
        $('.orderBookIndicator span').html(orderBookIndicator).css("background-color",col)  
        col = '#2BA84A' 
        if(orderBookSlowIndicator == 'HOLD') col = '#000'
        if(orderBookSlowIndicator == 'SELL') col = '#ED5565'
        $('.orderBookSlowIndicator span').html(orderBookSlowIndicator).css("background-color",col)  
        col = '#2BA84A' 
        if(volumeIndicator == 'HOLD') col = '#000'
        if(volumeIndicator == 'SELL') col = '#ED5565'
        $('.volumeIndicator span').html(volumeIndicator).css("background-color",col)  
        col = '#2BA84A' 
        if(volumeBaselineIndicator == 'HOLD') col = '#000'    
        if(volumeBaselineIndicator == 'SELL') col = '#ED5565'
        $('.volumeBaselineIndicator span').html(volumeBaselineIndicator).css("background-color",col)  
        col = '#2BA84A' 
        if(baseLineIndicator == 'HOLD') col = '#000'    
        if(baseLineIndicator == 'SELL') col = '#ED5565'
        $('.baseLineIndicator span').html(baseLineIndicator).css("background-color",col)  
        col = '#2BA84A' 
        if(baseLineFastIndicator == 'HOLD') col = '#000'    
        if(baseLineFastIndicator == 'SELL') col = '#ED5565'
        $('.baseLineFastIndicator span').html(baseLineFastIndicator).css("background-color",col)  
        col = '#2BA84A' 
        if(baseLineSlowIndicator == 'HOLD') col = '#000'    
        if(baseLineSlowIndicator == 'SELL') col = '#ED5565'
        $('.baseLineSlowIndicator span').html(baseLineSlowIndicator).css("background-color",col) 
        col = '#2BA84A' 
        if(orderBookPriceIndicator == 'HOLD') col = '#000'    
        if(orderBookPriceIndicator == 'SELL') col = '#ED5565'
        $('.orderBookPriceIndicator span').html(orderBookPriceIndicator).css("background-color",col) 
    
    
        col = '#2BA84A'
        if(volumeIndicator == 'HOLD') col = '#000'
        if(volumeIndicator == 'SELL') col = '#ED5565'       
        if(!inATRRange) {            
            inATRRange = 'false'
        }        
        $('.inATRRange span').html(inATRRange).css("background-color",col)   
        
    }
             
            
}


function checkInATRRange(exchPairID,avgPricePeriod,ATRPeriod,orderType) {
    if(!exchPairID || !signalData[exchPairID] || !signalData[exchPairID].ATR || !signalData[exchPairID].ATR[ATRPeriod]) {
        return 
    }    
    let ATR = signalData[exchPairID].ATR[ATRPeriod]
    // CALCULATE THAT PRICE IS WITHIN ATR RANGE TO SIGNAL AN ENTRY 
    let inATRRange = false        
    let distanceFromAvgPrice = 0
    if(orderType == 'BUY' || !orderType) {
        distanceFromAvgPrice = signalData[exchPairID].bidPrice - signalData[exchPairID].lastPriceAvg[avgPricePeriod] 
    } 
    if(orderType == 'SELL') {
        distanceFromAvgPrice = signalData[exchPairID].askPrice - signalData[exchPairID].lastPriceAvg[avgPricePeriod] 
    }
    
    if(distanceFromAvgPrice < 0) distanceFromAvgPrice = 0 - distanceFromAvgPrice        
    if(distanceFromAvgPrice < ATR) inATRRange = true
    return inATRRange
}
