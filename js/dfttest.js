/*

ボタン押す
画像ファイル入力
モーダル作成
画像ファイル読み取り
画像読み取り
キャンバス描画
ピクセル値読み取り
対角線交換
横方向フーリエ変換re,im
立て方向フーリエ変換re,im
フーリエ変換描画
パワースペクトル作成
パワースペクトル描画
モーダル消去

再構成エリア作成



*/


window.addEventListener('load',()=>{

    //--- debug
    console.log("add event listener window onload");


    const inputButton = document.getElementById("inputButton");
    const outArea = document.getElementById("outArea");


    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    // スコープを狭くする予定
    const cvs = document.createElement("canvas");
    const ctx = cvs.getContext("2d");

    //--- debug
    console.dir(inputButton);
    console.dir(outArea);
    //;console.dir(outImage);  // なぜか表示される
    console.dir(input);

    //outImage.innerHTML+= "unko";

    input.addEventListener("change",(evt)=>{                              // 入力が変更されたら
        console.log(evt);
        console.dir(evt.target);

        if(evt.target.files.length === 0){                                      // 入力にファイルが一つもない時
            console.log("no file inputted.");
            return;
        }

        Promise.resolve(
            evt.target.files[0]
        ).then((file) => {  return new Promise(                                 // 入力先頭ファイルの読み込み
            (resolve,reject)=>{
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
        );}).then((data) => {   return new Promise(                             // 画像読み込み
            (resolve,reject) => {
                console.log("now reading data");
                const img = new Image();
                img.onload = function(){
                    //console.dir(img);
                    console.log("success load image. width : "+img.naturalWidth+", height : "+img.naturalHeight);
                    cvs.width = img.naturalWidth;
                    cvs.height = img.naturalHeight;

                    console.log("canvas set width : "+cvs.width+", height : "+cvs.height);
                    ctx.drawImage(img,0,0,cvs.width,cvs.height); // キャンバスに画像を描画

                    //とりあえずinputImage.classList.add("responsiveImg");              // 画像にクラスを指定

                    //outArea.appendChild(img);                        // DOMに追加
                    //outArea.innerHTML += "chinnko";

                    //debug start
                    const x = document.createElement("canvas");
                    const y = ctx.getImageData(0,0,cvs.width,cvs.height);
                    x.width = y.width;
                    x.height = y.height;
                    const z = x.getContext("2d");
                    z.putImageData(y,0,0);
                    outArea.appendChild(x);
                    outArea.innerHTML+="unko";
                    //debug end

                    const originImageData = ctx.getImageData(0,0,cvs.width,cvs.height);
                    setTimeout(()=>{resolve(originImageData)},0);
                };
                img.onerror = function(){
                    reject("image load error");
                };
                img.src = data;
            }
        );}).then((imgData) => {  return new Promise(                           // 画像処理(白黒化)
            (resolve,reject) => {
                if(false){
                    resolve(imgData);                                           // カラーの場合そのまま流す
                }else{
                    const grayImageData = ctx.createImageData(imgData);
                    for(let i=0,max=grayImageData.width*grayImageData.height*4;i<max;i+=4){
                        let tmp = imgData.data[i+0]*0.299 + imgData.data[i+1]*0.587 + imgData.data[i+2]*0.114;
                        grayImageData.data[i+0] = grayImageData.data[i+1] = grayImageData.data[i+2] = tmp;
                        grayImageData.data[i+3] = imgData.data[i+3];
                    }
                    //debug start
                    const tmpCvs    = document.createElement("canvas");
                    tmpCvs.width    = grayImageData.width;
                    tmpCvs.height   = grayImageData.height;
                    const tmpCtx    = tmpCvs.getContext("2d");
                    tmpCtx.putImageData(grayImageData,0,0);
                    outArea.appendChild(tmpCvs);
                    // debug end
                    resolve(grayImageData);
                }
            }
        );}).then((imgData) => {    return new Promise(                         // 画像処理(フーリエ変換)
            (resolve,reject)=>{
                if(false){
                    resolve([imgData,imgData]);                                     // カラーの場合未実装
                }else{
                    Promise.resolve().then(() => {  return new Promise(                 // 横フーリエ 各行毎に処理を分割して返す。
                        (resolve,reject)=>{
                            let realBuffer   = new Float32Array(imgData.width*imgData.height);
                            let imaginBuffer = new Float32Array(imgData.width*imgData.height);
                            for(let i,max=realBuffer.length;i<max;i++){
                                realBuffer[i]   = 0;
                                imaginBuffer[i] = 0;
                            }
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
                                            resolve(i<imgData.height);
                                        }
                                    );},
                                    callback    = () => {   return new Promise(
                                        (resolve,reject) => {
                                            const bufferStart  = i*imgData.width;
                                            const coefficient  = 2*Math.PI/imgData.width;
                                            for(let j = 0,k=bufferStart;j<imgData.width;j++,k++){ // jは列番号
                                                for(let l=0,m=bufferStart*4;l<imgData.width;l++,m+=4){
                                                    realBuffer[k]   += imgData.data[m]*Math.cos(coefficient*j*l);
                                                    imaginBuffer[k] -= imgData.data[m]*Math.sin(coefficient*j*l);
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
                                //console.log(realBuffer);
                                console.log("横フーリエ終了");

                                // debug start
                                const temp = ctx.createImageData(imgData);
                                    // 正規化用の最小値・最大値を求める
                                let min = realBuffer[0];
                                let max = realBuffer[0];
                                for(let i=0;i<realBuffer.length;i++){
                                    if(max<realBuffer[i])max=realBuffer[i];
                                    if(min>realBuffer[i])min=realBuffer[i];
                                }

                                const range = max-min;
                                for(let i=0,j=0,max=imgData.width*imgData.height*4;i<max;i+=4,j++){
                                    temp.data[i+0] = temp.data[i+1] = temp.data[i+2] =  (realBuffer[j]-min)/range*256;
                                    temp.data[i+3] = 255;
                                }
                                const tmpCvs    = document.createElement("canvas");
                                tmpCvs.width    = imgData.width;
                                tmpCvs.height   = imgData.height;
                                const tmpCtx    = tmpCvs.getContext("2d");
                                tmpCtx.putImageData(temp,0,0);
                                outArea.appendChild(tmpCvs);
                                console.log(temp.data);
                                //debug end

                                // debug start
                                const temp2 = ctx.createImageData(imgData);
                                    // 正規化用の最小値・最大値を求める
                                let min2 = imaginBuffer[0];
                                let max2 = imaginBuffer[0];
                                for(let i=0;i<imaginBuffer.length;i++){
                                    if(max2<imaginBuffer[i])max2=imaginBuffer[i];
                                    if(min2>imaginBuffer[i])min2=imaginBuffer[i];
                                }

                                const range2 = max2-min2;
                                for(let i=0,j=0,max=imgData.width*imgData.height*4;i<max;i+=4,j++){
                                    temp2.data[i+0] = temp2.data[i+1] = temp2.data[i+2] =  (imaginBuffer[j]-min2)/range2*256;
                                    temp2.data[i+3] = 255;
                                }
                                const tmpCvs2    = document.createElement("canvas");
                                tmpCvs2.width    = imgData.width;
                                tmpCvs2.height   = imgData.height;
                                const tmpCtx2    = tmpCvs2.getContext("2d");
                                tmpCtx2.putImageData(temp2,0,0);
                                outArea.appendChild(tmpCvs2);
                                console.log(temp2.data);
                                //debug end
                                console.log("横フーリエ画像描画終了");
                                resolve([realBuffer,imaginBuffer]);
                            });
                        }
                    );}).then((bufferSet) => {   return new Promise(                             // 縦フーリエ
                        (resolve,reject) => {
                            const real   = bufferSet[0];
                            const imagin = bufferSet[1];
                            let realBuffer   = new Float32Array(bufferSet[0].length);
                            let imaginBuffer = new Float32Array(bufferSet[1].length);
                            for(let i;i<realBuffer.length;i++){
                                realBuffer[i]   = 0;
                                imaginBuffer[i] = 0;
                            }
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
                                            resolve(i<imgData.width);
                                        }
                                    );},
                                    callback    = () => {   return new Promise(
                                        (resolve,reject) => {
                                            const coefficient = 2*Math.PI/imgData.height;
                                            //const bufferStart = i;
                                            for(let j = 0,k = i;j<imgData.height;j++,k+=imgData.width){
                                                for(let l = 0,m = i;l<imgData.height;l++,m+=imgData.width){
                                                    realBuffer[k]   += real[m]*Math.cos(coefficient*j*l)+imagin[m]*Math.sin(coefficient*j*l);
                                                    imaginBuffer[k] += imagin[m]*Math.cos(coefficient*j*l)-real[m]*Math.sin(coefficient*j*l);
                                                }
                                            }
                                            /*
                                            const bufferStart  = i;
                                            const coefficient  = 2*Math.PI*i/imgData.height;
                                            for(let j = 0,k=bufferStart;j<imgData.height;j++,k+=imgData.width){ // jは列番号
                                                for(let l=0,m=bufferStart*4;l<imgData.height;l++,m+=4){
                                                    realBuffer[k]   += imgData.data[m]/256*Math.cos(coefficient*l);
                                                    imaginBuffer[k] -= imgData.data[m]*Math.sin(coefficient*l);
                                                }
                                            }
                                            */
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

                                // debug start
                                const temp = ctx.createImageData(imgData);
                                    // 正規化用の最小値・最大値を求める
                                let min = realBuffer[0];
                                let max = realBuffer[0];
                                for(let i=0;i<realBuffer.length;i++){
                                    if(max<realBuffer[i])max=realBuffer[i];
                                    if(min>realBuffer[i])min=realBuffer[i];
                                }

                                const range = max-min;
                                for(let i=0,j=0,max=imgData.width*imgData.height*4;i<max;i+=4,j++){
                                    temp.data[i+0] = temp.data[i+1] = temp.data[i+2] =  (realBuffer[j]-min)/range*256;
                                    temp.data[i+3] = 255;
                                }
                                const tmpCvs    = document.createElement("canvas");
                                tmpCvs.width    = imgData.width;
                                tmpCvs.height   = imgData.height;
                                const tmpCtx    = tmpCvs.getContext("2d");
                                tmpCtx.putImageData(temp,0,0);
                                outArea.appendChild(tmpCvs);
                                console.log(temp.data);
                                //debug end

                                // debug start
                                const temp2 = ctx.createImageData(imgData);
                                    // 正規化用の最小値・最大値を求める
                                let min2 = imaginBuffer[0];
                                let max2 = imaginBuffer[0];
                                for(let i=0;i<imaginBuffer.length;i++){
                                    if(max2<imaginBuffer[i])max2=imaginBuffer[i];
                                    if(min2>imaginBuffer[i])min2=imaginBuffer[i];
                                }

                                const range2 = max2-min2;
                                for(let i=0,j=0,max=imgData.width*imgData.height*4;i<max;i+=4,j++){
                                    temp2.data[i+0] = temp2.data[i+1] = temp2.data[i+2] =  (imaginBuffer[j]-min2)/range2*256;
                                    temp2.data[i+3] = 255;
                                }
                                const tmpCvs2    = document.createElement("canvas");
                                tmpCvs2.width    = imgData.width;
                                tmpCvs2.height   = imgData.height;
                                const tmpCtx2    = tmpCvs2.getContext("2d");
                                tmpCtx2.putImageData(temp2,0,0);
                                outArea.appendChild(tmpCvs2);
                                console.log(temp2.data);
                                //debug end
                                console.log("縦フーリエ画像描画終了");
                                resolve([realBuffer,imaginBuffer,imgData.width,imgData.height]);
                            });
                        }
                    );}).then((data) => {
                        resolve(data);
                    });
                }
            }
        );}).then((bufferSet) => {   return new Promise(                        // 画像処理(パワースペクトル)
            (resolve,reject) => {
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
                /*
                const realImgData   = imgSet[0];
                const imaginImgData = imgSet[1];
                console.log(realImgData);
                console.log(imaginImgData);
                const powerImageData    = ctx.createImageData(realImgData);
                const coefficient       = 1 / Math.sqrt(2);
                for(let i=0,max=realImgData.width*realImgData.height*4;i<max;i+=4){
                    powerImageData.data[i+0] = Math.sqrt(realImgData.data[i+0]*realImgData.data[i+0]+imaginImgData.data[i+0]*imaginImgData.data[i+0])*coefficient;
                    powerImageData.data[i+1] = Math.sqrt(realImgData.data[i+1]*realImgData.data[i+1]+imaginImgData.data[i+1]*imaginImgData.data[i+1])*coefficient;
                    powerImageData.data[i+2] = Math.sqrt(realImgData.data[i+2]*realImgData.data[i+2]+imaginImgData.data[i+2]*imaginImgData.data[i+2])*coefficient;
                    powerImageData.data[i+3] = 255;
                }
                console.log(powerImageData);
                */
                // debug start
                const tmpCvs    = document.createElement("canvas");
                tmpCvs.width    = powerImageData.width;
                tmpCvs.height   = powerImageData.height;
                const tmpCtx    = tmpCvs.getContext("2d");
                tmpCtx.putImageData(powerImageData,0,0);
                outArea.appendChild(tmpCvs);
                console.log(powerImageData);
                // debug end
                resolve(powerImageData);
            }
        );}).then((originImageData) => {   return new Promise(                  // 画像処理(対角線交差)
            (resolve,reject) => {
                console.log("here processing");
                console.log(originImageData);
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
                //--debug start
                ctx.putImageData(shiftImageData,0,0);
                outArea.appendChild(cvs);
                //--debug end
                resolve(shiftImageData);
            }
        );}).then(                                                              // 終了宣言
            ()=>{
                console.log("end");
                //console.log("scope test");
                //cosnole.log(i);
                //console.log(max);
            }
        ).catch();
    },false);

    inputButton.addEventListener('click',()=>{
        console.log("inputButton clicked.");
        input.click();
    },false);

    console.log("init end.");

},false);
