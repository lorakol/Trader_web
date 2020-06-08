function loadGraph(exchPairID) {
    
    console.log('LOAD GRAPH ->',exchPairID,signalData[exchPairID])    
    
    if(isNaN(parseFloat(exchPairID)) === true) {
        exchPairID = $('#marketExchPairID').val() 
    }
    if(isNaN(parseFloat(exchPairID)) === true) {
        alert('ALERT! Missing an Exchange Pair ID!');
        return
    }
    if(signalData[exchPairID] === undefined || signalData[exchPairID].decimalPlaces === undefined) {
        console.log('NO GRAPH DATA ->',signalData[exchPairID])
        return;
    }

  let decimalPlaces = signalData[exchPairID].decimalPlaces;
  let pipAmount = signalData[exchPairID].pipAmount;
  let strokeWidth = 1.5;
  let graphDiv = '#miniMarketGraph' + exchPairID;
  let inputKey1 = $('#inputKey1').val();
  if (inputKey1 === undefined || inputKey1 === null || inputKey1 == '') inputKey1 = 'lastPrice';
  let inputKey2 = $('#inputKey2').val();
  if (inputKey2 === undefined || inputKey2 == '') inputKey2 = 'None';
  let inputKey3 = $('#inputKey3').val();
  if (inputKey3 === undefined || inputKey3 === null || inputKey3 == '') inputKey3 = 'None';    
  let inputKey4 = $('#inputKey4').val();
  if (inputKey4 === undefined || inputKey4 == '') inputKey4 = 'None';
  let bandsValue = 0 //signalData[exchPairID].ATR['10min']
  
  // CHANGE DROP DOWN FOR ABSOLUTE VALES FOR VOLATILTY
  if(inputKey3.indexOf('volumeFactor') > -1) {
      $('#inputKey3MinPercent').hide()   
      $('#inputKey3MinVolumeFactor').show()
  } else {
      $('#inputKey3MinVolumeFactor').hide()
      $('#inputKey3MinPercent').show()      
  }
    
  
  
  let graphSize = 'small';
// SHOW LARGER GRAPH     
  if ($(window).innerWidth() > 754 && $('#marketGraph').length > 0) {
    graphDiv = '#marketGraph';
    strokeWidth = 2;
    graphSize = 'large';
  }
 //   console.log('graphSize',graphSize,$('#marketGraph').length)


    console.log('START GRAPH ->',exchPairID,signalData[exchPairID])
// SHOW WALLS DATA
    let displayWalls = false
    if ($('#displayWalls').is(':checked') === true || graphSize == 'small') {
         displayWalls = true;
    }
    let showWallsData = false;
    if ($('#showWallsData').is(':checked') === true) {
         showWallsData = true;
    }
// PENDING    
    let displayLastPrice = true

  const parseTime = d3.timeParse('%d-%b-%y');
  const bisectDate = d3.bisector(d => d.T).left;
  const formatValue = d3.format('.' + decimalPlaces + 'f')
  const formatCurrency = d => formatValue(d);

  D3_MARKET_CHART[exchPairID] = {
    selector: graphDiv,

    data: null,
    svg: null,
    mainGroup: null,
    scaleX: null,
    scaleY: null,
    lastMousePosition: [0, 0],

    options: {
      width: null,
      height: null,
      margins: {
        top: 3,
        right: 70,
        bottom: 21,
        left: 8,
      },
      scaleYTopAddition:signalData[exchPairID].scaleYAddTop,
      scaleYBottomAddition:signalData[exchPairID].scaleYAddBottom,
      gradientMin:-100,
      gradientMax:100,    
    },


    redraw: function() {
      this.init();

      this.draw();
    },

    init: function() {
      var el = d3.select(this.selector);
      if (el.empty()) {
        console.warn('init(): Element for "' + this.selector + '" selector not found');
        return;
      }

      d3.select(window).on('resize', this.resize);

      var elRect = el.node().getBoundingClientRect();

      this.options.width = elRect.width;
      this.options.height = elRect.height;

      this.scaleX = d3.scaleTime().
          rangeRound([0, this.options.width - this.options.margins.left - this.options.margins.right]);
      this.scaleY = d3.scaleLinear().
          rangeRound([this.options.height - this.options.margins.top - this.options.margins.bottom, 0]);

      this.clearChart();

      console.log(
          'INITIALISED ' + signalData[exchPairID].exchSymbol + ' (' + exchPairID + ') D3_MARKET_CHART v' + d3.version+' SIZE : '+graphSize);

      this.svg = el.append('svg').
          attr('xmlns', 'http://www.w3.org/2000/svg').
          attr('xmlns:xhtml', 'http://www.w3.org/1999/xhtml').
          attr('width', this.options.width).
          attr('height', this.options.height).
          on('click', function() {
            // console.log('onClickSvg');
          });
      this.svg.append('rect').
          attr('class', 'background-rect').
          attr('width', '100%').
          attr('height', '100%').
          attr('fill', '#000');

      this.mainGroup = this.svg.append('g').
          attr('transform', 'translate(' + this.options.margins.left + ',' + this.options.margins.top + ')');

      this.mainGroup.append('rect').
          attr('x', 0).
          attr('y', 0).
          attr('width', this.options.width - this.options.margins.left - this.options.margins.right).
          attr('height', this.options.height - this.options.margins.top - this.options.margins.bottom)
          // .style("stroke", "black") // STYLE/COLOUR OF AXES
          // .style("stroke-width", 0)
          //  .style("opacity", 1)
          .attr('clip-path', 'url(#clip)').
          style('fill', 'url(#linear-gradient' + exchPairID + ')');

      this.mainGroup.append('g').attr('class', 'axis x');
      this.mainGroup.append('g').attr('class', 'axis y');

// DISPLAY WALLS ON GRAPH        
      if(displayWalls === true) {
          var walls = this.mainGroup.append('g').attr('class', 'order-book-walls');
          var walls = this.mainGroup.append('use').attr('class', 'order-book-walls-use');
      }

// DISPLAY LINES FROM DATA SOURCES ON GRAPH        
      this.mainGroup.append('path').attr('class', 'data inputKey1');
      if (inputKey2 != 'None') {
        this.mainGroup.append('path').attr('class', 'data inputKey2');
      }
      if (inputKey4 != 'None') {
        let bands = this.mainGroup.append('g').attr('class', 'inputKey4-bands');
        bands.append("path").attr("class", "line-bands-low");
        bands.append("path").attr("class", "line-bands-high");
        bands.append("path").attr("class", "area-bands");
        this.mainGroup.append('path').attr('class', 'data inputKey4');
      }

      if(displayLastPrice === true) {
              let zerolineGroup = this.mainGroup.append('g').attr('class', 'zeroline-g');
              zerolineGroup.append('line').attr('class', 'zeroline');
              zerolineGroup.append('rect').attr('class', 'zeroline-rect');
              zerolineGroup.append('text').attr('dy', '5px').attr('dx', '4px').attr('class', 'zerolinetext');              
          
      }
      this.mainGroup.append('g').attr('class', 'points-html');

      this.mainGroup.append('defs').
          append('clipPath').
          attr('id', 'clip').
          append('rect').
          attr('width', this.options.width - this.options.margins.left - this.options.margins.right).
          attr('height', this.options.height - this.options.margins.top - this.options.margins.bottom);

      var linearGradient = this.mainGroup.select('defs').
          append('linearGradient').
          attr('id', ('linear-gradient' + exchPairID));
      ///////////////////////
      ///////////////////////
      if (graphSize == 'large') {

      //  console.log('SHOWING LARGE GRAPH ' + signalData[exchPairID].exchSymbol + ' (' + exchPairID + ')');

        const focus = this.svg.append('g').attr('class', 'focus').style('display', 'none').style('opacity', 1);

        focus.append('circle').attr('r', 4.5);

        focus.append('line').classed('x', true).style('fill', 'none').style('stroke', 'white');

        focus.append('line').classed('y', true);

        focus.append('rect').
            attr('class', 'focus-rect-x').
            attr('width', 55).
            attr('height', this.options.margins.bottom).
            attr('fill', '#fff');
        focus.append('text').attr('class', 'focus-text-x').attr('fill', '#000').attr('dy', '-.4em').attr('dx', '4px').style("font-size", "11px");
        focus.append('rect').
            attr('class', 'focus-rect-x-2').
            attr('width', 55).
            attr('height', this.options.margins.bottom).
            attr('fill', '#fff');
        focus.append('text').attr('class', 'focus-text-x-2').attr('fill', '#000').attr('dy', '-.4em').attr('dx', '4px').style("font-size", "11px");
        focus.append('rect').
            attr('class', 'focus-rect-y').
            attr('width', this.options.margins.right).
            attr('height', 20).
            attr('fill', '#fff');
        focus.append('text').attr('class', 'focus-text-y').attr('fill', '#000').attr('dy', '.4em').attr('dx', '4px').style("font-size", "11px");

        this.svg.append('rect').
            attr('class', 'overlay').
            // .style('opacity', 0.1)
            attr('width', this.options.width).
            attr('height', this.options.height).
            style('fill', 'none').
            style('pointer-events', 'all').
            on('mouseover', () => focus.style('display', null)).
            on('mouseout', () => focus.style('display', 'none')).
            on('mousemove', this.mousemove.bind(this));

        d3.selectAll('.focus line').
            style('fill', 'none').
            style('stroke', 'white').
            style('stroke-width', '1px').
            style('stroke-dasharray', '3 3');

        var self = this;
        //const x = d3.scaleTime().rangeRound([0, this.options.width - this.options.margins.left - this.options.margins.right]);
        //const y = d3.scaleLinear().rangeRound([this.options.height-this.options.margins.top-this.options.margins.bottom, 0]);

// DISPLAY MORE OF Y AXIS UP AND DOWN          
    let marketArea = d3.select($(el.node()).closest('.marketArea').get(0));
    marketArea.select('.resetY').on('click', function(){
      self.options.scaleYTopAddition = 0
      signalData[exchPairID].scaleYAddTop = self.options.scaleYTopAddition
      self.options.scaleYBottomAddition = 0
      signalData[exchPairID].scaleYAddBottom = self.options.scaleYBottomAddition        
      updateGraph(exchPairID);
    });
    marketArea.select('.addTopToY').on('click', function(){
      self.options.scaleYTopAddition += 0.25
      signalData[exchPairID].scaleYAddTop = self.options.scaleYTopAddition
      self.options.scaleYBottomAddition -= 0.25
      signalData[exchPairID].scaleYAddBottom = self.options.scaleYBottomAddition        
      updateGraph(exchPairID);
    });
    marketArea.select('.addBottomToY').on('click', function() {
      self.options.scaleYTopAddition -= 0.25
      if(self.options.scaleYTopAddition < 0) self.options.scaleYTopAddition = 0
      signalData[exchPairID].scaleYAddTop = self.options.scaleYTopAddition        
      self.options.scaleYBottomAddition += 0.25
      if(self.options.scaleYBottomAddition > 0) self.options.scaleYBottomAddition = 0
      signalData[exchPairID].scaleYAddBottom = self.options.scaleYBottomAddition
      updateGraph(exchPairID);
    });    marketArea.select('.addTopToY').on('dblclick', function(){
      self.options.scaleYTopAddition += 1
      signalData[exchPairID].scaleYAddTop = self.options.scaleYTopAddition
      self.options.scaleYBottomAddition -= 1
      signalData[exchPairID].scaleYAddBottom = self.options.scaleYBottomAddition        
      updateGraph(exchPairID);
    });
    marketArea.select('.addBottomToY').on('dblclick', function() {
      self.options.scaleYTopAddition -= 1
      if(self.options.scaleYTopAddition < 0) self.options.scaleYTopAddition = 0
      signalData[exchPairID].scaleYAddTop = self.options.scaleYTopAddition        
      self.options.scaleYBottomAddition += 1
      if(self.options.scaleYBottomAddition > 0) self.options.scaleYBottomAddition = 0
      signalData[exchPairID].scaleYAddBottom = self.options.scaleYBottomAddition
      updateGraph(exchPairID);
    });
          
          //marketArea.select('.decreaseY').on('click', () => self.options.scaleYBottomAddition -= 0.1);

// TAKE SCREENSHOT

    // Set-up the export button
    d3.select('#takeScreen').on('click', function(){
        var svgString =  getSVGString(self.svg.node());
        svgString2Image( svgString, 2*self.options.width, 2*self.options.height, 'png', save ); // passes Blob and filesize String to the callback

        function save( dataBlob, filesize ){
            saveAs( dataBlob, 'KoinWatchDashboard-'+formatDateTime(new Date()).replace(' ','-').replace(':','_')+'.png' ); // FileSaver.js function
        }
    });
    // Below are the functions that handle actual exporting:
    // getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
        function getSVGString( svgNode ) {
            svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
            var cssStyleText = getCSSStyles( svgNode );
            appendCSS( cssStyleText, svgNode );

            var serializer = new XMLSerializer();
            var svgString = serializer.serializeToString(svgNode);
            svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
            svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

            return svgString;

            function getCSSStyles( parentElement ) {
                var selectorTextArr = [];

                // Add Parent element Id and Classes to the list
                selectorTextArr.push( '#'+parentElement.id );
                for (var c = 0; c < parentElement.classList.length; c++)
                        if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
                            selectorTextArr.push( '.'+parentElement.classList[c] );

                // Add Children element Ids and Classes to the list
                var nodes = parentElement.getElementsByTagName("*");
                for (var i = 0; i < nodes.length; i++) {
                    var id = nodes[i].id;
                    if ( !contains('#'+id, selectorTextArr) )
                        selectorTextArr.push( '#'+id );

                    var classes = nodes[i].classList;
                    for (var c = 0; c < classes.length; c++)
                        if ( !contains('.'+classes[c], selectorTextArr) )
                            selectorTextArr.push( '.'+classes[c] );
                }

                // Extract CSS Rules
                var extractedCSSText = "";
                for (var i = 0; i < document.styleSheets.length; i++) {
                    var s = document.styleSheets[i];

                    try {
                        if(!s.cssRules) continue;
                    } catch( e ) {
                            if(e.name !== 'SecurityError') throw e; // for Firefox
                            continue;
                        }

                    var cssRules = s.cssRules;
                    for (var r = 0; r < cssRules.length; r++) {
                        if ( contains( cssRules[r].selectorText, selectorTextArr ) )
                            extractedCSSText += cssRules[r].cssText;
                    }
                }


                return extractedCSSText;

                function contains(str,arr) {
                    return arr.indexOf( str ) === -1 ? false : true;
                }

            }

            function appendCSS( cssText, element ) {
                var styleElement = document.createElement("style");
                styleElement.setAttribute("type","text/css");
                styleElement.innerHTML = cssText;
                var refNode = element.hasChildNodes() ? element.children[0] : null;
                element.insertBefore( styleElement, refNode );
            }
        }


        function svgString2Image( svgString, width, height, format, callback ) {
            var format = format ? format : 'png';

            var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");

            canvas.width = width;
            canvas.height = height;

            var image = new Image();
            image.onload = function() {
                context.clearRect ( 0, 0, width, height );
                context.drawImage(image, 0, 0, width, height);

                canvas.toBlob( function(blob) {
                    var filesize = Math.round( blob.length/1024 ) + ' KB';
                    if ( callback ) callback( blob, filesize );
                });
            };

            image.src = imgsrc;
        }

        ///////////////////////
        ///////////////////////
      } else {
      //  console.log('SHOWING MINI GRAPH ' + signalData[exchPairID].exchSymbol + ' (' + exchPairID + ')');
      }
    },

    mousemove: function() {
      var self = this;
      let focus = self.svg.select('g.focus');
      const mouse = d3.event ? d3.mouse(d3.event.currentTarget) : self.lastMousePosition;
      self.lastMousePosition = mouse;
      let mouseX = d3.max([mouse[0], self.scaleX.range()[0] + self.options.margins.left]);
      mouseX = d3.min([mouseX, self.scaleX.range()[1] + self.options.margins.left]);
      let mouseY = d3.max([mouse[1], self.scaleY.range()[1] + self.options.margins.top]);
      mouseY = d3.min([mouseY, self.scaleY.range()[0] + self.options.margins.top]);
      const xVal = self.scaleX.invert(mouseX - self.options.margins.left);
      const yVal = self.scaleY.invert(mouseY - self.options.margins.top);

      focus.attr('transform',
          `translate(${mouseX}, ${mouseY})`);

      focus.select('line.x').
          attr('x1', -mouseX + self.options.margins.left).
          attr('x2', self.options.width - mouseX - self.options.margins.right).
          attr('y1', 0).
          attr('y2', 0);
      focus.select('line.y').
          attr('x1', 0).
          attr('x2', 0).
          attr('y1', -mouseY + self.options.margins.top).
          attr('y2', self.options.height - mouseY - self.options.margins.bottom);

      let xRect = focus.select('.focus-rect-x');
      xRect.attr('x', -xRect.node().getBBox().width / 2).
          attr('y', self.options.height - mouseY - xRect.node().getBBox().height);
      focus.select('.focus-text-x').
          attr('x', -xRect.node().getBBox().width / 2).
          attr('y', self.options.height - mouseY - self.options.margins.top).
          text(d3.timeFormat('%I:%M:%S')(xVal));

      const x0 = self.scaleX.invert(mouse[0] - self.options.margins.left);
      const i = bisectDate(self.data, x0, 1, self.data.length - 1);
      const d0 = self.data[i - 1];
      const d1 = self.data[i];
      const d = x0 - d0.T > d1.T - x0 ? d1 : d0;
      let xRect2 = focus.select('.focus-rect-x-2');
//      let inputKey3 = $('#inputKey3').val();
//      if (inputKey3 === undefined || inputKey3 === null || inputKey3 == '') inputKey3 = 'score';
      xRect2.attr('x', -xRect2.node().getBBox().width / 2).
          attr('y', -mouseY + self.options.margins.top);

      if(inputKey3 == 'None') {
          focus.select('.focus-text-x-2').
              attr('x', -xRect2.node().getBBox().width / 2).
              attr('y', -mouseY + self.options.margins.top + xRect2.node().getBBox().height).
              text('');    
      } else {
          focus.select('.focus-text-x-2').
              attr('x', -xRect2.node().getBBox().width / 2).
              attr('y', -mouseY + self.options.margins.top + xRect2.node().getBBox().height).
              text(getGraphDataPoint(d, inputKey3));          
      }

      let yRect = focus.select('.focus-rect-y');
      yRect.attr('x',
          self.options.width - mouseX - self.options.margins.right).
          attr('y', -yRect.node().getBBox().height / 2);
      focus.select('.focus-text-y').
          attr('x', self.options.width - mouseX - self.options.margins.right).
          attr('y', 0).
          text(formatCurrency(yVal));
      //         console.log(d3.mouse(d3.event.currentTarget),formatCurrency(d[inputKey1]))
    },

    showGradient: function(d) {
      var self = this;      
      let inputKey3Min = 0        
      // CHANGE DROP DOWN FOR ABSOLUTE VALES FOR VOLATILTY
      if(inputKey3.indexOf('volumeFactor') > -1) {          
          inputKey3Min = $('#inputKey3MinVolumeFactor').val()              
      } else {
          inputKey3Min = $('#inputKey3MinPercent').val() / 100;
      }
// IF NULL VALUE SET TO ZERO 
      if (!inputKey3Min) {
        inputKey3Min = 0;
      }
      let val = getGraphDataPoint(d,inputKey3);
// IF NEGATIVE VALUE THEN SET AS POSITIVE AS WE ONLY WANT A POISITIVE INTEGER TO TURN INTO A DECIMAL        
      if (val < 0) val = 0 - val;
      let origVal = val    
// IF MISSING VALUE SET TO ZERO            
      if(isNaN(parseFloat(val)) === true) val = 0        
        
// SCALE VALUE BETWEEN 9 AND 76 TO GET A NICE GRADIENT COLOUR        
      val = scaleBetween(val, 9, 76, self.options.gradientMin, self.options.gradientMax)    
        
// SET TO DECIMAL TO MAKE A GRADIENT VALUE    
      val = parseFloat(val)/100
        
// SET VALUE TO ZERO IF MIN VALUE IS NOT REACHED    
      if(inputKey3.indexOf('volumeFactor') > -1) {
        if (origVal < inputKey3Min) val = 0
      } else {
          if (origVal/100 < inputKey3Min) {
            val = 0;
          }          
      }
     // console.log('inputKey3',inputKey3,val,self.options.gradientMin,self.options.gradientMax)
    //  console.log(val)
      
      return val;
    },

    draw: function() {
      var self = this;

      var xMin = d3.min(self.data, function(c) { return c.T;});
      var xMax = d3.max(self.data, function(c) { return c.T;});
        


      // SHOW LAST PRICE BY DEFAULT
      let inputKey1 = $('#inputKey1').val();
      if (inputKey1 === undefined || inputKey1 === null || inputKey1 == '') inputKey1 = 'lastPrice';
      // SHOW FIRST PREDICTED PRICE BY DEFAULT
      let inputKey2 = $('#inputKey2').val();
      if (inputKey2 === undefined || inputKey2 === null || inputKey2 == '') inputKey2 = 'None';
      // SHOW SCORE BY DEFAULT
      let inputKey3 = $('#inputKey3').val();
      if (inputKey3 === undefined || inputKey3 === null || inputKey3 == '') inputKey3 = 'None';
      // SHOW INDEX BY DEFAULT
      let inputKey4 = $('#inputKey4').val();
      if (inputKey4 === undefined || inputKey4 === null || inputKey4 == '') inputKey4 = 'None';
        
    // GET GRADIENT MIN AND MAX FOR EASIER DISPLAY    
      self.options.gradientMin = d3.min(self.data, function(c) { return getGraphDataPoint(c,inputKey3);});
      self.options.gradientMax = d3.max(self.data, function(c) { return getGraphDataPoint(c,inputKey3);});  
        

      let minMaxArray = []
      let yMin = d3.min(self.data, function(c) {
          if(inputKey1 != 'None') minMaxArray.push(c[inputKey1]);
          if(inputKey2 != 'None') minMaxArray.push(c[inputKey2]);
          if(inputKey4 != 'None') minMaxArray.push(getGraphDataPoint(c,inputKey4));
          return d3.min(minMaxArray); });
      let yMax = d3.max(self.data, function(c) {
          if(inputKey1 != 'None') minMaxArray.push(c[inputKey1]);
          if(inputKey2 != 'None') minMaxArray.push(c[inputKey2]);
          if(inputKey4 != 'None') minMaxArray.push(getGraphDataPoint(c,inputKey4));
          return d3.max(minMaxArray); });
/*
      let yMin = d3.min(self.data, function(c) {
          if(inputKey1 != 'None') minMaxArray.push(c[inputKey1])
          if(inputKey2 != 'None') minMaxArray.push(c[inputKey2])
          if(inputKey4 != 'None') minMaxArray.push(c[inputKey4])
          return d3.min(minMaxArray); });
      let yMax = d3.max(self.data, function(c) {
          if(inputKey1 != 'None') minMaxArray.push(c[inputKey1])
          if(inputKey2 != 'None') minMaxArray.push(c[inputKey2])
          if(inputKey4 != 'None') minMaxArray.push(c[inputKey4])
          return d3.max(minMaxArray); });
*/



      let priceSpread = parseFloat(yMax) - parseFloat(yMin);
      let pipsSpread = parseInt(parseFloat(priceSpread) / parseFloat(pipAmount));
      let priceTicks = 8;
      let scaleAdd = parseFloat(pipAmount);
      if (pipsSpread > 10) {
        scaleAdd = parseFloat(pipAmount) * parseInt(pipsSpread / 10);
      }
      // REDUCE PRCES SHOWN
      if (pipsSpread < 5) {
        priceTicks = parseInt(pipsSpread) + 2;
      }

      let inputKey1Colour = $('#inputKey1Colour').val();
      if (inputKey1Colour === undefined || inputKey1Colour.length < 4) {
        inputKey1Colour = 'white';
      } else {
        if (inputKey1Colour.indexOf('#') == -1) {
          inputKey1Colour = '#' + inputKey1Colour;
        }
      }

      let inputKey2Colour = $('#inputKey2Colour').val();
      if (inputKey2Colour === undefined || inputKey2Colour.length < 4) {
        inputKey2Colour = 'gold';
      } else {
        if (inputKey2Colour.indexOf('#') == -1) {
          inputKey2Colour = '#' + inputKey2Colour;
        }
      }
      let inputKey4Colour = $('#inputKey4Colour').val();
      if (inputKey4Colour === undefined || inputKey4Colour.length < 4) {
        inputKey4Colour = 'purple';
      } else {
        if (inputKey4Colour.indexOf('#') == -1) {
          inputKey4Colour = '#' + inputKey4Colour;
        }
      }

      this.scaleX.domain([xMin, xMax]);
      const yDiff = yMax - yMin;
      this.scaleY.domain([
        d3.min(self.data, function(c) { return (parseFloat(yMin) - parseFloat(scaleAdd)) + yDiff * self.options.scaleYBottomAddition; }),
        d3.max(self.data, function(c) { return (parseFloat(yMax) + parseFloat(scaleAdd) + yDiff * self.options.scaleYTopAddition); }),
      ]);

// SHOW PRICE
      var inputKey1Line = d3.line().
          curve(d3.curveLinear).
          x(function(d) { return self.scaleX(d.T); }).
          y(function(d) { return self.scaleY(d[inputKey1]); });

// SHOW PREDICTED PRICE IF ENABLED
      var inputKey2Line;
      if (inputKey2 != 'None') {
        var inputKey2Line = d3.line().
            curve(d3.curveLinear).
            x(function(d) { return self.scaleX(d.T); }).
            y(function(d) { return self.scaleY(d[inputKey2]); });
      }
// SHOW INDEX PRICE IF ENABLED
      var inputKey4Line;
      let lineBandsLow, lineBandsHigh, areaBands;
      if (inputKey4 != 'None') {
        var inputKey4Line = d3.line().
            curve(d3.curveLinear).
            x(function(d) { return self.scaleX(d.T); }).
            y(function(d) { //console.log(inputKey4,getGraphDataPoint(d, inputKey4)); 
                return self.scaleY(getGraphDataPoint(d, inputKey4)); });
            if (parseFloat(bandsValue) > 0) {  
                lineBandsLow = d3.line().
                    x(d => self.scaleX(d.T)).
                    y(d => self.scaleY(parseFloat(getGraphDataPoint(d, inputKey4)) - bandsValue));
                lineBandsHigh = d3.line().
                    x(d => self.scaleX(d.T)).
                    y(d => self.scaleY(parseFloat(getGraphDataPoint(d, inputKey4)) + bandsValue));
                areaBands = d3.area().
                    x(d => self.scaleX(d.T)).
                    y0(d => self.scaleY(parseFloat(getGraphDataPoint(d, inputKey4)) - bandsValue)).
                    y1(d => self.scaleY(parseFloat(getGraphDataPoint(d, inputKey4)) + bandsValue));
            }
      }

      this.mainGroup.select('g.axis.x').
          attr('transform',
              'translate(0,' + (this.options.height - this.options.margins.bottom - this.options.margins.top) + ')').
          call(d3.axisBottom(this.scaleX).ticks((this.options.width < 400) ? 3 : 10).tickFormat(this.multiFormat));

      this.mainGroup.select('g.axis.y').
          attr('transform',
              'translate( ' + (this.options.width - this.options.margins.left - this.options.margins.right) + ', 0 )').
          call(d3.axisRight(this.scaleY).ticks(priceTicks).tickFormat(d3.format('.' + decimalPlaces + 'f')));

      //
      this.mainGroup.selectAll('.data.inputKey1').
          datum(self.data).
          style('stroke', function(d) { return inputKey1Colour; }).
          style('stroke-width', (strokeWidth)).
          style('fill', 'none').
          attr('d', inputKey1Line);

      // predictedPrice
      if (inputKey2 != 'None') {
        this.mainGroup.selectAll('.data.inputKey2').
            datum(self.data).
            style('stroke', function(d) { return inputKey2Colour; }).
            style('stroke-width', strokeWidth).
            style('fill', 'none').
            attr('d', inputKey2Line);
      }
      // indexPrice
      if (inputKey4 != 'None') {
          if (parseFloat(bandsValue) > 0) {
            this.mainGroup.select('.line-bands-low').
                datum(self.data).
                style('fill', 'none').
                style('stroke', inputKey4Colour).
                style('stroke-width', '1.5px').
                style('stroke-opacity', 0.6).
                style(' shape-rendering', 'crispEdges').
                attr('d', lineBandsLow);
            this.mainGroup.select('.line-bands-high').
                datum(self.data).
                style('fill', 'none').
                style('stroke', inputKey4Colour).
                style('stroke-width', '1.5px').
                style('stroke-opacity', 0.6).
                style(' shape-rendering', 'crispEdges').
                attr('d', lineBandsHigh);
            this.mainGroup.select('.area-bands').
                datum(self.data).
                style('fill', inputKey4Colour).
                style('stroke', 'none').
                style('fill-opacity', 0.3).
                style(' shape-rendering', 'crispEdges').
                attr('d', areaBands);
            // bands.append("path").attr("class", "area-bands");
          }
        this.mainGroup.selectAll('.data.inputKey4').
            datum(self.data).
            style('stroke', function(d) { return inputKey4Colour; }).
            style('stroke-width', strokeWidth).
            style('fill', 'none').
            attr('d', inputKey4Line);
      }



    if(inputKey3 != 'None') {
          let buySignalColour = $('#buySignalColour').val();
          if (buySignalColour === undefined || buySignalColour.indexOf('#') == -1 || buySignalColour.length <
              4) buySignalColour = '#2BA84A';
          let sellSignalColour = $('#sellSignalColour').val();
          if (sellSignalColour === undefined || sellSignalColour.indexOf('#') == -1 || sellSignalColour.length <
              4) sellSignalColour = '#ED5565'; //'#FF99ff'
          //let holdSignalColour = $("#holdSignalColour").val()
          //if(holdSignalColour === undefined || holdSignalColour.indexOf('#') == -1 || holdSignalColour.length < 4) holdSignalColour = 'gold'
          //var gradColorRange = ['#2BA84A', 'gold', '#ED5565'];
          //var gradColorRange = [buySignalColour, holdSignalColour, sellSignalColour];
          var gradColorRange = [buySignalColour, sellSignalColour];
          //var gradColorRange = ['#EAFFEA', 'gold', '#FFF6F6'];
          //var gradColorRange = ['#EAFFEA', '#FFF6F6'];
          //var gradColor = d3.scaleOrdinal().range(gradColorRange).domain(['BUY', 'HOLD', 'SELL']);
          var gradColor = d3.scaleOrdinal().range(gradColorRange).domain(['BUY', 'SELL']);

          var gradScaleX = d3.scaleTime().range([0, 100]);
          gradScaleX.domain([xMin, xMax]);

          // JOIN new data with old elements.
          var stopGroup = this.mainGroup.select('#linear-gradient' + exchPairID).selectAll('stop').data(this.data);

          // EXIT old elements not present in new data.
          stopGroup.exit().remove();

          // UPDATE old elements present in new data.

          stopGroup.attr('offset', function(d) {return gradScaleX(d.T) + '%';}).attr('stop-color', function(d) {
            let signal = 'HOLD';
            let val = getGraphDataPoint(d, inputKey3); //d[inputKey3] ;
            /*  
            if(inputKey3.indexOf('.') > -1) {
                  if(inputKey3.replace(/[^.]/g, "").length == 1) {
                    val = d[inputKey3.split('.')[0]][inputKey3.split('.')[1]] ;
                  }
                  if(inputKey3.replace(/[^.]/g, "").length == 2) {
                      val = d[inputKey3.split('.')[0]][inputKey3.split('.')[1]][inputKey3.split('.')[2]] ;
                  }
                  if(inputKey3.replace(/[^.]/g, "").length == 3) {
                      val = d[inputKey3.split('.')[0]][inputKey3.split('.')[1]][inputKey3.split('.')[2]][inputKey3.split('.')[3]] ;
                  }

                if(inputKey3.indexOf('orderBookScores') > -1 || inputKey3.indexOf('volumeScores') > -1) {
                  val = parseInt(val*100)
               //   console.log('inputKey3',inputKey3,val)
                }
            }
            */
              if(!isNaN(parseFloat(val))) {                    
                if (parseFloat(val) > 0) signal = 'BUY';
                if (parseFloat(val) < 0) signal = 'SELL';
              }
        //     console.log('@1 inputKey3',inputKey3,val,signal)
            return gradColor(signal);
          })
          .attr('stop-opacity', function(d) {return D3_MARKET_CHART[exchPairID].showGradient(d);});

          // ENTER new elements present in new data.
          stopGroup.enter().
              append('stop').
              attr('offset', function(d) {return gradScaleX(d.T) + '%';}).
              attr('stop-color', function(d) {
                let signal = 'HOLD';
                let val = getGraphDataPoint(d, inputKey3); //d[inputKey3] ;
                /*
                if(inputKey3.indexOf('.') > -1) {
                      if(inputKey3.replace(/[^.]/g, "").length == 1) {
                        val = d[inputKey3.split('.')[0]][inputKey3.split('.')[1]] ;
                      }
                      if(inputKey3.replace(/[^.]/g, "").length == 2) {
                          val = d[inputKey3.split('.')[0]][inputKey3.split('.')[1]][inputKey3.split('.')[2]] ;
                      }
                      if(inputKey3.replace(/[^.]/g, "").length == 3) {
                          val = d[inputKey3.split('.')[0]][inputKey3.split('.')[1]][inputKey3.split('.')[2]][inputKey3.split('.')[3]] ;
                      }

                    if(inputKey3.indexOf('orderBookScores') > -1 || inputKey3.indexOf('volumeScores') > -1) {
                      val = parseInt(val*100)
                    }
                }
                */
                if(!isNaN(parseFloat(val))) {                    
                    if (parseFloat(val) > 0) signal = 'BUY';
                    if (parseFloat(val) < 0) signal = 'SELL';
                }
           //    console.log('@2 inputKey3',inputKey3,val,signal)
                return gradColor(signal);
          })
          .attr('stop-opacity', function(d) {return D3_MARKET_CHART[exchPairID].showGradient(d);});
    }

//POINTS HTML
      let pointsUpdate = self.mainGroup.select('.points-html').
          selectAll('foreignObject').
          data(self.data.filter(value => value.html));
      pointsUpdate.exit().remove();
      let pointsEnter = pointsUpdate.enter().
          append('foreignObject').
          style('overflow', 'visible ').
          attr('width', 1).
          attr('height', 1);
      pointsEnter.append('xhtml:div').
          attr('class', 'below').
          style('position', 'absolute').
          style('transform', 'translateX(-50%)');
      pointsEnter.append('xhtml:div').
          attr('class', 'above').
          style('position', 'absolute').
          style('transform', 'translate(-50%, -100%)');
      let pointsEnterUpdate = pointsEnter.merge(pointsUpdate);
      pointsEnterUpdate.attr('x', d => self.scaleX(d.T)).attr('y', d => self.scaleY(d[inputKey1]));
      pointsEnterUpdate.select('.below').html(d => d.html.below);
      pointsEnterUpdate.select('.above').html(d => d.html.above);

//BID, ASK WALLS
    if(displayWalls === true) {
          let wallHeight = showWallsData ? 16 : 4;
          let lastPrice = self.data[self.data.length - 1].lastPrice;
          let calculatedWalls = calculateOrderBookWalls(exchPairID);
          let minVisibleWallPrice = self.scaleY.invert(self.scaleY.range()[0] - wallHeight / 2);
          let maxVisibleWallPrice = self.scaleY.invert(self.scaleY.range()[1] + wallHeight / 2);
          let allWalls = calculatedWalls.askWalls.concat(calculatedWalls.bidWalls).
              sort((a, b) => Math.abs(b.wallPrice - lastPrice) - Math.abs(a.wallPrice - lastPrice)).
              filter(value => value.wallPrice < maxVisibleWallPrice && value.wallPrice > minVisibleWallPrice);
          let wallsDomainMin = d3.min(allWalls, d => parseFloat(d.qty));
          let wallsDomainMax = d3.max(allWalls, d => parseFloat(d.qty));
          let wallsScale = d3.scaleLinear([wallsDomainMax,wallsDomainMin],
              [showWallsData ? 340 : this.options.width * 0.3, showWallsData ? 120 : this.options.width * 0.05]);

          let wallsUpdate = self.mainGroup.select('.order-book-walls').selectAll('foreignObject').data(allWalls);
          let wallsEnter = wallsUpdate.enter().append('foreignObject');
          wallsUpdate.exit().remove();

          wallsEnter.append('xhtml:div');
          let wallsEnterUpdate = wallsEnter.merge(wallsUpdate);
          wallsEnterUpdate.select('div').attr('class', d => 'graph-wall ' + d.type);
          wallsEnterUpdate.attr('width', d => wallsScale(parseFloat(d.qty))).
              attr('height', wallHeight).
              attr('x', d => self.options.width - wallsScale(parseFloat(d.qty)) - self.options.margins.left -
                  self.options.margins.right).
              attr('y', (d, i, nodes) => self.scaleY(d.wallPrice) - d3.select(nodes[i]).node().getBBox().height / 3);


    //            this.mainGroup.append('g').attr('class', 'graph-ask-walls');


//  DISPLAY FULL WALLS DATA
          if (showWallsData === true) {
            wallsEnterUpdate.attr('x', d => self.options.width - wallsScale(parseFloat(d.qty)) - self.options.margins.left).
                select('div').
                html(d => {
                  return '<span class=\'graph-wall-qty\' >' + d.displayMarketCurrency + numberWithCommas(d.qty) +
                      '</span>' +
                      '<span class=\'graph-wall-avg-delta\'>' + d.avgDelta + '%</span>' +
                      '<span class=\'graph-wall-time-in-book\' >' + d.timeInBook + '</span>' +
                      '<span class=\'graph-wall-spacer\'>&nbsp;</span>' +
                      '<span class=\'graph-wall-accumulated-qty\' >' + d.displayMarketCurrency +
                      numberWithCommas(d.accumulatedQty) + '</span>' +
                      '<span class=\'graph-wall-spread\'>' + (d.type === 'bid-wall' ? '-' : '') + d.spread + '%</span>' +
                      '<span class=\'graph-wall-price\'>' +
                      (d.wallPrice).toFixed(d.decimalPlaces) + '</span>';
                });
          }

    }
//////////////////////////

//////////////////////////
// DISPLAY LINE ON GRAPH
          if(displayLastPrice === true) {
             // console.log(inputKey1)
// COMMENTED OUT ZERO LINE TO JUST SHOW LAST PRICE              
            /*this.mainGroup.select('line.zeroline').
                attr('x1', this.scaleX.range()[0]).
                attr('y1', this.scaleY(signalData[exchPairID][inputKey1])).
                attr('x2', this.scaleX.range()[1]).
                attr('y2', this.scaleY(signalData[exchPairID][inputKey1]));
                */
            this.mainGroup.select('text.zerolinetext').
                attr('x', self.options.width - self.options.margins.right - self.options.margins.left).
                attr('y', this.scaleY(signalData[exchPairID][inputKey1]));
              // APPLYING THIS VALUE AT signals.js -> $('#marketGraph .zerolinetext').html(
              //.text(signalData[exchPairID][inputKey1]);
            this.mainGroup.select('rect.zeroline-rect').
                attr('height', '16').
                attr('width', this.options.margins.right).
                attr('x', self.options.width - self.options.margins.right - self.options.margins.left).
                attr('y', (d, i, nodes) => this.scaleY(signalData[exchPairID][inputKey1]) -
                    d3.select(nodes[i]).node().getBBox().height / 2).
                attr("rx", 8).         // set the x corner curve radius
                attr("ry", 8);        // set the y corner curve radius
          }

    if (graphSize == 'large') {    
//UPDATE CROSS LINES
      if (self.svg.select('g.focus').style('display') !== 'none') {
        self.mousemove();
      }
    }

    },

    clearChart: function() {
      var el = d3.select(this.selector);
      if (el.empty()) {
        console.warn('clearChart(): Element for "' + this.selector + '" selector not found');
        return;
      }

      // clear element
      el.html('');
    },

    // Define filter conditions
    multiFormat: function(date) {
      // Establish the desired formatting options using locale.format():
// https://github.com/d3/d3-time-format/blob/master/README.md#locale_format
      var formatMillisecond = d3.timeFormat('.%L'),
          formatSecond = d3.timeFormat(':%S'),
          formatMinute = d3.timeFormat('%I:%M'),
          formatHour = d3.timeFormat('%I:%M %p'),
          formatDay = d3.timeFormat('%a %d'),
          formatWeek = d3.timeFormat('%b %d'),
          formatMonth = d3.timeFormat('%B'),
          formatYear = d3.timeFormat('%Y');

      return (d3.timeSecond(date) < date ? formatMillisecond
          : d3.timeMinute(date) < date ? formatSecond
              : d3.timeHour(date) < date ? formatMinute
                  : d3.timeDay(date) < date ? formatHour
                      : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
                          : d3.timeYear(date) < date ? formatMonth
                              : formatYear)(date);
    },

    resize: function() {
      var el = d3.select(D3_MARKET_CHART[exchPairID].selector);
      if (el.empty()) {
        console.warn('resize(): Element for "' + this.selector + '" selector not found');
        return;
      }
      D3_MARKET_CHART[exchPairID].redraw();
    },
  };
    
  
    
   // console.log(graphData)
    
  D3_MARKET_CHART[exchPairID].data = getGraphData(exchPairID,signalDataHistory[exchPairID],signalData[exchPairID].timePeriod);
  D3_MARKET_CHART[exchPairID].redraw();
    
  
}

