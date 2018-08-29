



function qr_chart(options) {

  var height   = parseInt( $(options.id).height() );
  var width    = parseInt( $(options.id).width()  );

  var largeurEnPixel =  parseInt(  (options.largeurEnPoursent / height ) * 100 );

  var x1 =  parseInt( (width/4) );
  var x2 =  parseInt( (width/2) );
  var x3 =  parseInt( x1+x2     );

  var y1 =  parseInt( height - (height * options.set[0].poursent / 100)  );
  var y2 =  parseInt( height - (height * options.set[1].poursent / 100) );
  var y3 =  parseInt( height - (height * options.set[2].poursent / 100) );

    var svgContainer = d3.select(options.id).append("svg")
        .attr("height", height)
        .attr("width",  width);

    var rectangle1 = svgContainer.append("rect")
        .attr("x", x1)
        .attr("y", y1)
        .attr("width",  options.largeurEnPoursent+'%')
        .attr("height", height )
        .attr("fill", "green");

    var rectangle2 = svgContainer.append("rect")
        .attr("x", x2)
        .attr("y", y2)
        .attr("width", options.largeurEnPoursent+'%')
        .attr("height", height)
        .attr("fill", "blue");

    var rectangle3 = svgContainer.append("rect")
        .attr("x", x3)
        .attr("y", y3)
        .attr("width", options.largeurEnPoursent+'%')
        .attr("height", height)
        .attr("fill", "red");

    options['svgContainer'] = svgContainer;
    options['rectangle1']   = rectangle1;
    options['rectangle2']   = rectangle2;
    options['rectangle3']   = rectangle3;

    return options;

    /*
      // Some Background Effect to show that D3.js is loading
      d3.select("body")
          .transition()
          .duration(1000)
          .style("background-color", "black");

      // Step 1 Make an SVG Container
      var svgContainer = d3.select(options.id).append("svg")
                                          .attr("width",  500)
                                          .attr("height", 500);


      var rectangle = svgContainer.append("rect")
                                  .attr("x", 120)
                                  .attr("y", 20)
                                  .attr("width", 150)
                                  .attr("height", "50%")
                                  .attr("fill", "green")

      */

}



function qr_chart_update(options) {

    console.log("update", options)
    var height   = parseInt( $(options.id).height() );
    var width    = parseInt( $(options.id).width()  );

    var pos1 =  parseInt( (width/4) );
    var pos2 =  parseInt( (width/2) );
    var pos3 =  parseInt( pos1+pos2 );


    options.rectangle1 = options.svgContainer
        .transition()
        .attr("x", pos1)
        .attr("y", 20)
        .attr("width", options.largeur)
        .attr("height", "50%")
        .attr("fill", "green");

    options.rectangle2 = options.svgContainer
        .transition()
        .attr("x", pos2)
        .attr("y", 20)
        .attr("width", options.largeur)
        .attr("height", "50%")
        .attr("fill", "blue");

    options.rectangle3 = options.svgContainer
        .transition()
        .attr("x", pos3)
        .attr("y", 20)
        .attr("width", options.largeur)
        .attr("height", "50%")
        .attr("fill", "red");




    /*
        rectangle
            .transition()
            .duration(2000)
            .attr("height", "50%")
            .attr("fill", "blue")
    */
}

