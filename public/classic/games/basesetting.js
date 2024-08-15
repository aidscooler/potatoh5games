async function loadEvent (filepath) {
    let enableDebug = false;
    let enableThreads = false;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.get('debug') == 1) {
        enableDebug = true;
    } else {
    }
    if (urlParams.get('threads') == 1) {
        if (window.SharedArrayBuffer) {
            enableThreads = true;
        } else {
        }
    } else {
    }
    //console.log("filepath:" + filepath);
    let language = urlParams.get('language');
    //console.log('language:' + language);
    if (language === null || language === undefined) {
        language = "en-US"
    }    
    //console.log("language:" + language);
    // 使用fetch获取文件
    //const filepath = 'contra.nes'; 
    const filename = filepath.split('/').pop();
    const ext = filename.split('.').pop();
    fetch(filepath)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.blob();
    })
    .then(async function (blob) {
        const url = blob;
        const parts = filepath.split(".");
        //console.log(filepath);

        const core = await (async (ext) => {
            if (["fds", "nes", "unif", "unf"].includes(ext))
                return "nes"

            if (["smc", "fig", "sfc", "gd3", "gd7", "dx2", "bsx", "swc"].includes(ext))
                return "snes"

            if (["z64", "n64"].includes(ext))
                return "n64"

            if (["pce"].includes(ext))
                return "pce"

            if (["ngp", "ngc"].includes(ext))
                return "ngp"

            if (["ws", "wsc"].includes(ext))
                return "ws"

            if (["col", "cv"].includes(ext))
                return "coleco"

            if (["d64"].includes(ext))
                return "vice_x64sc"

            if (["zip"].includes(ext))
                return "mame2003_plus"

            if (["nds", "gba", "gb", "z64", "n64"].includes(ext))
                return ext

            return await new Promise(resolve => {
                var coreValues = {
                    "Nintendo 64": "n64",
                    "Nintendo Game Boy": "gb",
                    "Nintendo Game Boy Advance": "gba",
                    "Nintendo DS": "nds",
                    "Nintendo Entertainment System": "nes",
                    "Super Nintendo Entertainment System": "snes",
                    "PlayStation": "psx",
                    "Virtual Boy": "vb",
                    "Sega Mega Drive": "segaMD",
                    "Sega Master System": "segaMS",
                    "Sega CD": "segaCD",
                    "Atari Lynx": "lynx",
                    "Sega 32X": "sega32x",
                    "Atari Jaguar": "jaguar",
                    "Sega Game Gear": "segaGG",
                    "Sega Saturn": "segaSaturn",
                    "Atari 7800": "atari7800",
                    "Atari 2600": "atari2600",
                    "NEC TurboGrafx-16/SuperGrafx/PC Engine": "pce",
                    "NEC PC-FX": "pcfx",
                    "SNK NeoGeo Pocket (Color)": "ngp",
                    "Bandai WonderSwan (Color)": "ws",
                    "ColecoVision": "coleco",
                    "Commodore 64": "vice_x64sc",
                    "Commodore 128": "vice_x128",
                    "Commodore VIC20": "vice_xvic",
                    "Commodore Plus/4": "vice_xplus4",
                    "Commodore PET": "vice_xpet"
                }

                const cores = Object.keys(coreValues).sort().reduce(
                    (obj, key) => { 
                        obj[key] = coreValues[key]; 
                        return obj;
                    }, 
                    {}
                );

            })
        })(parts.pop())  
        const div = document.createElement("div")
        const sub = document.createElement("div")
        const script = document.createElement("script")

        sub.id = "game"
        div.id = "display"
        div.appendChild(sub)
        document.body.appendChild(div)

        //console.log(core)

        window.EJS_player = "#game";
        window.EJS_gameName = parts.shift();
        window.EJS_biosUrl = "";
        if (core === "mame2003_plus") {
            window.EJS_gameUrl = filepath;
        }else {
            window.EJS_gameUrl = url
        }
        
        window.EJS_core = core;
        window.EJS_pathtodata = "../data/";
        window.EJS_startOnLoaded = false;
        window.EJS_alignStartButton = "center"
        window.EJS_DEBUG_XX = enableDebug;
        window.EJS_disableDatabases = true;
        window.EJS_threads = enableThreads;
        window.EJS_language = language;

        script.src = "../data/loader.js";
        document.body.appendChild(script);                                        
    })   
}

async function loadEventFromCDN (filepath) {
    let enableDebug = false;
    let enableThreads = false;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.get('debug') == 1) {
        enableDebug = true;
    } else {
    }
    if (urlParams.get('threads') == 1) {
        if (window.SharedArrayBuffer) {
            enableThreads = true;
        } else {
        }
    } else {
    }
    //console.log("filepath:" + filepath);
    let language = urlParams.get('language');
    //console.log('language:' + language);
    if (language === null || language === undefined) {
        language = "en-US"
    }    
    //console.log("language:" + language);
    // 使用fetch获取文件
    //const filepath = 'contra.nes'; 
    const filename = filepath.split('/').pop();
    const gameName = filename.split('.')[0];
    let core = 'mame2003_plus';
        //console.log(filepath);
  
        const div = document.createElement("div")
        const sub = document.createElement("div")
        const script = document.createElement("script")

        sub.id = "game"
        div.id = "display"
        div.appendChild(sub)
        document.body.appendChild(div)

        //console.log(core)

        window.EJS_player = "#game";
        window.EJS_gameName = gameName;//parts.shift();
        window.EJS_biosUrl = "";
        window.EJS_gameUrl = filepath;
        
        window.EJS_core = core;
        window.EJS_pathtodata = "../data/";
        window.EJS_startOnLoaded = false;
        window.EJS_DEBUG_XX = enableDebug;
        window.EJS_disableDatabases = true;
        window.EJS_threads = enableThreads;
        window.EJS_language = language;

        script.src = "../data/loader.js";
        document.body.appendChild(script);                                        

}