async function crtajScatter(){

    const dataset = await d3.csv("movie_metadata.csv");

    const podatci = [];

    let brojac = 0;
    for(let i = 0; i < dataset.length ;i++)
    {

        if(parseInt(dataset[i].title_year) > 2010)
        {
            if(dataset[i].budget && dataset[i].imdb_score)
            {
                if(parseFloat(dataset[i].budget)/1000000 > 100)
                {
                    const podatak={
                        budget: parseInt(dataset[i].budget)/1000000,
                        ocjena: parseFloat(dataset[i].imdb_score)
                    }
                    podatci[brojac] = podatak;
                    brojac+=1;
                

                }
                
            }
            
        }
    }

    
    const xAccessor = data => data.budget;
    const yAccessor = data => data.ocjena;
    
    const sirina = d3.min([
        window.innerWidth*0.9,
        window.innerHeight*0.9
    ]);

    let dimenzije = {
        sirina : sirina, //varijabla iz prethodnog koraka
        visina: sirina, //zadrzavamo pravokutne dimenzije
        margine:{
            top: 10,
            right: 10,
            bottom: 50,
            left: 50,
        },

    }

    //racunamo dimenzije granica
    dimenzije.grSirina = dimenzije.sirina - dimenzije.margine.left - dimenzije.margine.right
    dimenzije.grVisina = dimenzije.visina - dimenzije.margine.top - dimenzije.margine.bottom

    const okvir = d3.select("#okvir")
        .append("svg")
            .attr("width",dimenzije.sirina)
            .attr("height",dimenzije.visina)
    
    const granice = okvir.append("g").style(
        "transform",
        `translate(
            ${dimenzije.margine.left}px, 
            ${dimenzije.margine.top}px
          )`
    );

    const xSkala = d3.scaleLinear()
        .domain(d3.extent(podatci, xAccessor))
        .range([0, dimenzije.grSirina])
        .nice()
    //console.log(xSkala.domain())
    

    
    const ySkala = d3.scaleLinear()
        .domain(d3.extent(podatci, yAccessor))
        .range([dimenzije.grVisina, 0])
        .nice()
    //console.log(ySkala.domain())



    granice.append("circle")
        .attr("cx",dimenzije.grSirina / 2)
        .attr("cy", dimenzije.grVisina / 2)
        .attr("r", 5)
       
    podatci.forEach(dp=>{
        granice
            .append("circle")
            .attr("cx",xSkala(xAccessor(dp)))
            .attr("cy", ySkala(yAccessor(dp)))
            .attr("r", 4);
    });

    const tocke = granice.selectAll("circle")
            .data(podatci)
        .enter().append("circle")
            .attr("cx", dp => xSkala(xAccessor(dp)))
            .attr("cy", dp => ySkala(yAccessor(dp)))
            .attr("r", 4)
            .attr("fill", "#6495ed")
    
    const crtajTocke = (podaci, boja) =>{
        // Selekcija + pridruzivanje podataka

        const tocke = granice.selectAll("circle").data(podaci)

        //Dohvacamo ulazne podatke i iscrtavamo ihi
        tocke.join("circle")
            .attr("cx", d => xSkala(xAccessor(d)))
            .attr("cy", d => ySkala(yAccessor(d)))
            .attr("r", 4)
            .attr("fill", boja)
    }

    crtajTocke(podatci, "red")

    

    const xOsGen = d3.axisBottom().scale(xSkala)
    const xOs = granice.append("g")
        .call(xOsGen)
            .style("transform",
            `translateY(${dimenzije.grVisina}px)`)

    const xOsOznaka = xOs.append("text")
        .attr("x", dimenzije.grSirina / 2)
        .attr("y", dimenzije.margine.bottom - 10)
        .attr("fill", "black")
        .style("font-size", "1.5em")
        .html("Budget filma")

    const yOsGen = d3.axisLeft()
        .scale(ySkala)
        .ticks(4)

    const yOs = granice.append("g")
        .call(yOsGen)
    
    const yOsOznaka = yOs.append("text")
        .attr("x", -dimenzije.grVisina /2)
        .attr("y", -dimenzije.margine.left + 15)
        .attr("fill", "black")
        .style("font-size", "1.5e,")
        .html("Ocjena filma")
        .style("transform", "rotate(-90deg) ")
        .style("text-anchor", "middle")


    granice.selectAll("circle")
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)
    
    const detalji = d3.select("#detalji")

    function onMouseEnter(e,d){
        detalji.select("#budget")
            .text(xAccessor(d))
 
        //const formatR = d3.format(".2f")
        detalji.select("#prosjek")
            .text(yAccessor(d))
        
        
        
        //console.log(xAccessor(d))
        //console.log(yAccessor(d))
        //console.log(zAccessor(d))    
        const x = xSkala(xAccessor(d)) + dimenzije.margine.left;
        const y = ySkala(yAccessor(d)) + dimenzije.margine.top;
        detalji.style("transform", `translate(calc(-50% + ${x}px), calc(-100% + ${y}px) )`)

        detalji.style("opacity", 1)
    }

    function onMouseLeave(){
        detalji.style("opacity", 0)
    }
    
    
   
    
    
}

crtajScatter();