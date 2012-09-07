function QRCode() {
    this.XOR = "101010000010010"; // 0x5412
    this.version = null; // ?
    this.errorCorrectLevel = null; // ??????? 01=L 00=M 11=Q 10=H
    this.maskpattern = null; // ???????
    this.modulesize = null;// ?????????
    this.pixcel = new Array(); // ???????????
    this.functionPattern = new Array();// ?????????????????
    this.sirial = ""; // ????
}

QRCode.prototype = {
    getContents : function(src){
        var image = new Image();
        image.src = src;
        var canvas_qr = document.getElementById("qr-canvas");
        var context = canvas_qr.getContext('2d');
        context.drawImage(image, 0, 0);
        var imagedata = context.getImageData(0, 0, image.width, image.height);
        return this.getContsnts(imagedata);

    },
    getContsnts : function(imagedata){
        imagedata.getPoints = function(x, y){
            if (this.width < x) {
                throw new Error("point error");
            }
            if (this.height < y) {
                throw new Error("point error");
            }
            point = (x * 4) + (y * this.width * 4);
            p = new RGBColor(this.data[point], this.data[point + 1], this.data[point + 2], this.data[point + 3]);
            return p;
        }
        imagedata = this.binarize(imagedata, 0.5);
        this.readData(imagedata);
        var simbolsize = version * 4 + 17;
        this.version = version;
        var mode = true;
        var ecl = 0;
        if(errorCorrectLevel == "01"){
            ecl = 0;
        }else if(errorCorrectLevel == "00"){
            ecl = 1;
        }else if(errorCorrectLevel == "11"){
            ecl = 2;
        }else if(errorCorrectLevel == "10"){
            ecl = 3;
        }
        var dataCode = new BlockMap(version,ecl);
        for(i = simbolsize - 1;i > 0;i = i - 2){
            if(mode){
                for(j = simbolsize - 1;j >= 0;j--){
                    if(!this.isFunctionPattern(j, i)){
                        dataCode.push(this.unmusk(j, i));
                    }
                    if(!this.isFunctionPattern(j, i - 1)){
                        dataCode.push(this.unmusk(j,i - 1));
                    }
                }
                mode = false;
            }else{
                for(j = 0;j < simbolsize;j++){
                    if(!this.isFunctionPattern(j, i)){
                        dataCode.push(this.unmusk(j,i));
                    }
                    if(!this.isFunctionPattern(j, i - 1)){
                        dataCode.push(this.unmusk(j,i - 1));
                    }
                }
                mode = true;
            }
            if(i == 8){
                i--;
            }
        }
        dataCode.makeDataBlock(version,ecl);
        this.sirial = dataCode.silialize(version,ecl);
        return this.getString(this.sirial);
    },
    /**
	 * ImageData????
	 *
	 * @param imageData
	 *            ?????ImageData
	 * @param threshold
	 *            ?? 0 ~ 1.0 ?????0.5
	 * @return ????ImageData
	 */
    binarize : function (imageData, threshold) {
        var pixels = imageData.data;
        var length = pixels.length;

        if (isNaN(threshold)) {
            threshold = 0.5;
        }

        threshold *= 255;

        for (var i = 0; i < length;) {
            var average = pixels[i] + pixels[i + 1] + pixels[i + 2] / 3;

            pixels[i++] = pixels[i++] = pixels[i++] = average <= threshold ? 0 : 255;
            pixels[i++] = 255;
        }

        return imageData;
    },
    /*
	 * ????????????????
	 */
    readData : function(imagedata){
        var firstpoint = null;
        var lastpoint = null;
        var findpoint = null;
        for(i = 0;i < imagedata.width;i++){
            for(j = 0;j < imagedata.height;j++){
                // firstpoint
                if(imagedata.getPoints(i,j).isDark() && firstpoint == null){
                    firstpoint = [i,j];
                }
                // finderpattern
                if(!imagedata.getPoints(i,j).isDark() && firstpoint != null && findpoint == null){
                    findpoint = [i,j];
                }
                // last Darkpoint
                if(imagedata.getPoints(i,j).isDark()){
                    lastpoint = [i,j];
                }
            }
            if(firstpoint != null && findpoint != null){
                break;
            }
        }
        modulesize = (findpoint[1] -firstpoint[1]) / 7;
        modulesize = Math.floor(modulesize);
        version = (((lastpoint[1] - firstpoint[1]) + 1) / modulesize - 17) / 4;
        version = Math.floor(version);
        var simbolsize = version * 4 + 17;
        // simbol matrix init
        var pix = new Array(simbolsize);
        for(i=0;i < simbolsize;i++){
            pix[i] = new Array(simbolsize);
        }
        for(i = 0;i < simbolsize;i++){
            for(j = 0;j < simbolsize;j++){
                half = modulesize / 2;
                half = Math.floor(half);
                point_y = firstpoint[0] + (i * modulesize) + half;
                point_x = firstpoint[1] + (j * modulesize) + half;
                pix[i][j] = imagedata.getPoints(point_x,point_y).isDark();
            }
        }

        this.pixcel = pix;

        var format_info1 = "";
        var format_info2 = "";

        // [8][0]
        if(this.pixcel[8][0]){
            format_info1 = "1";
        }else{
            format_info1 = "0";
        }
        // [8][1]
        if(this.pixcel[8][1]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [8][2]
        if(this.pixcel[8][2]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [8][3]
        if(this.pixcel[8][3]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [8][4]
        if(this.pixcel[8][4]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [8][5]
        if(this.pixcel[8][5]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [8][7]
        if(this.pixcel[8][7]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [8][8]
        if(this.pixcel[8][8]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [7][8]
        if(this.pixcel[7][8]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [5][8]
        if(this.pixcel[5][8]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [4][8]
        if(this.pixcel[4][8]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [3][8]
        if(this.pixcel[3][8]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [2][8]
        if(this.pixcel[2][8]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [1][8]
        if(this.pixcel[1][8]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }
        // [0][8]
        if(this.pixcel[0][8]){
            format_info1 += "1";
        }else{
            format_info1 += "0";
        }

        for(i = 1;i < 8;i++){
            if(this.pixcel[simbolsize - i][8]){
                format_info2 += "1";
            }else{
                format_info2 += "0";
            }
        }
        for(i = 0;i < 8;i++){
            if(this.pixcel[8][simbolsize - (8 - i)]){
                format_info2 += "1";
            }else{
                format_info2 += "0";
            }
        }

        if(format_info1 != format_info2){
            throw new Error("Format Info Error!");
        }
        var formatInfo = "";
        for(i = 0;i < 15;i++){
            if(format_info1.charAt(i) == this.XOR.charAt(i)){
                formatInfo += "0";
            }else{
                formatInfo += "1";
            }
        }
        errorCorrectLevel = formatInfo.substring(0,2);
        maskpattern =  formatInfo.substring(2,5);

        this.makeFunctionPattern();
    },
    getDataBlock : function(){

    },
    /*
	 * ?????
	 */
    unmusk : function(i,j){
        switch (maskpattern){
            case "000" :
                if((i + j) % 2 == 0){
                    if(!this.pixcel[i][j]){
                        return true;
                    }else{
                        return false;
                    }
                }
                return this.pixcel[i][j];
            case "001" :
                if(i % 2 == 0){
                    if(!this.pixcel[i][j]){
                        return true;
                    }else{
                        return false;
                    }
                }
                return this.pixcel[i][j];
            case "010" :
                if(j % 3 == 0){
                    if(!this.pixcel[i][j]){
                        return true;
                    }else{
                        return false;
                    }
                }
                return this.pixcel[i][j];
            case "011" :
                if((i + j) % 3 == 0){
                    if(!this.pixcel[i][j]){
                        return true;
                    }else{
                        return false;
                    }
                }
                return this.pixcel[i][j];
            case "100" :
                if((Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0){
                    if(!this.pixcel[i][j]){
                        return true;
                    }else{
                        return false;
                    }
                }
                return this.pixcel[i][j];
            case "101" :
                if((i * j) % 2 + (i * j) % 3 == 0){
                    if(!this.pixcel[i][j]){
                        return true;
                    }else{
                        return false;
                    }
                }
                return this.pixcel[i][j];
            case "110" :
                if(( (i * j) % 2 + (i * j) % 3) % 2 == 0){
                    if(!this.pixcel[i][j]){
                        return true;
                    }else{
                        return false;
                    }
                }
                return this.pixcel[i][j];
            case "111" :
                if(( (i * j) % 3 + (i + j) % 2) % 2 == 0){
                    if(!this.pixcel[i][j]){
                        return true;
                    }else{
                        return false;
                    }
                }
                return this.pixcel[i][j];

            default :
                throw new Error("bad maskPattern:" + maskPattern);
        }
    },
    /*
	 * ?????????????
	 */
    isFunctionPattern : function(i,j){
        return this.functionPattern[i][j];

    },
    /*
	 *
	 */
    blockMap : function(){
        var dataCode = new Array();
        var rsBlock = new Array();
    },
    /*
	 * ?????????????
	 */
    makeFunctionPattern : function(){
        var simbolsize = version * 4 + 17;
        var funcpattern = new Array(simbolsize);
        for(i = 0;i < simbolsize;i++){
            funcpattern[i] = new Array(simbolsize);
        }
        for(i = 0;i < simbolsize;i++){
            for(j = 0;j < simbolsize;j++){
                funcpattern[i][j] = false;
            }
        }

        // ????????+??????
        // Left Top
        for(i = 0;i < 8;i++){
            for(j = 0;j < 8;j++){
                funcpattern[i][j] = true;
            }
        }
        // Right Top
        for(i = 0;i < 8;i++){
            for(j = 1;j < 9;j++){
                funcpattern[i][simbolsize - j] = true;
            }
        }
        // Left Down
        for(i = 1;i < 9;i++){
            for(j = 0;j < 8;j++){
                funcpattern[simbolsize - i][j] = true;
            }
        }
        this.functionPattern = funcpattern;
        // ?????????
        alignment_pattern =
        [[],[6, 18],[6, 22],[6, 26],[6, 30],[6, 34],[6, 22, 38],[6, 24, 42],
        [6, 26, 46],[6, 28, 50],[6, 30, 54],[6, 32, 58],[6, 34, 62],[6, 26, 46, 66],
        [6, 26, 48, 70],[6, 26, 50, 74],[6, 30, 54, 78],[6, 30, 56, 82],[6, 30, 58, 86],
        [6, 34, 62, 90],[6, 28, 50, 72, 94],[6, 26, 50, 74, 98],[6, 30, 54, 78, 102],
        [6, 28, 54, 80, 106],[6, 32, 58, 84, 110],[6, 30, 58, 86, 114],[6, 34, 62, 90, 118],
        [6, 26, 50, 74, 98, 122],[6, 30, 54, 78, 102, 126],[6, 26, 52, 78, 104, 130],
        [6, 30, 56, 82, 108, 134],[6, 34, 60, 86, 112, 138],[6, 30, 58, 86, 114, 142],
        [6, 34, 62, 90, 118, 146],[6, 30, 54, 78, 102, 126, 150],[6, 24, 50, 76, 102, 128, 154],
        [6, 28, 54, 80, 106, 132, 158],[6, 32, 58, 84, 110, 136, 162],[6, 26, 54, 82, 110, 138, 166],[6, 30, 58, 86, 114, 142, 170]];
        var alignment = alignment_pattern[version - 1];
        for(i = 0;i < alignment.length;i++){
            for(j = 0;j < alignment.length;j++){
                var row = alignment[i];
                var col = alignment[j];
                if(!this.functionPattern[row][col]){
                    for(r = -2;r <= 2;r++){
                        for(c = -2;c <= 2;c++){
                            funcpattern[row + r][col + c] = true;
                        }
                    }
                }
            }
        }
        // ?????????
        for(i = 8;i < simbolsize - 8;i++){
            funcpattern[6][i] = true;
            funcpattern[i][6] = true;
        }

        // ????(???????????????????????????????????)
        // [0][8]
        funcpattern[0][8] = true;
        // [1][8]
        funcpattern[1][8] = true;
        // [2][8]
        funcpattern[2][8] = true;
        // [3][8]
        funcpattern[3][8] = true;
        // [4][8]
        funcpattern[4][8] = true;
        // [5][8]
        funcpattern[5][8] = true;
        // [7][8]
        funcpattern[7][8] = true;
        // [8][8]
        funcpattern[8][8] = true;
        // [8][7]
        funcpattern[8][7] = true;
        // [8][5]
        funcpattern[8][5] = true;
        // [8][4]
        funcpattern[8][4] = true;
        // [8][3]
        funcpattern[8][3] = true;
        // [8][2]
        funcpattern[8][2] = true;
        // [8][1]
        funcpattern[8][1] = true;
        // [8][0]
        funcpattern[8][0] = true;
        for(i = 1;i < 9;i++){
            funcpattern[8][simbolsize - i] = true;
        }
        for(i = 1;i < 8;i++){
            funcpattern[simbolsize - (8 - i)][8] = true;
        }

        // ??????(4V+9,8)?????????
        funcpattern[simbolsize - 8][8] = true;
        // ?????7?????????
        if(version >=7){
            for(i = 0;i < 7;i++){
                for(j = 8;j < 12;j++){
                    funcpattern[i][simbolsize - j] = true;
                    funcpattern[simbolsize - j][i] = true;
                }
            }

        }

        this.functionPattern = funcpattern;

    },
    /*
	 * ?????????????
	 */
    getString : function(sirial){

        var mode = sirial.substring(0, 4);
        switch (mode){
            // Number mode
            case "0001" :
                return this.getNumber(sirial);
            // Alphabet mode
            case "0010" :
                return this.getAlphabet(sirial);
            // 8bitByte mode
            case "0100" :
                return this.get8bitBite(sirial);
            // Kanji mode
            case "1000" :
                return this.getKanji(sirial);
            // unknown mode(ECI etc...)
            default :
                return "";
        }
    },
    /*
	 * ?????
	 */
    getNumber : function(sirial){
        var str = "";
        var str_num = 0; // ??????
        var mode = "0001";
        var tmp = sirial.substr(4, this.getStrNum(mode));

        str_num =  parseInt(tmp,2);

        var bodybits = sirial.substr(4 + this.getStrNum(mode));

        var bitgroup = 10;
        for(i = 0;i < (str_num / 3);i++){
            if((i + 1) > (str_num /3)){
                if(str_num %3 == 1){
                    bitgroup = 4;
                }else{
                    bitgroup = 7;
                }
            }
            var temp = bodybits.substr(i * 10,bitgroup);
            var temp_str = new Number(parseInt(temp,2));
            str += temp_str.toString();

        }

        // ???????????
        if(str_num %3 == 0){
            var next_point = (str_num / 3) * 10;
            var next_mode = bodybits.substr(next_point,4);
            var next_bits = bodybits.substr(next_point);
            if(next_mode != "0000"){
                str += this.getString(next_bits);
            }
        }else{
            var offset = str_num / 3;
            offset = Math.floor(offset);
            var next_point = offset * 10 + bitgroup;
            var next_mode = bodybits.substr(next_point,4);
            var next_bits = bodybits.substr(next_point);
            if(next_mode != "0000"){
                str += this.getString(next_bits);
            }

        }
        return str;

    },
    /*
	 * ??????
	 */
    getAlphabet : function(sirial){
        var EI_SU_TABLE = {
            0:'0',
            1:'1',
            2:'2',
            3:'3',
            4:'4',
            5:'5',
            6:'6',
            7:'7',
            8:'8',
            9:'9',
            10:'A',
            11:'B',
            12:'C',
            13:'D',
            14:'E',
            15:'F',
            16:'G',
            17:'H',
            18:'I',
            19:'J',
            20:'K',
            21:'L',
            22:'M',
            23:'N',
            24:'O',
            25:'P',
            26:'Q',
            27:'R',
            28:'S',
            29:'T',
            30:'U',
            31:'V',
            32:'W',
            33:'X',
            34:'Y',
            35:'Z',
            36:' ',
            37:'$',
            38:'%',
            39:'*',
            40:'+',
            41:'-',
            42:'.',
            43:'/',
            44:':'
        };
        var str = "";
        var str_num = 0;
        var mode = "0010";
        var tmp = sirial.substr(4, this.getStrNum(mode));
        str_num =  parseInt(tmp,2);

        var bodybits = sirial.substr(4 + this.getStrNum(mode));

        var bitgroup = 11;
        for(i = 0;i < (str_num / 2);i++){
            if((str_num % 2) != 0){
                bitgroup = 6;
            }
            var temp = bodybits.substr(i * bitgroup,bitgroup);
            var temp_int = parseInt(temp,2);
            if((str_num % 2) != 0){
                str += EI_SU_TABLE[temp_int];
            }else{
                var upper = Math.floor(temp_int / 45);
                var lower = temp_int % 45;
                str += EI_SU_TABLE[upper] + EI_SU_TABLE[lower];
            }
        }

        // ???????????
        if((str_num % 2) == 0){
            var next_point = (str_num / 2) * 11;
            var next_mode = bodybits.substr(next_point,4);
            var next_bits = bodybits.substr(next_point);
            if(next_mode != "0000"){
                str += this.getString(next_bits);
            }
        }else{
            var offset = str_num / 2;
            offset = Math.floor(offset);
            var next_point = offset * 11 + bitgroup;
            var next_mode = bodybits.substr(next_point,4);
            var next_bits = bodybits.substr(next_point);
            if(next_mode != "0000"){
                str += this.getString(next_bits);
            }
        }

        return str;
    },
    /*
	 * 8?????????
	 */
    get8bitBite : function(sirial){
        var str = "";
        var str_num = 0;
        var mode = "0100";
        var tmp = sirial.substr(4, this.getStrNum(mode));
        str_num =  parseInt(tmp,2);
        var sjis_encoded = "";
        var byte_flag = false;
        var bodybits = sirial.substr(4 + this.getStrNum(mode));

        // 8bitByte????SJIS???????????
        for(i = 0;i < str_num;i++){
            var temp = bodybits.substr(i * 8,8);
            var bytes = parseInt(temp,2);
            if(this.isSJISEncode(bytes)){
                sjis_encoded += "%" + bytes.toString(16);
                byte_flag = true;
            }else if(byte_flag){
                sjis_encoded += "%" + bytes.toString(16);
                byte_flag = false;
            }else{
                sjis_encoded += String.fromCharCode(bytes);
            }
        }
        str = window["Unescape"+GetEscapeCodeType(sjis_encoded)](sjis_encoded);
        // str = UnescapeUTF8(EscapeUTF8(UnescapeSJIS(sjis_encoded)));

        // ???????????
        var next_point = str_num * 8;
        var next_mode = bodybits.substr(next_point,4);
        var next_bits = bodybits.substr(next_point);
        if(next_mode != "0000"){
            str += this.getString(next_bits);
        }

        return str;
    },
    /*
	 * 8bitBytemode SJIS
	 */
    isSJISEncode : function(bytes){
        // SJIS low
        if(bytes >= 128 && bytes <= 159){
            return true;
        // SJIS high
        }else if(bytes >= 224 && bytes <= 255){
            return true;
        }
        return false;
    },
    /*
	 * ?????
	 */
    getKanji : function(sirial){
        var str = "";
        var str_num = 0;
        var mode = "1000";
        var tmp = sirial.substr(4, this.getStrNum(mode));
        str_num =  parseInt(tmp,2);
        var sjis_encoded = "";
        var byte_flag = false;
        var bodybits = sirial.substr(4 + this.getStrNum(mode));

        for(i = 0;i < str_num;i++){
            var temp = bodybits.substr(i * 13,13);
            var intData = parseInt(temp,2);
            var upper = intData / 0xc0;
            var lower = intData % 0xc0;

            var temp2 = upper << 8;
            var tempWord = temp2 + lower;
            if(tempWord + 0x8140 <= 0x9FFC){
                wordCode = tempWord + 0x8140;
            }else{
                wordCode = tempWord + 0xC140;;
            }
            wordCodeDigit = wordCode.toString(16);
            escapeString = "%" + wordCodeDigit.substr(0,2);
            escapeString += "%" +  wordCodeDigit.substr(2,2);
            str += UnescapeUTF8(EscapeUTF8(UnescapeSJIS(escapeString)));

        }

        // ???????????
        var next_point = str_num * 13;
        var next_mode = bodybits.substr(next_point,4);
        var next_bits = bodybits.substr(next_point);
        if(next_mode != "0000"){
            str += this.getString(next_bits);
        }

        return str;

    },
    /*
	 * ??????????????
	 */
    getStrNum : function(mode){
        0
        switch (mode){
            case "0001" :
                if(this.version <= 9){
                    return 10;
                }else if(this.version <= 26){
                    return 12;
                }else{
                    return 14;
                }
            case "0010" :
                if(this.version <= 9){
                    return 9;
                }else if(this.version <= 26){
                    return 11;
                }else{
                    return 13;
                }
            case "0100" :
                if(this.version <= 9){
                    return 8;
                }else if(this.version <= 26){
                    return 16;
                }else{
                    return 16;
                }
            case "1000" :
                if(this.version <= 9){
                    return 8;
                }else if(this.version <= 26){
                    return 10;
                }else{
                    return 12;
                }
            default :
                return "Sorry ...";
        }
    }
}

function RGBColor(red,green,blue,alpha){
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;

    this.isDark = function(){
        if(this.red == 0 && this.blue == 0 && this.green == 0){
            return true;
        }else{
            return false;
        }
    }
}

function BlockMap(version,errorCorrectLevel){
    this.RS_BLOCK = [
    // L M Q H
    // 1
    [[1, 26, 19],[1, 26, 16],[1, 26, 13],[1, 26, 9]],
    // 2
    [[1, 44, 34],[1, 44, 28],[1, 44, 22],[1, 44, 16]],
    // 3
    [[1, 70, 55],[1, 70, 44],[2, 35, 17],[2, 35, 13]],
    // 4
    [[1, 100, 80],[2, 50, 32],[2, 50, 24],[4, 25, 9]],
    // 5
    [[1, 134, 108],[2, 67, 43],[2, 33, 15, 2, 34, 16],[2, 33, 11, 2, 34, 12]],
    // 6
    [[2, 86, 68],[4, 43, 27],[4, 43, 19],[4, 43, 15]],
    // 7
    [[2, 98, 78],[4, 49, 31],[2, 32, 14, 4, 33, 15],[4, 39, 13, 1, 40, 14]],
    // 8
    [[2, 121, 97],[2, 60, 38, 2, 61, 39],[4, 40, 18, 2, 41, 19],[4, 40, 14, 2, 41, 15]],
    // 9
    [[2, 146, 116],[3, 58, 36, 2, 59, 37],[4, 36, 16, 4, 37, 17],[4, 36, 12, 4, 37, 13]],
    // 10
    [[2, 86, 68, 2, 87, 69],[4, 69, 43, 1, 70, 44],[6, 43, 19, 2, 44, 20],[6, 43, 15, 2, 44, 16]],
    // 11
    [[4,101,81],
    [1,80,50,4,81,51],
    [4,50,22,4,51,23],
    [3,36,12,8,37,13]],
    // 12
    [[2, 116, 92, 2, 117, 93],[6, 58, 36, 2, 59, 37],[4, 46, 20, 6, 47, 21],[7, 42, 14, 4, 43, 15]],
    // 13
    [[4, 133, 107],[8, 59, 37, 1, 60, 38],[8, 44, 20, 4, 45, 21],[12, 33, 11, 4, 34, 12]],
    // 14
    [[3, 145, 115, 1, 146, 116],[4, 64, 40, 5, 65, 44],[11, 36, 16, 5, 37, 17],[11, 36, 12, 5, 37, 13]],
    // 15
    [[5, 109, 87, 1, 110, 88],[5, 65, 41, 5, 66, 42],[5, 54, 24, 7, 55, 25],[11, 36, 12, 7, 37, 13]],
    // 16
    [[5, 122, 98, 1, 123, 99],[7, 73, 45, 3, 74, 46],[15, 43, 19, 2, 44, 20],[3, 45, 15, 13, 46, 16]],
    // 17
    [[1, 135, 107, 5, 136, 108],[10, 74, 46, 1, 75, 47],[1, 50, 22, 15, 51, 23],[2, 42, 14, 17, 43, 15]],
    // 18
    [[5, 150, 120, 1, 151, 121],[9, 69, 43, 4, 70, 44],[17, 50, 22, 1, 51, 23],[2, 42, 14, 19, 43, 15]],
    // 19
    [[3, 141, 113, 4, 142, 114],[3, 70, 44, 11, 71, 45],[17, 47, 21, 4, 48, 22],[9, 39, 13, 16, 40, 14]],
    // 20
    [[3, 135, 107, 5, 136, 108],[3, 67, 41, 13, 68, 42],[15, 54, 24, 5, 55, 25],[15, 43, 15, 10, 44, 16]],
    // 21
    [[4, 144, 116, 4, 145, 117],[17, 68, 42],[17, 50, 22, 6, 51, 23],[19, 46, 16, 6, 47, 17]],
    // 22
    [[2, 139, 111, 7, 140, 112],[17, 74, 46],[7, 54, 24, 16, 55, 25],[34, 37, 13]],
    // 23
    [[4, 151, 121, 5, 152, 122],[4, 75, 47, 14, 76, 48],[11, 54, 24, 14, 55, 25],[16, 45, 15, 14, 46, 16]],
    // 24
    [[6, 147, 117, 4, 148, 118],[6, 73, 45, 14, 74, 46],[11, 54, 24, 16, 55, 25],[30, 46, 16, 2, 47, 17]],
    // 25
    [[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16]],
    // 26
    [[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17]],
    // 27
    [[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16]],
    // 28
    [[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16]],
    // 29
    [[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16]],
    // 30
    [[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16]],
    // 31
    [[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16]],
    // 32
    [[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16]],
    // 33
    [[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16]],
    // 34
    [[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17]],
    // 35
    [[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16]],
    // 36
    [[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16]],
    // 37
    [[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16]],
    // 38
    [[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16]],
    // 39
    [[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16]],
    // 40
    [[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]]
    ];

    var data = 0;
    var rs = 0;
    for(i = 0;i < this.RS_BLOCK[version - 1][errorCorrectLevel].length;i = i + 3){
        data = data + this.RS_BLOCK[version - 1][errorCorrectLevel][i] * this.RS_BLOCK[version - 1][errorCorrectLevel][i + 2];
        rs = rs + this.RS_BLOCK[version - 1][errorCorrectLevel][i] * (this.RS_BLOCK[version - 1][errorCorrectLevel][i + 1] - this.RS_BLOCK[version - 1][errorCorrectLevel][i + 2]);
    }
    this.dataCode = new Array(data);
    this.rsBlock = new Array(rs);

    for(i = 0;i < data;i++){
        this.dataCode[i] = "";
    }
    for(i = 0;i < rs;i++){
        this.rsBlock[i] = "";
    }

    this.blockPoint = 0;
    this.blockPoint_inner = 0;
    this.dataCodeflag = true;

    this.blockCount = new Array();
    for(i = 0;i < this.RS_BLOCK[version - 1][errorCorrectLevel].length;i = i + 3){
        for(j = 0;j < this.RS_BLOCK[version - 1][errorCorrectLevel][i];j++){
            this.blockCount.push(this.RS_BLOCK[version - 1][errorCorrectLevel][i + 2]);
        }
    }

    this.dataBlock = new Array(this.blockCount.length);
    for(i = 0;i < this.blockCount.length;i++){
        this.dataBlock[i] = new Array(this.blockCount[i]);
    }
    for(i = 0;i < this.dataBlock.length;i++){
        for(j = 0;j < this.dataBlock[i].lebgth;j++){
            this.dataBlock[i][j] = "";
        }
    }
}
BlockMap.prototype = {
    /*
	 * ???????????
	 */
    push : function(bits){
        if(this.blockPoint_inner >= 8){
            if(this.blockPoint == this.dataCode.length - 1 && this.dataCodeflag){
                this.dataCodeflag = false;
                this.blockPoint_inner = 0;
                this.blockPoint = 0;
            }else{
                this.blockPoint++;
                this.blockPoint_inner = 0;
            }
        }
        if(this.dataCodeflag){
            if(bits){
                this.dataCode[this.blockPoint] += "1";
            }else{
                this.dataCode[this.blockPoint] += "0";
            }
        }else{
            if(bits){
                this.rsBlock[this.blockPoint] += "1";
            }else{
                this.rsBlock[this.blockPoint] += "0";
            }
        }
        this.blockPoint_inner++;
    },
    /*
	 *
	 */
    makeDataBlock : function(version,errorCorrectLevel){
        var offset = 0;
        for(i = 0;i < this.blockCount.length;i++){
            for(j = 0;j < this.blockCount[i];j++){
                if(this.RS_BLOCK[version - 1][errorCorrectLevel].length > 3 && this.RS_BLOCK[version - 1][errorCorrectLevel][0] <= i && (this.RS_BLOCK[version - 1][errorCorrectLevel][5] - 1) <= j) {
                    offset = this.RS_BLOCK[version - 1][errorCorrectLevel][0];
                }
                this.dataBlock[i][j] = this.dataCode[(i + (j * this.blockCount.length)) - offset];
            }
            offset = 0;
        }
    },
    /*
	 *
	 */
    silialize : function(version,errorCorrectLevel){

        var sirial = "";

        for(i = 0;i < this.dataBlock.length;i++){
            for(j = 0;j < this.dataBlock[i].length;j++){
                sirial += this.dataBlock[i][j];
            }
        }

        return sirial;
    }
}
