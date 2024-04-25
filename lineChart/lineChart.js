
const crtajGraf = async () => {

    //1. Pristup podatcima
    const dataset = await d3.csv("movie_metadata.csv");
    //console.log(dataset);

    const podatci=[];
    const godine=[];
    const budzeti=[];
    for(let i =0; i < dataset.length;i++)
    {
      if(dataset[i].title_year && parseInt(dataset[i].title_year) >= 2000)
      {
        godine[i] = parseInt(dataset[i].title_year);
      }
    }
    var godine_cisto = godine.filter(elm => elm);
    const godine_bez_duplih2 = [... new Set(godine_cisto)];
    const godine_bez_duplih = godine_bez_duplih2.sort()

    console.log(godine_bez_duplih)
    for(let i = 0; i < godine_bez_duplih.length; i++)
    {   let zbroj = 0; 
        let brojac=1;
        for(let j = 0; j < dataset.length; j++)
        {
          
          
          if((parseInt(godine_bez_duplih[i]) == parseInt(dataset[j].title_year)) && dataset[i].budget)
          {
              let budget = parseInt(dataset[i].budget) / 1000000
              zbroj += budget;
              brojac+=1;

          } 
          
        }
        /*const podatak={
          godina:godine_bez_duplih[i],
          budzet:zbroj,
          brojac:brojac
        }*/

        budzeti[i] = zbroj/brojac;
        
    }
    
    
    for(let i = 0; i<budzeti.length;i++)
    {
      const podatak = {
        godina:godine_bez_duplih[i],
        budzet:budzeti[i]
      }
      podatci[i] = podatak;
    }
    //console.log(podatci)
    
    
    const xAccessor = data => data.godina;
    const yAccessor = data => data.budzet;
  
    //2. Dimenzije grafa
    const dimenzije = {
        width: window.innerHeight * 0.9,
        heigth : 400,
        margin:{
            top: 15,
            right: 15,
            bottom: 40,
            left: 60
        },
    }
    dimenzije.boundsWidth = dimenzije.width - dimenzije.margin.left - dimenzije.margin.right
    dimenzije.boundsHeight = dimenzije.heigth - dimenzije.margin.top - dimenzije.margin.bottom

    const okvir = d3
      .select("#okvir")
          .append("svg")
            .attr("width", dimenzije.width)
            .attr("height", dimenzije.heigth);
    
    const granice = okvir.append("g")
      .style("transform",`translate(${dimenzije.margin.left}px, ${dimenzije.margin.top}px)`)

    granice.append("defs").append("clipPutanja")
      .attr("id", "granice-clip-putanje")
      .append("rect")
      .attr("width", dimenzije.boundsWidth)
      .attr("height",dimenzije.boundsHeight)

    const clip = granice.append("g")
      .attr("clip-path","url(#granice-clip-putanje)")


    const xMjerilo = d3.scaleLinear()
      .domain(d3.extent(podatci, xAccessor))
      .range([0, dimenzije.boundsWidth]);

    const yMjerilo = d3.scaleLinear()
      .domain(d3.extent(podatci,yAccessor))
      .range([dimenzije.boundsHeight, 0]);

    //5.Crtanje podataka
    const generatorLinije = d3.line()
      .x(data => xMjerilo(xAccessor(data)))
      .y(data => yMjerilo(yAccessor(data)))

    const linija = granice.append("path")
      .attr("class","linija")
      .attr("d", generatorLinije(podatci))

    //6.Crtanje pomoćne grafike
      
    const yOsGenerator = d3.axisLeft()
      .scale(yMjerilo)

    const yOs = granice.append("g")
      .attr("class","y-os")
      .call(yOsGenerator)

    const yAxisLabel = yOs.append("text")
      .attr("class","y-os-oznaka")
      .attr("x", -dimenzije.boundsHeight / 2)
      .attr("y", -dimenzije.margin.left+10)
      .html("Budget u milijunima $")


    const xOsGenerator = d3.axisBottom()
      .scale(xMjerilo)

    const xOs = granice.append("g")
      .attr("class","x-os")
      .call(xOsGenerator)
      .style("transform", `translateY(${dimenzije.boundsHeight}px)`)
  
    //7.Postavljanje interakcije

    const okvirDodir = granice.append("rect")
      .attr("class","okvirDodir")
      .attr("width",dimenzije.boundsWidth)
      .attr("height",dimenzije.boundsHeight)
      .on("mousemove",onMouseMove)
      .on("mouseleave",onMouseLeave)

    const detalji = d3.select("#detalji")

    const krug = granice.append("circle")
      .attr("class","krug")
      .attr("r",5) //postavljanje radijusa kruga
      .style("fill","red")//postavljanje boje
      .style("opacity",0)

    function onMouseMove(e,data){
      const pozicijaMisa = d3.pointer(e) //pozicija miša
      const hoverGodina = xMjerilo.invert(pozicijaMisa[0]) //pozicija miša po x osi

      //Pomoćna funkcija za računanje razlike
      const udaljenostHover = d => Math.abs(xAccessor(d) - hoverGodina)
      const najblizi = d3.least(podatci,(a,b)=>(
        udaljenostHover(a) -udaljenostHover(b)
      ))

      //console.log(najblizi)
      const najbliziX = xAccessor(najblizi)
      const najbliziY = yAccessor(najblizi)
      detalji.select("#godina")
        .text(najbliziX)
      
      const formatR =d3.format(".2f")
      detalji.select("#budget")
        .text(formatR(najbliziY))

      const x = xMjerilo(najbliziX) + dimenzije.margin.left
      const y = yMjerilo(najbliziY) + dimenzije.top

      krug
        .attr("cx",xMjerilo(najbliziX))
        .attr("cy",yMjerilo(najbliziY))
        .style("opacity",1)
      detalji.style("transform", `translate(
        calc(-50% + ${x}px),
        calc(-100% + ${y}px)
      )`)

      detalji.style("opacity",1)
    }
   
   
    function onMouseLeave(){
      detalji.style("opacity",0)
      krug.style("opacity",0)
    }
  };

  crtajGraf()