function getGraphData(exchPairID,data,timePeriod) {
    
    // TRUNCATE DATA TO FINT WHAT IS REQUIRED BY GRAPH      
  let timePeriodSeconds = getTimePeriodConfig(timePeriod).seconds;  
  let graphData = [];
  let len = data.length;
  let now = data[len-1].T;       
  for (let l = 0; l < len; l++) {       
      if(data[l].T !== undefined && ((now - parseFloat(data[l].T))/1000) < timePeriodSeconds) {
          graphData.push(data[l]);
      }      
     // console.log('timeSince',((now - parseFloat(data[l].T))/1000))
  };  
  return graphData;
}


function updateGraph(exchPairID) {     

  D3_MARKET_CHART[exchPairID].data = getGraphData(exchPairID,signalDataHistory[exchPairID],signalData[exchPairID].timePeriod);
  D3_MARKET_CHART[exchPairID].draw();
    
  
    
}
function loadWalls() {
    if ($('#displayWalls').is(':checked') !== true && $('#showWallsData').is(':checked') === true) {
        $('#showWallsData').prop('checked', false);
    }
    loadGraph();
}

function getGraphDataPoint (d,keyName) {
    
    if(d[keyName] === undefined) {
     //   console.log('keyName UNDEFINED',keyName,d)
        return d;
    }
    return d[keyName]
}