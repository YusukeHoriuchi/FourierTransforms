window.addEventListener('load',()=>{
    console.log("window onload");

    let CancelFlag = false;
    let EndFlag = false;

    const input = document.getElementById("input");
    input.addEventListener("change",(evt)=>{                              // 入力が変更されたら
        console.log(evt);
        console.dir(evt.target);

        if(evt.target.files.length === 0){                                      // 入力にファイルが一つもない時
            console.log("no file inputted.");
            return;
        }

        (()=>{                                                                  // 出力場所の初期化
            const output = document.getElementById("output");
            output.innerHTML = "出力";
            const origin = document.getElementById("origin");
            origin.innerHTML = "";
            const gray   = document.getElementById("gray");
            gray.innerHTML = "";
            const rowRe  = document.getElementById("rowRe");
            rowRe.innerHTML = "";
            const rowIm  = document.getElementById("rowIm");
            rowIm.innerHTML = "";
            const colRe  = document.getElementById("colRe");
            colRe.innerHTML = "";
            const colIm  = document.getElementById("colIm");
            colIm.innerHTML = "";
            const power  = document.getElementById("power");
            power.innerHTML = "";
            const cross  = document.getElementById("cross");
            cross.innerHTML = "";
            const download = document.getElementById("download");
            download.innerHTML = "";
        })();

        Promise.resolve(
            evt.target.files[0]
        ).then((input)=>{return new Promise( // 表示
            (resolve,reject)=>{
                showModal.click();
                progress.innerHTML = "ファイルが入力されました";
                setTimeout(()=>{resolve(input);},500);
            }
        );}).then((file) => {  return new Promise(                                 // 入力先頭ファイルの読み込み
            (resolve,reject)=>{
                if(CancelFlag===true)reject();
                const reader = new FileReader();
                reader.onload = function(){
                    console.log("file readed. read result is");
                    resolve(reader.result);
                };
                reader.onerror = function(){
                    reject("file read error");
                }
                reader.readAsDataURL(file);
            }
        );}).then((input)=>{return new Promise( // 表示
            (resolve,reject)=>{
                progress.innerHTML = "ファイルの読み込みに成功";
                setTimeout(()=>{resolve(input);},500);
            }
        );}).then((data) => {   return new Promise(                             // 画像読み込み
            (resolve,reject) => {
                if(CancelFlag===true)reject();
                console.log("now reading data");
                const img = new Image();
                img.onload = ()=>{
                    console.log("success load image. width : "+img.naturalWidth+", height : "+img.naturalHeight);
                    const cvs = document.createElement("canvas");
                    cvs.width = img.naturalWidth;
                    cvs.height = img.naturalHeight;
                    const ctx = cvs.getContext("2d");
                    ctx.drawImage(img,0,0,cvs.width,cvs.height);
                    const originImageData = ctx.getImageData(0,0,cvs.width,cvs.height);
                    resolve(originImageData);
                };
                img.onerror = ()=>{
                    reject("image load error");
                };
                img.src = data;
            }
        );}).then((input)=>{return new Promise( // 表示
            (resolve,reject)=>{
                progress.innerHTML = "画像の読み込みに成功";
                setTimeout(()=>{resolve(input);},500);
            }
        );}).then((imgdata)=>{return new Promise(                               // ! 画像表示
            (resolve,reject)=>{
                const cvs = document.createElement("canvas");
                cvs.width = imgdata.width;
                cvs.height = imgdata.height;
                const ctx = cvs.getContext("2d");
                ctx.putImageData(imgdata,0,0);
                const img = new Image();
                img.onload = ()=>{
                    img.classList.add("responsiveImg");
                    const origin = document.getElementById("origin");
                    origin.innerHTML += "<h3>入力画像</h3>";
                    origin.appendChild(img);
                    setTimeout(()=>{resolve(imgdata);},50);
                };
                img.src = cvs.toDataURL("image/png");
            }
        );}).then((imgData) => {  return new Promise(                           // 画像処理(白黒化)
            (resolve,reject) => {
                if(CancelFlag===true)reject();
                if(false){
                    resolve(imgData);                                           // カラーの場合そのまま流す
                }else{
                    const cvs = document.createElement("canvas");
                    const ctx = cvs.getContext("2d");
                    const grayImageData = ctx.createImageData(imgData);
                    for(let i=0;i<grayImageData.data.length;i+=4){
                        let tmp = imgData.data[i+0]*0.299 + imgData.data[i+1]*0.587 + imgData.data[i+2]*0.114;
                        grayImageData.data[i+0] = grayImageData.data[i+1] = grayImageData.data[i+2] = tmp;
                        grayImageData.data[i+3] = imgData.data[i+3];
                    }
                    resolve(grayImageData);
                }
            }
        );}).then((input)=>{return new Promise( // 表示
            (resolve,reject)=>{
                progress.innerHTML = "グレイスケール変換終了";
                setTimeout(()=>{resolve(input);},500);
            }
        );}).then((imgdata)=>{return new Promise(                               // ! 画像表示
            (resolve,reject)=>{
                const cvs = document.createElement("canvas");
                cvs.width = imgdata.width;
                cvs.height = imgdata.height;
                const ctx = cvs.getContext("2d");
                ctx.putImageData(imgdata,0,0);
                const img = new Image();
                img.onload = ()=>{
                    img.classList.add("responsiveImg");
                    const gray = document.getElementById("gray");
                    gray.innerHTML += "<h3>白黒化</h3>";
                    gray.appendChild(img);
                    setTimeout(()=>{resolve(imgdata);},50);
                };
                img.src = cvs.toDataURL("image/png");
            }
        );}).then((imgData) => {    return new Promise(                         // ! 画像処理(フーリエ変換)
            (resolve,reject)=>{                                                     // (入力:ImageData 出力:[実数部配列,虚数部配列,横幅,高さ])
                if(false){
                    resolve([imgData,imgData]);                                     // カラーの場合未実装
                }else{
                    Promise.resolve().then(() => {  return new Promise(             // 横フーリエ 各行毎に処理を分割して返す。
                        (resolve,reject)=>{
                            let realBuffer   = new Float32Array(imgData.width*imgData.height);
                            let imaginBuffer = new Float32Array(imgData.width*imgData.height);
                            for(let i=0;i<realBuffer.length;i++){
                                realBuffer[i]   = 0;
                                imaginBuffer[i] = 0;
                            }
                            let TimeCount = Date.now();
                            let i; // iは行番号
                            (
                                (
                                    init        = () => {   return new Promise(
                                        (resolve,reject) => {
                                            i = 0;
                                            resolve();
                                        }
                                    );},
                                    condition   = () => {   return new Promise(
                                        (resolve,reject) => {
                                            if(CancelFlag===true)reject();
                                            const tmp = Date.now();
                                            if(tmp>TimeCount+500){
                                                TimeCount = tmp;
                                                progress.innerHTML = "横フーリエ変換 : " + (i/imgData.height*100).toFixed(2) + "%";
                                                setTimeout(()=>{resolve(i<imgData.height);},0);
                                            }else{
                                                resolve(i<imgData.height);
                                            }
                                        }
                                    );},
                                    callback    = () => {   return new Promise(
                                        (resolve,reject) => {
                                            const bufferStart  = i*imgData.width;
                                            const coefficient  = 2*Math.PI/imgData.width;
                                            for(let j = 0,k=bufferStart;j<imgData.width;j++,k++){ // jは列番号
                                                const coef = coefficient*j;
                                                for(let l=0,m=bufferStart*4;l<imgData.width;l++,m+=4){
                                                    realBuffer[k]   += imgData.data[m]*Math.cos(coef*l);
                                                    imaginBuffer[k] -= imgData.data[m]*Math.sin(coef*l);
                                                }
                                            }
                                            resolve();
                                        }
                                    );},
                                    increment   = () => {   return new Promise(
                                        (resolve,reject) => {
                                            i++;
                                            if(i%10===0)console.log(i);
                                            resolve();
                                        }
                                    );}
                                )=>{
                                    return new Promise(
                                        (resolve, reject)=>{
                                            init().then(_loop = () => {
                                                condition().then((result) => {
                                                    if (result)
                                                        callback().then(increment).then(_loop, reject);
                                                    else
                                                        resolve();
                                                    }, reject);
                                                }, reject);
                                        }
                                    );
                                }
                            )().then(() => {
                                console.log("横フーリエ終了");
                                resolve([realBuffer,imaginBuffer,imgData.width,imgData.height]);
                            }).catch(()=>{
                                progress.innerHTML="中止処理中";
                                setTimeout(()=>{
                                    closeModal.click();
                                    CancelFlag = false;
                                    EndFlag = false;
                                },500);
                            });
                        }
                    );}).then((input)=>{return new Promise( // 表示
                        (resolve,reject)=>{
                            progress.innerHTML = "横フーリエ変換終了";
                            setTimeout(()=>{resolve(input);},500);
                        }
                    );}).then((buffset)=>{return new Promise(                       // ! 画像表示
                        (resolve,reject)=>{                                             // (入力:[実数部配列,虚数部配列,横幅,高さ] 出力:素通り)
                            Promise.resolve().then(()=>{return new Promise(
                                (resolve,reject)=>{
                                    const cvs = document.createElement("canvas");
                                    cvs.width = buffset[2];
                                    cvs.height = buffset[3];
                                    const ctx = cvs.getContext("2d");
                                    const imgdata = ctx.createImageData(cvs.width,cvs.height);
                                    let min = buffset[0][0];
                                    let max = buffset[0][0];
                                    for(let i=0;i<buffset[0].length;i++){
                                        if(max<buffset[0][i])max=buffset[0][i];
                                        if(min>buffset[0][i])min=buffset[0][i];
                                    }
                                    const range = max-min;
                                    for(let i=0,j=0;i<imgdata.data.length;i+=4,j++){
                                        imgdata.data[i+0] = imgdata.data[i+1] = imgdata.data[i+2] = Math.sqrt(Math.sqrt((buffset[0][j]-min)/range))*256;
                                        imgdata.data[i+3] = 255;
                                    }
                                    ctx.putImageData(imgdata,0,0);
                                    const img = new Image();
                                    img.onload = ()=>{
                                        img.classList.add("responsiveImg");
                                        const rowRe = document.getElementById("rowRe");
                                        rowRe.innerHTML += "<h3>横フーリエ変換実数部</h3>";
                                        rowRe.appendChild(img);
                                        setTimeout(()=>{resolve();},50);
                                    };
                                    img.src = cvs.toDataURL("image/png");
                                }
                            );}).then(()=>{return new Promise(
                                (resolve,reject)=>{
                                    const cvs = document.createElement("canvas");
                                    cvs.width = buffset[2];
                                    cvs.height = buffset[3];
                                    const ctx = cvs.getContext("2d");
                                    const imgdata = ctx.createImageData(cvs.width,cvs.height);
                                    let min = buffset[1][0];
                                    let max = buffset[1][0];
                                    for(let i=0;i<buffset[1].length;i++){
                                        if(max<buffset[1][i])max=buffset[1][i];
                                        if(min>buffset[1][i])min=buffset[1][i];
                                    }
                                    const range = max-min;
                                    for(let i=0,j=0;i<imgdata.data.length;i+=4,j++){
                                        imgdata.data[i+0] = imgdata.data[i+1] = imgdata.data[i+2] = (buffset[1][j]-min)/range*256;
                                        imgdata.data[i+3] = 255;
                                    }
                                    ctx.putImageData(imgdata,0,0);
                                    const img = new Image();
                                    img.onload = ()=>{
                                        img.classList.add("responsiveImg");
                                        const rowIm = document.getElementById("rowIm");
                                        rowIm.innerHTML += "<h3>横フーリエ変換虚数部</h3>";
                                        rowIm.appendChild(img);
                                        setTimeout(()=>{resolve();},50);
                                    };
                                    img.src = cvs.toDataURL("image/png");
                                }
                            );}).then(()=>{
                                resolve(buffset);
                            });
                        }
                    );}).then((bufferSet) => {   return new Promise(                // 縦フーリエ
                        (resolve,reject) => {
                            const real   = bufferSet[0];
                            const imagin = bufferSet[1];
                            let realBuffer   = new Float32Array(bufferSet[0].length);
                            let imaginBuffer = new Float32Array(bufferSet[1].length);
                            for(let i;i<realBuffer.length;i++){
                                realBuffer[i]   = 0;
                                imaginBuffer[i] = 0;
                            }
                            let TimeCount = Date.now();
                            let i; // iは行番号
                            (
                                (
                                    init        = () => {   return new Promise(
                                        (resolve,reject) => {
                                            i = 0;
                                            resolve();
                                        }
                                    );},
                                    condition   = () => {   return new Promise(
                                        (resolve,reject) => {
                                            if(CancelFlag===true)reject();
                                            const tmp = Date.now();
                                            if(tmp>TimeCount+500){
                                                TimeCount = tmp;
                                                progress.innerHTML = "縦フーリエ変換 : " + (i/imgData.width*100).toFixed(2) + "%";
                                                setTimeout(()=>{resolve(i<imgData.width);},0);
                                            }else{
                                                resolve(i<imgData.width);
                                            }
                                        }
                                    );},
                                    callback    = () => {   return new Promise(
                                        (resolve,reject) => {
                                            const coefficient = 2*Math.PI/imgData.height;
                                            for(let j = 0,k = i;j<imgData.height;j++,k+=imgData.width){
                                                for(let l = 0,m = i;l<imgData.height;l++,m+=imgData.width){
                                                    realBuffer[k]   += real[m]*Math.cos(coefficient*j*l)+imagin[m]*Math.sin(coefficient*j*l);
                                                    imaginBuffer[k] += imagin[m]*Math.cos(coefficient*j*l)-real[m]*Math.sin(coefficient*j*l);
                                                }
                                            }
                                            resolve();
                                        }
                                    );},
                                    increment   = () => {   return new Promise(
                                        (resolve,reject) => {
                                            i++;
                                            if(i%10===0)console.log(i);
                                            resolve();
                                        }
                                    );}
                                )=>{
                                    return new Promise(
                                        (resolve, reject)=>{
                                            init().then(_loop = () => {
                                                condition().then((result) => {
                                                    if (result)
                                                        callback().then(increment).then(_loop, reject);
                                                    else
                                                        resolve();
                                                    }, reject);
                                                }, reject);
                                        }
                                    );
                                }
                            )().then(() => {
                                console.log("縦フーリエ終了");
                                resolve([realBuffer,imaginBuffer,imgData.width,imgData.height]);
                            }).catch(()=>{
                                progress.innerHTML="中止処理中";
                                setTimeout(()=>{
                                    closeModal.click();
                                    CancelFlag = false;
                                    EndFlag = false;
                                },500);
                            });
                        }
                    );}).then((input)=>{return new Promise( // 表示
                        (resolve,reject)=>{
                            progress.innerHTML = "縦フーリエ変換終了";
                            setTimeout(()=>{resolve(input);},500);
                        }
                    );}).then((buffset)=>{return new Promise(                       // ! 画像表示
                        (resolve,reject)=>{                                             // (入力:[実数部配列,虚数部配列,横幅,高さ] 出力:素通り)
                            Promise.resolve().then(()=>{return new Promise(
                                (resolve,reject)=>{
                                    const cvs = document.createElement("canvas");
                                    cvs.width = buffset[2];
                                    cvs.height = buffset[3];
                                    const ctx = cvs.getContext("2d");
                                    const imgdata = ctx.createImageData(cvs.width,cvs.height);
                                    let min = buffset[0][0];
                                    let max = buffset[0][0];
                                    for(let i=0;i<buffset[0].length;i++){
                                        if(max<buffset[0][i])max=buffset[0][i];
                                        if(min>buffset[0][i])min=buffset[0][i];
                                    }
                                    const range = max-min;
                                    for(let i=0,j=0;i<imgdata.data.length;i+=4,j++){
                                        imgdata.data[i+0] = imgdata.data[i+1] = imgdata.data[i+2] = Math.sqrt(Math.sqrt((buffset[0][j]-min)/range))*256;
                                        imgdata.data[i+3] = 255;
                                    }
                                    ctx.putImageData(imgdata,0,0);
                                    const img = new Image();
                                    img.onload = ()=>{
                                        img.classList.add("responsiveImg");
                                        const colRe = document.getElementById("colRe");
                                        colRe.innerHTML += "<h3>縦フーリエ変換実数部</h3>";
                                        colRe.appendChild(img);
                                        setTimeout(()=>{resolve();},50);
                                    };
                                    img.src = cvs.toDataURL("image/png");
                                }
                            );}).then(()=>{return new Promise(
                                (resolve,reject)=>{
                                    const cvs = document.createElement("canvas");
                                    cvs.width = buffset[2];
                                    cvs.height = buffset[3];
                                    const ctx = cvs.getContext("2d");
                                    const imgdata = ctx.createImageData(cvs.width,cvs.height);
                                    let min = buffset[1][0];
                                    let max = buffset[1][0];
                                    for(let i=0;i<buffset[1].length;i++){
                                        if(max<buffset[1][i])max=buffset[1][i];
                                        if(min>buffset[1][i])min=buffset[1][i];
                                    }
                                    const range = max-min;
                                    for(let i=0,j=0;i<imgdata.data.length;i+=4,j++){
                                        imgdata.data[i+0] = imgdata.data[i+1] = imgdata.data[i+2] = (buffset[1][j]-min)/range*256;
                                        imgdata.data[i+3] = 255;
                                    }
                                    ctx.putImageData(imgdata,0,0);
                                    const img = new Image();
                                    img.onload = ()=>{
                                        img.classList.add("responsiveImg");
                                        const colIm = document.getElementById("colIm");
                                        colIm.innerHTML += "<h3>縦フーリエ変換虚数部</h3>";
                                        colIm.appendChild(img);
                                        setTimeout(()=>{resolve();},50);
                                    };
                                    img.src = cvs.toDataURL("image/png");
                                }
                            );}).then(()=>{
                                resolve(buffset);
                            });
                        }
                    );}).then((data) => {                                           // 終了
                        resolve(data);
                    });
                }
            }
        );}).then((buffset)=>{return new Promise(                               // フーリエ変換の生データを画像化する
            (resolve,reject)=>{

                const realArray   = new Uint8ClampedArray(buffset[0].buffer);
                const imaginArray = new Uint8ClampedArray(buffset[1].buffer);

                const cvs = document.createElement("canvas");
                cvs.width = buffset[2];
                cvs.height = buffset[3];
                const ctx = cvs.getContext("2d");

                const realid   = ctx.createImageData(buffset[2],buffset[3]);
                const imaginid = ctx.createImageData(buffset[2],buffset[3]);
                for(let i = 0;i<realid.data.length;i++){
                    realid.data[i]   = realArray[i];
                    imaginid.data[i] = imaginArray[i];
                }

                const str = Date.now();
                console.log(str);

                // 実数領域の画像化、バイナリファイル化、URL化
                ctx.putImageData(realid,0,0);
                let base64 = cvs.toDataURL("image/png");
                let binary = atob(base64.replace(/^.*,/,''));
                let array  = new Uint8Array(binary.length);
                for(let i=0;i<binary.length;i++){array[i]=binary.charCodeAt(i);}
                let blob = new Blob([array.buffer],{type: "image/png"});
                let tmpURL = window.URL.createObjectURL(blob);
                const realA = document.getElementById("realrawdata");
                realA.download = "re_"+str+".png";
                realA.href = tmpURL;

                // 虚数領域の画像化、バイナリファイル化、URL化
                ctx.putImageData(imaginid,0,0);
                base64 = cvs.toDataURL("image/png");
                binary = atob(base64.replace(/^.*,/,''));
                array  = new Uint8Array(binary.length);
                for(let i=0;i<binary.length;i++){array[i]=binary.charCodeAt(i);}
                blob = new Blob([array.buffer],{type: "image/png"});
                tmpURL = window.URL.createObjectURL(blob);
                const imaginA = document.getElementById("imaginrawdata");
                imaginA.download = "im_"+str+".png";
                imaginA.href = tmpURL;

                // ボタンの追加
                const download = document.getElementById("download");
                download.innerHTML += "<h3>フーリエ変換計算データ</h3>";
                const button   = document.createElement("button");
                button.classList.add("btn","btn-primary");
                button.innerHTML = "計算データのダウンロード";
                button.type = "button";
                button.addEventListener("click",()=>{
                    realA.click();
                    imaginA.click();
                },false);
                download.appendChild(button);

                download.innerHTML += "<br><p>単精度浮動小数点で計算したフーリエ変換後の値を画像ファイルに格納したものをダウンロードします。<br>";
                download.innerHTML += "逆フーリエ変換プログラムで使用できます。(ファイル名は変更しないでください。)<br>";
                download.innerHTML += "詳細はこちら=> <a href=\"#\">逆フーリエ変換</a></p>";


                resolve(buffset);

            }
        );}).then((input)=>{return new Promise( // 表示
            (resolve,reject)=>{
                progress.innerHTML = "バッファの書き出し終了";
                setTimeout(()=>{resolve(input);},500);
            }
        );}).then((bufferSet) => {   return new Promise(                        // 画像処理(パワースペクトル)
            (resolve,reject) => {
                if(CancelFlag===true)reject();
                const cvs = document.createElement("canvas");
                const ctx = cvs.getContext("2d");
                const powerImageData = ctx.createImageData(bufferSet[2],bufferSet[3]);
                const buffer = new Float32Array(bufferSet[0].length);
                for(let i=0;i<bufferSet[0].length;i++){
                    buffer[i] = Math.sqrt(bufferSet[0][i]**2 + bufferSet[1][i]**2);
                }
                let min = buffer[0];
                let max = buffer[0];
                for(let i=0;i<buffer.length;i++){
                    if(min>buffer[i])min=buffer[i];
                    if(max<buffer[i])max=buffer[i];
                }
                const range = max - min;
                for(let i=0,j=0;i<buffer.length;i++,j+=4){
                    powerImageData.data[j+0] = powerImageData.data[j+1] = powerImageData.data[j+2] = Math.sqrt((buffer[i]-min)/range*256*256)*30;
                    powerImageData.data[j+3] = 255;
                }
                resolve(powerImageData);
            }
        );}).then((input)=>{return new Promise( // 表示
            (resolve,reject)=>{
                progress.innerHTML = "パワースペクトルの計算終了";
                setTimeout(()=>{resolve(input);},500);
            }
        );}).then((imgdata)=>{  return new Promise(                             // ! 画像表示
            (resolve,reject)=>{
                const cvs = document.createElement("canvas");
                cvs.width = imgdata.width;
                cvs.height = imgdata.height;
                const ctx = cvs.getContext("2d");
                ctx.putImageData(imgdata,0,0);
                const img = new Image();
                img.onload = ()=>{
                    img.classList.add("responsiveImg");
                    const power = document.getElementById("power");
                    power.innerHTML += "<h3>絶対値</h3>";
                    power.appendChild(img);
                    setTimeout(()=>{resolve(imgdata);},50);
                };
                img.src = cvs.toDataURL("image/png");
            }
        );}).then((originImageData) => {   return new Promise(                  // 画像処理(対角線交差)
            (resolve,reject) => {
                if(CancelFlag===true)reject();
                console.log("here processing");
                console.log(originImageData);
                const cvs = document.createElement("canvas");
                cvs.width = originImageData.width;
                cvs.height = originImageData.height;
                const ctx = cvs.getContext("2d");
                const shiftImageData  = ctx.createImageData(originImageData);

                const sW        = originImageData.width % 2 * 4;
                const sH        = originImageData.height % 2 * originImageData.width * 4;
                const halfPixel = originImageData.width * Math.floor(originImageData.height / 2) * 4;
                const maxWidth  = originImageData.width * 4;
                const halfWidth = Math.floor(originImageData.width / 2) * 4;

                console.log("halfWidth = "+halfWidth);
                for(let i = 0;i<halfPixel;i+=maxWidth){                     // 縦横のピクセル数に関わらず必ず行う
                    for(let j = 0;j<halfWidth;j+=4){
                        shiftImageData.data[i+j+0] = originImageData.data[i+j+halfPixel+halfWidth+0];
                        shiftImageData.data[i+j+1] = originImageData.data[i+j+halfPixel+halfWidth+1];
                        shiftImageData.data[i+j+2] = originImageData.data[i+j+halfPixel+halfWidth+2];
                        shiftImageData.data[i+j+3] = originImageData.data[i+j+halfPixel+halfWidth+3];
                        shiftImageData.data[i+j+halfWidth+0+sW] = originImageData.data[i+j+halfPixel+0];
                        shiftImageData.data[i+j+halfWidth+1+sW] = originImageData.data[i+j+halfPixel+1];
                        shiftImageData.data[i+j+halfWidth+2+sW] = originImageData.data[i+j+halfPixel+2];
                        shiftImageData.data[i+j+halfWidth+3+sW] = originImageData.data[i+j+halfPixel+3];
                        shiftImageData.data[i+j+halfPixel+0+sH] = originImageData.data[i+j+halfWidth+0];
                        shiftImageData.data[i+j+halfPixel+1+sH] = originImageData.data[i+j+halfWidth+1];
                        shiftImageData.data[i+j+halfPixel+2+sH] = originImageData.data[i+j+halfWidth+2];
                        shiftImageData.data[i+j+halfPixel+3+sH] = originImageData.data[i+j+halfWidth+3];
                        shiftImageData.data[i+j+halfPixel+halfWidth+0+sW+sH] = originImageData.data[i+j+0];
                        shiftImageData.data[i+j+halfPixel+halfWidth+1+sW+sH] = originImageData.data[i+j+1];
                        shiftImageData.data[i+j+halfPixel+halfWidth+2+sW+sH] = originImageData.data[i+j+2];
                        shiftImageData.data[i+j+halfPixel+halfWidth+3+sW+sH] = originImageData.data[i+j+3];
                    }
                }

                if(sW!==0){                                                 // 幅が奇数の時
                    for(let j=halfWidth;j<halfPixel;j+=maxWidth){
                        shiftImageData.data[j+0] = originImageData.data[j+halfPixel+halfWidth+0+sH];
                        shiftImageData.data[j+1] = originImageData.data[j+halfPixel+halfWidth+1+sH];
                        shiftImageData.data[j+2] = originImageData.data[j+halfPixel+halfWidth+2+sH];
                        shiftImageData.data[j+3] = originImageData.data[j+halfPixel+halfWidth+3+sH];
                        shiftImageData.data[j+halfPixel+0+sH] = originImageData.data[j+halfWidth+0];
                        shiftImageData.data[j+halfPixel+1+sH] = originImageData.data[j+halfWidth+1];
                        shiftImageData.data[j+halfPixel+2+sH] = originImageData.data[j+halfWidth+2];
                        shiftImageData.data[j+halfPixel+3+sH] = originImageData.data[j+halfWidth+3];
                    }
                }
                if(sH!==0){                                                 // 高さが奇数の時
                    for(let j = halfPixel,max = halfWidth+halfPixel;j<max;j+=4){
                        shiftImageData.data[j+0]   = originImageData.data[j+halfPixel+halfWidth+0+sW];
                        shiftImageData.data[j+1]   = originImageData.data[j+halfPixel+halfWidth+1+sW];
                        shiftImageData.data[j+2]   = originImageData.data[j+halfPixel+halfWidth+2+sW];
                        shiftImageData.data[j+3]   = originImageData.data[j+halfPixel+halfWidth+3+sW];
                        shiftImageData.data[j+halfWidth+0+sW] = originImageData.data[j+halfPixel+0];
                        shiftImageData.data[j+halfWidth+1+sW] = originImageData.data[j+halfPixel+1];
                        shiftImageData.data[j+halfWidth+2+sW] = originImageData.data[j+halfPixel+2];
                        shiftImageData.data[j+halfWidth+3+sW] = originImageData.data[j+halfPixel+3];
                    }
                }
                if(sW!==0 && sH!==0){                                       // 幅も高さも奇数の時
                    shiftImageData.data[halfPixel+halfWidth+0] = originImageData.data[halfPixel+halfPixel+halfWidth+halfWidth+0];
                    shiftImageData.data[halfPixel+halfWidth+1] = originImageData.data[halfPixel+halfPixel+halfWidth+halfWidth+1];
                    shiftImageData.data[halfPixel+halfWidth+2] = originImageData.data[halfPixel+halfPixel+halfWidth+halfWidth+2];
                    shiftImageData.data[halfPixel+halfWidth+3] = originImageData.data[halfPixel+halfPixel+halfWidth+halfWidth+3];
                }
                /*
                //--debug start
                ctx.putImageData(shiftImageData,0,0);
                outArea.appendChild(cvs);
                //--debug end
                */
                resolve(shiftImageData);
            }
        );}).then((input)=>{return new Promise( // 表示
            (resolve,reject)=>{
                progress.innerHTML = "パワースペクトル画像の生成終了";
                setTimeout(()=>{resolve(input);},500);
            }
        );}).then((imgdata)=>{  return new Promise(                             // ! 画像表示
            (resolve,reject)=>{
                const cvs = document.createElement("canvas");
                cvs.width = imgdata.width;
                cvs.height = imgdata.height;
                const ctx = cvs.getContext("2d");
                ctx.putImageData(imgdata,0,0);
                const img = new Image();
                img.onload = ()=>{
                    img.classList.add("responsiveImg");
                    const cross = document.getElementById("cross");
                    cross.innerHTML += "<h3>パワースペクトル画像</h3>";
                    cross.appendChild(img);
                    setTimeout(()=>{resolve(imgdata);},50);
                };
                img.src = cvs.toDataURL("image/png");
            }
        );}).then(                                                              // 終了宣言
            ()=>{
                EndFlag = true;
                progress.innerHTML = "終了";
                cancel.classList.add("disabled");
                setTimeout(()=>{
                    closeModal.click();
                    EndFlag=false;
                    CancelFlag=false;
                    cancel.classList.remove("disabled");
                },500);
                console.log("end");
                //console.log("scope test");
                //cosnole.log(i);
                //console.log(max);
            }
        ).catch((e)=>{
            progress.innerHTML="中止処理中";
            console.log(e);
            setTimeout(()=>{
                closeModal.click();
                CancelFlag = false;
                EndFlag = false;
            },500);
        });
    },false);
    console.dir(input);

    const inputButton = document.getElementById("inputButton");
    inputButton.addEventListener('click',()=>{
        console.log("inputButton clicked.");
        input.click();
    },false);
    console.dir(inputButton);

    const progress = document.getElementById("progress");
    console.dir(progress);

    const showModal = document.getElementById("showModal");
    console.dir(showModal);

    const closeModal = document.getElementById("closeModal");
    console.dir(closeModal);

    const cancel = document.getElementById("cancel");
    cancel.addEventListener("click",()=>{CancelFlag=true;},false);
    console.dir(cancel);

    const close = document.getElementById("close");
    close.addEventListener("click",()=>{
        if(EndFlag === true){
            closeModal.click();
            EndFlag = false;
            CancelFlag = false;
        }else{
            progress.innerHTML = "中止処理中";
            cancel.click();
        }
    },false);
    console.dir(cancel);

    console.log("init end.");

},false);
