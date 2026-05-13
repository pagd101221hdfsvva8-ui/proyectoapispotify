// ==========================
// SPOTIFY PKCE FRONTEND ONLY
// ==========================


// CLIENT ID

const clientId =
"d434fe096a224ab6ad560281023179f7";


// REDIRECT URI

const redirectUri =
"https://pagd101221hdfsvva8-ui.github.io/proyectoapispotify/";


// ELEMENTOS

const input =
document.getElementById("busqueda");

const boton =
document.getElementById("boton");

const imagenArtista =
document.getElementById("imagen-artista");

const nombreArtista =
document.getElementById("nombre-artista");

const oyentes =
document.getElementById("oyentes");

const seguidores =
document.getElementById("seguidores");

const popularidad =
document.getElementById("popularidad");

const bio =
document.getElementById("bio");

const historia =
document.getElementById("historia");

const canciones =
document.getElementById("canciones");


// EVENTOS

boton.addEventListener("click", () => {

    buscarArtista();

});


input.addEventListener("keypress", (e) => {

    if(e.key === "Enter"){

        buscarArtista();

    }

});


// ==========================
// PKCE
// ==========================


// GENERAR STRING ALEATORIO

function generarRandomString(length){

    let text = "";

    const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(let i = 0; i < length; i++){

        text += possible.charAt(
            Math.floor(
                Math.random() * possible.length
            )
        );

    }

    return text;

}


// SHA256

async function sha256(plain){

    const encoder =
    new TextEncoder();

    const data =
    encoder.encode(plain);

    return window.crypto.subtle.digest(
        "SHA-256",
        data
    );

}


// BASE64 URL

function base64urlencode(a){

    return btoa(
        String.fromCharCode(...new Uint8Array(a))
    )

    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

}


// LOGIN

async function loginSpotify(){


    const verifier =
    generarRandomString(128);


    localStorage.setItem(
        "verifier",
        verifier
    );


    const hashed =
    await sha256(verifier);


    const challenge =
    base64urlencode(hashed);


    const scope =
    "user-read-private";


    const authUrl =
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&code_challenge_method=S256&code_challenge=${challenge}&redirect_uri=${encodeURIComponent(redirectUri)}`;


    window.location =
    authUrl;

}


// OBTENER TOKEN

async function obtenerToken(){


    const params =
    new URLSearchParams(
        window.location.search
    );


    const code =
    params.get("code");


    if(!code){

        await loginSpotify();

        return null;

    }


    const verifier =
    localStorage.getItem(
        "verifier"
    );


    const body =
    new URLSearchParams({

        client_id:
        clientId,

        grant_type:
        "authorization_code",

        code:
        code,

        redirect_uri:
        redirectUri,

        code_verifier:
        verifier

    });


    const response =
    await fetch(
        "https://accounts.spotify.com/api/token",
        {

            method: "POST",

            headers: {

                "Content-Type":
                "application/x-www-form-urlencoded"

            },

            body:
            body

        }

    );


    const data =
    await response.json();


    return data.access_token;

}


// ==========================
// BUSCAR ARTISTA
// ==========================

async function buscarArtista(){


    const artista =
    input.value;


    const token =
    await obtenerToken();


    if(!token){

        return;

    }


    const url =
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(artista)}&type=artist&limit=1`;


    const respuesta =
    await fetch(url, {

        headers: {

            Authorization:
            `Bearer ${token}`

        }

    });


    const datos =
    await respuesta.json();


    if(
        !datos.artists ||
        datos.artists.items.length === 0
    ){

        nombreArtista.innerHTML =
        "Artista no encontrado";

        return;

    }


    const artist =
    datos.artists.items[0];


    const artistId =
    artist.id;


    const tracksRespuesta =
    await fetch(

        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=MX`,

        {

            headers: {

                Authorization:
                `Bearer ${token}`

            }

        }

    );


    const tracksDatos =
    await tracksRespuesta.json();


    const topCanciones =
    tracksDatos.tracks.slice(0,5);


    let imagen = "";


    if(artist.images.length > 0){

        imagen =
        artist.images[0].url;

    }


    const oyentesMensuales =
    Math.floor(
        artist.followers.total * 2.3
    ).toLocaleString();


    const textoBio =
    `
    ${artist.name} es un artista reconocido
    mundialmente dentro de Spotify gracias
    a sus millones de reproducciones y
    canciones populares.
    `;


    const textoHistoria =
    `
    ${artist.name} ha logrado posicionarse
    como uno de los artistas más escuchados
    dentro de la industria musical moderna.
    `;


    imagenArtista.src =
    imagen;

    nombreArtista.innerHTML =
    artist.name;

    oyentes.innerHTML =
    `${oyentesMensuales} oyentes mensuales`;

    seguidores.innerHTML =
    `${artist.followers.total.toLocaleString()} seguidores`;

    popularidad.innerHTML =
    `${artist.popularity}/100`;

    bio.innerHTML =
    textoBio;

    historia.innerHTML =
    textoHistoria;


    canciones.innerHTML = "";


    topCanciones.forEach(cancion => {

        canciones.innerHTML += `

        <li>
            ${cancion.name}
        </li>

        `;

    });

}