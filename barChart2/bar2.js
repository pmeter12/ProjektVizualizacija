async function cratjBar(){

    //Učitamo cijeli skup podataka
    const dataset= await d3.csv("movie_metadata.csv")
    //console.log(dataset);

    //Tražimo najbolje ocijenjene filmove kroz godine od 2000 do zadnje godine izlaska
    const podatci=[];
    let brojilo = 0;
    for(let i = 0; i < dataset.length; i++)
    {
        if(parseInt(dataset[i].title_year) >= 2000 && parseFloat(dataset[i].imdb_score) > 7.5)
        {
            const podatak ={
                godina: dataset[i].title_year,
                ocjena: dataset[i].imdb_score
            }
            podatci[brojilo] = podatak;
            brojilo+=1;

        }
    }

    //console.log(podatci);
    
    //2.Definiranje dimenzija
    const sirina = 600
    let dimenzije = {
        sirina: sirina,
        visina: sirina * 0.6,
        margine: {
        top: 30,
        right: 10,
        bottom: 50,
        left: 50,
       },
    }

    dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right
    dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom
  
    
    const okvir = d3
        .select("#okvir")
        .append("svg")
        .attr("width", dimenzije.sirina)
        .attr("height", dimenzije.visina);
    

    const granice = okvir
        .append("g")
        .style(
          "transform",
          `translate(${dimenzije.margine.left}px, ${dimenzije.margine.top}px)`
        );

    //Statički elementi
    
    granice.append("g")
        .attr("class","kosare")
    granice.append("line")
        .attr("class","prosjek")
    granice.append("g")
        .attr("class","x-os")
        .style("transform", `translateY(${dimenzije.grVisina}px)`)
        .append("text")
        .attr("class", "x-os-oznaka")
    
    const xAccessor = d => d.godina
    const yAccessor = d => d.length

    //4.Definiranje razmjera

    const xSkala = d3.scaleLinear()
        .domain(d3.extent(podatci, xAccessor))
        .range([0, dimenzije.grSirina])
        .nice()
        
    const kosGenerator = d3.histogram()
        .domain(xSkala.domain())
        .value(xAccessor)
        .thresholds(12)

    const kosare = kosGenerator(podatci);
    //console.log(kosare)

    const ySkala = d3.scaleLinear()
        .domain([0, d3.max(kosare, yAccessor)]) 
        .range([dimenzije.grVisina, 0])
        .nice()

    //5. Crtanje podataka
    const barPadding = 1
    
    let sveKosare = granice.select(".kosare")
        .selectAll(".kosara")
        .data(kosare)
    
    sveKosare.exit()
        .remove()
    
    const noveKosare = sveKosare.enter().append("g")
        .attr("class","kosara")
    
    noveKosare.append("rect")
    noveKosare.append("text")

    sveKosare = noveKosare.merge(sveKosare)


    const stupciGrafa = sveKosare.select("rect")
        .attr("x", dp => xSkala(dp.x0)+barPadding)
        .attr("y", dp => ySkala(yAccessor(dp)))
        .attr("width", dp => d3.max([0,xSkala(dp.x1)-xSkala(dp.x0) - barPadding]))
        .attr("height", dp => dimenzije.grVisina - ySkala(yAccessor(dp)))
        

    const srVr = d3.mean(podatci, xAccessor)
    //console.log(srVr)
      
    const srednjaPravac = granice.selectAll(".prosjek")
        .attr("x1", xSkala(srVr))
        .attr("x2", xSkala(srVr))
        .attr("y1", -15)
        .attr("y2", dimenzije.grVisina)
    
    //Crtanje osi
    const xOsGenerator = d3.axisBottom()
        .scale(xSkala)
      
    const xOs = granice.select(".x-os")
        .call(xOsGenerator)
        
    const xOsOznaka = xOs.select(".x-os-oznaka")
        .attr("x", dimenzije.grSirina / 2)
        .attr("y", dimenzije.margine.bottom - 10)
        .text("Godina izlaska")


    //Interakcije
    const detalji = d3.select("#detalji")
    sveKosare.select("rect")
        .on("mouseenter",onMouseEnter)
        .on("mouseleave",onMouseLeave)

    function onMouseEnter(event, podatak){
        detalji.select("#broj_filmova")
            .text(yAccessor(podatak))
        detalji.select("#godina")
            .text([podatak.x0,podatak.x1].join("-"))
        
        const x = xSkala(podatak.x0) + (xSkala(podatak.x1) - xSkala(podatak.x0)) / 2 + dimenzije.margine.left
        const y = ySkala(yAccessor(podatak)) + dimenzije.margine.top
        detalji.style("transform", `translate(calc(-50% + ${x}px), calc(-100% + ${y}px))`)
        detalji.style("opacity",1)
    }

    function onMouseLeave(event, podatak){
        detalji.style("opacity",0)
    }
}
cratjBar();