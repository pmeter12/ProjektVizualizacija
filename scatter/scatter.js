async function crtajScatter(){

    const dataset = await d3.csv("movie_metadata.csv");
    
    //Izdvojit ćemo samo godine iz dataseta
    const godine = [];
    for(let i = 0; i < dataset.length; i++)
    {
        godine[i]=dataset[i].title_year
        //console.log(parseFloat(dataset[i].imdb_score))
    }

    //Filtriramo godine tako da nemamo filmova bez godina izlaska
    var godine_cisto = godine.filter(elm =>elm);
    //console.log(Math.min(...godine_cisto))


    //Sada kada imamo niz godina svih godina izlazaka izbacit ćemo duplikate
    unikat = [... new Set(godine_cisto)];
    //console.log(unikat);

    //Sada ćemo za svaku godinu izračunati prosjek IMDB ocjene svih filmova izdanih te godine
    const prosjek_po_godini=[];
    const brojaci=[];
    let prosjek=0.0;
    let suma=0.0;
    let brojac=0;
    for(let i = 0; i < unikat.length;i++)
    {
        
        for(let j = 0; j < dataset.length;j++)
        {   
            if(dataset[j].title_year===unikat[i])
            {
                //console.log(dataset[j].imdb_score)
                brojac=brojac+1;
                suma+=parseFloat(dataset[j].imdb_score);

            }
        }
        
        prosjek = suma / brojac;
        prosjek_po_godini[i]=prosjek;
        brojaci[i] = brojac;
        suma = 0.0;
        brojac=0;
        
        
    };
    

    const podatci=[];
    for(let i =0; i< unikat.length;i++){
        const podatak={
            prosjek:prosjek_po_godini[i],
            godina:unikat[i],
            brojac:brojaci[i]
        }
        podatci[i]=podatak;
    }
    console.log(podatci)


    //Ovom provjerom vidimo da imamo jednak broj elemenata za godine izlaska i prosjeke ocjena
    //console.log(unikat.length)
    //console.log(prosjek_po_godini.length);
    
    
    const xAccessor = data => data.godina;
    const yAccessor = data => data.prosjek;
    const zAccessor = data => data.brojac;

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
        .html("Godina izlaska filma")

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
        .html("Prosječna ocjena")
        .style("transform", "rotate(-90deg) ")
        .style("text-anchor", "middle")


    granice.selectAll("circle")
        .on("mouseenter", onMouseEnter)
        .on("mouseleave", onMouseLeave)
    
    const detalji = d3.select("#detalji")

    function onMouseEnter(e,d){
        const formatG = d3.format(".2f")
        detalji.select("#prosjek")
            .text(formatG(yAccessor(d)))
 
        //const formatR = d3.format(".2f")
        detalji.select("#godina")
            .text(xAccessor(d))
        
        detalji.select("#brojac")
            .text(zAccessor(d))
        
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